#!/usr/bin/env node

/**
 * Offline test for the Streamable HTTP mode.
 *
 * Starts the server with test/fake-zerobounce-api.mjs preloaded, so no network or real
 * API key is needed. Covers routing and auth, every advertised tool, argument handling,
 * per-request API key isolation under concurrency, and the bind host.
 *
 * Usage: node test-http.js            (tests dist/index.js)
 *        ZB_MCP_SERVER=path node test-http.js
 */

/* eslint-env node */
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = process.env.ZB_MCP_SERVER || join(__dirname, 'dist', 'index.js');
const FAKE_API = join(__dirname, 'test', 'fake-zerobounce-api.mjs');

const workDir = mkdtempSync(join(tmpdir(), 'zb-mcp-http-'));
const LOG_FILE = join(workDir, 'requests.jsonl');

let failures = 0;
let passes = 0;

function check(condition, label, detail = '') {
  if (condition) {
    passes++;
    console.log(`  ok    ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`);
  }
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function startServer(args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', FAKE_API, SERVER_PATH, '--http', ...args], {
      env: { ...process.env, FAKE_ZB_LOG: LOG_FILE, ...env },
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    const timer = setTimeout(() => reject(new Error(`server did not start:\n${stderr}`)), 10000);
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
      const match = stderr.match(/listening on (http:\/\/\S+)\/mcp/);
      if (match) {
        clearTimeout(timer);
        resolve({ child, origin: match[1], stderr: () => stderr });
      }
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`server exited with ${code}:\n${stderr}`));
    });
  });
}

function stopServer(server) {
  return new Promise((resolve) => {
    server.child.removeAllListeners('exit');
    server.child.once('exit', resolve);
    server.child.kill();
  });
}

let nextId = 1;

/** POSTs a JSON-RPC message and returns { status, message } with SSE unwrapped. */
async function rpc(origin, method, params, headers = {}) {
  const response = await fetch(`${origin}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...headers,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
  });
  const text = await response.text();
  const data = text
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .map((line) => line.slice('data: '.length))
    .join('');
  let message = null;
  try {
    message = JSON.parse(data || text);
  } catch {
    message = null;
  }
  return { status: response.status, message, text };
}

const WARMUP_KEY_HEADER = 'X-ZeroBounce-Warmup-Api-Key';

/**
 * Warmup tools need the separate Warmup key. Sending the same value in both
 * headers keeps `loggedRequests(key)` working for either API: the fixture logs
 * the `api_key` parameter for validation calls and the `API-Key` header for
 * warmup ones.
 */
function callTool(origin, apiKey, name, args) {
  const headers = { 'X-ZeroBounce-Api-Key': apiKey };
  if (name.startsWith('warmup_')) {
    headers[WARMUP_KEY_HEADER] = apiKey;
  }
  return rpc(origin, 'tools/call', { name, arguments: args }, headers);
}

/** Every warmup request the fixture logged, whatever key it carried. */
function warmupRequests() {
  if (!existsSync(LOG_FILE)) {
    return [];
  }
  return readFileSync(LOG_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((entry) => entry.host === 'warmup-api.zerobounce.net');
}

function toolText(result) {
  return result.message?.result?.content?.map((c) => c.text).join('\n') ?? '';
}

function loggedRequests(apiKey) {
  if (!existsSync(LOG_FILE)) {
    return [];
  }
  return readFileSync(LOG_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((entry) => entry.apiKey === apiKey);
}

/** Sorted field names, for asserting that exactly the documented fields go out. */
function keysOf(fields) {
  return Object.keys(fields ?? {})
    .sort()
    .join(',');
}

const CSV = 'email,first,last,domain\nalice@example.com,Alice,Smith,example.com\n';
const HOOK = 'https://hooks.example.com/zerobounce';
const BULK_ROOT = 'https://bulkapi.zerobounce.net';

// The eight S3 / SFTP file jobs (ops 31-34, 36-39): one shared set of fields,
// one endpoint each.
const BULK_ROOT_JOBS = [
  ['validate_s3_file', '/validateS3file'],
  ['score_s3_file', '/scoreS3file'],
  ['email_finder_s3_file', '/emailFinderS3file'],
  ['domain_search_s3_file', '/domainSearchS3file'],
  ['validate_sftp_file', '/validateSFTPfile'],
  ['score_sftp_file', '/scoreSFTPfile'],
  ['email_finder_sftp_file', '/emailFinderSFTPfile'],
  ['domain_search_sftp_file', '/domainSearchSFTPfile'],
];

const WARMUP_FROM = 'sender@example.com';
// Not a credential: the fixture never connects to anything and nothing is stored.
const SMTP_PLACEHOLDER = 'placeholder-not-a-real-password';

// Valid arguments for every tool the server can expose.
const TOOL_ARGS = {
  validate_email: { email: 'valid@example.com' },
  validate_batch: { emails: ['a@example.com', 'b@example.com'] },
  get_credits: {},
  get_api_usage: { startDate: '2026-01-01', endDate: '2026-01-31' },
  bulk_validate_send_file: { fileContent: CSV, fileName: 'list.csv' },
  bulk_validate_file_status: { fileId: 'f1' },
  bulk_validate_get_file: { fileId: 'f1' },
  bulk_validate_delete_file: { fileId: 'f1' },
  bulk_ai_scoring_send_file: { fileContent: CSV, fileName: 'list.csv' },
  bulk_ai_scoring_file_status: { fileId: 'f1' },
  bulk_ai_scoring_get_file: { fileId: 'f1' },
  bulk_ai_scoring_delete_file: { fileId: 'f1' },
  score_email: { email: 'valid@example.com' },
  find_email: { firstName: 'Alice', domain: 'example.com' },
  domain_search: { domain: 'example.com' },
  get_activity_data: { email: 'valid@example.com' },
  bulk_email_finder_send_file: { fileContent: CSV, fileName: 'list.csv', domainColumn: 3 },
  bulk_email_finder_file_status: { fileId: 'f1' },
  bulk_email_finder_get_file: { fileId: 'f1' },
  bulk_email_finder_delete_file: { fileId: 'f1' },
  bulk_domain_search_send_file: { fileContent: CSV, fileName: 'list.csv', domainColumn: 3 },
  bulk_domain_search_file_status: { fileId: 'f1' },
  bulk_domain_search_get_file: { fileId: 'f1' },
  bulk_domain_search_delete_file: { fileId: 'f1' },
  list_evaluator_send_file: { fileContent: CSV, fileName: 'list.csv' },
  list_evaluator_result: { fileId: 'f1' },
  add_filter: { rule: 'allow', target: 'email', value: 'alice@example.com' },
  list_filters: {},
  delete_filter: { rule: 'allow', target: 'email', value: 'alice@example.com' },
  send_evaluated_file: { fileId: 'f1' },
  list_s3_files: {},
  validate_s3_file: { fileName: 'input/list.csv', returnUrl: HOOK },
  score_s3_file: { fileName: 'input/list.csv', returnUrl: HOOK },
  email_finder_s3_file: { fileName: 'input/list.csv', returnUrl: HOOK },
  domain_search_s3_file: { fileName: 'input/list.csv', returnUrl: HOOK },
  export_s3_file: { fileId: 'f1', exportBucket: 'results-bucket' },

  // Warmup API (operations 49-74). Separate host, separate key.
  warmup_list_sending_accounts: {},
  warmup_get_sending_account: { fromAddress: WARMUP_FROM },
  warmup_add_sending_account: {
    fromAddress: WARMUP_FROM,
    onboardingModel: 'self_managed',
    engagementRuleId: 0,
  },
  warmup_update_sending_account: {
    fromAddress: WARMUP_FROM,
    engagementRuleId: 3,
    statusId: 4,
    autoEnable: false,
  },
  warmup_delete_sending_account: { fromAddress: WARMUP_FROM },
  warmup_change_from_address: {
    oldFromAddress: WARMUP_FROM,
    newFromAddress: 'new-sender@example.com',
  },
  warmup_list_from_addresses: {},
  warmup_get_engagement_rules: {},
  warmup_set_engagement_rule: { cFrom: WARMUP_FROM, ruleId: 2 },
  warmup_get_custom_engagement: { cFrom: WARMUP_FROM },
  warmup_create_custom_engagement: {
    cFrom: WARMUP_FROM,
    replyPct: 10,
    importantPct: 20,
    clickPct: 15,
  },
  warmup_update_custom_engagement: {
    cFrom: WARMUP_FROM,
    replyPct: 10,
    importantPct: 20,
    clickPct: 15,
  },
  warmup_delete_custom_engagement: { cFrom: WARMUP_FROM, engagementRuleId: 1 },
  warmup_get_seeds: {},
  warmup_download_seeds: {},
  warmup_get_seed_count: {},
  warmup_get_progress_today: {},
  warmup_get_sent_today: {},
  warmup_get_emails_per_day: {},
  warmup_get_statistics: { fromAddress: WARMUP_FROM },
  warmup_get_statistics_per_day: {
    fromAddress: WARMUP_FROM,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  },
  warmup_get_statistics_detailed: { cFrom: WARMUP_FROM },
  warmup_download_statistics: { cFrom: WARMUP_FROM },
  warmup_get_from_address_statistics: { fromAddress: WARMUP_FROM },
  warmup_check_domain_dmarc: { fromAddress: WARMUP_FROM },
  warmup_test_smtp_configuration: {
    fromAddress: WARMUP_FROM,
    username: 'smtp-user',
    password: SMTP_PLACEHOLDER,
    server: 'smtp.example.com',
    port: 587,
  },
  get_inbox_placement_providers: {},
  get_inbox_placement_test_types: {},
  create_inbox_placement_test: {
    name: 'October launch',
    testType: 1,
    senderEmail: 'sender@example.com',
  },
  get_inbox_placement_test: { testId: '42' },
  list_inbox_placement_tests: {},
  delete_inbox_placement_test: { testId: '42' },
  get_inbox_placement_webhook: {},
  set_inbox_placement_webhook: { webhookUrl: 'https://hooks.example.com/ipt' },
  validate_sftp_file: { fileName: 'in/list.csv', returnUrl: HOOK },
  score_sftp_file: { fileName: 'in/list.csv', returnUrl: HOOK },
  email_finder_sftp_file: { fileName: 'in/list.csv', returnUrl: HOOK },
  domain_search_sftp_file: { fileName: 'in/list.csv', returnUrl: HOOK },
  export_sftp_file: { fileId: 'f1', exportPath: '/out' },
};

const WARMUP_TOOLS = Object.keys(TOOL_ARGS).filter((n) => n.startsWith('warmup_'));

// Tools that only exist with a newer ZeroBounce SDK.
const SDK_GATED = new Set([
  'score_email',
  'bulk_email_finder_send_file',
  'bulk_email_finder_file_status',
  'bulk_email_finder_get_file',
  'bulk_email_finder_delete_file',
  'bulk_domain_search_send_file',
  'bulk_domain_search_file_status',
  'bulk_domain_search_get_file',
  'bulk_domain_search_delete_file',
  'list_evaluator_send_file',
  'list_evaluator_result',
  'add_filter',
  'list_filters',
  'delete_filter',
  'send_evaluated_file',
  'list_s3_files',
  'validate_s3_file',
  'score_s3_file',
  'email_finder_s3_file',
  'domain_search_s3_file',
  'export_s3_file',
  'get_inbox_placement_providers',
  'get_inbox_placement_test_types',
  'create_inbox_placement_test',
  'get_inbox_placement_test',
  'list_inbox_placement_tests',
  'delete_inbox_placement_test',
  'get_inbox_placement_webhook',
  'set_inbox_placement_webhook',
  'validate_sftp_file',
  'score_sftp_file',
  'email_finder_sftp_file',
  'domain_search_sftp_file',
  'export_sftp_file',
]);

async function testRoutingAndAuth(origin) {
  console.log('\nRouting and auth');
  const health = await fetch(`${origin}/health`);
  check(health.status === 200, 'GET /health returns 200');

  const get = await fetch(`${origin}/mcp`);
  check(
    get.status === 405 && get.headers.get('allow') === 'POST',
    'GET /mcp returns 405 with Allow: POST'
  );

  const del = await fetch(`${origin}/mcp`, { method: 'DELETE' });
  check(del.status === 405, 'DELETE /mcp returns 405');

  const unknown = await fetch(`${origin}/nope`);
  check(unknown.status === 404, 'unknown path returns 404');

  const noKey = await rpc(origin, 'tools/list', {});
  check(
    noKey.status === 401 && /API key is required/.test(noKey.message?.error?.message ?? ''),
    'request without a key returns 401'
  );

  const blankKey = await rpc(origin, 'tools/list', {}, { 'X-ZeroBounce-Api-Key': '   ' });
  check(blankKey.status === 401, 'whitespace-only key returns 401');

  const init = await rpc(
    origin,
    'initialize',
    { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } },
    { 'X-ZeroBounce-Api-Key': 'init-key' }
  );
  check(
    init.status === 200 && init.message?.result?.serverInfo?.name === 'zerobounce-mcp',
    'initialize succeeds'
  );
  if (!process.env.ZB_MCP_SERVER) {
    const { version } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
    const reported = init.message?.result?.serverInfo?.version;
    check(
      reported === version,
      `serverInfo reports package version ${version}`,
      `reported ${reported}`
    );
  }

  const bearer = await rpc(
    origin,
    'tools/call',
    { name: 'get_credits', arguments: {} },
    {
      Authorization: 'Bearer bearer-key',
    }
  );
  check(
    bearer.status === 200 && loggedRequests('bearer-key').length === 1,
    'Authorization: Bearer key is forwarded to the API'
  );

  const padded = await rpc(
    origin,
    'tools/call',
    { name: 'get_credits', arguments: {} },
    {
      Authorization: `bEaReR ${' '.repeat(2000)}padded-key`,
    }
  );
  check(
    padded.status === 200 && loggedRequests('padded-key').length === 1,
    'Authorization bearer token is read after long whitespace'
  );

  const basic = await rpc(
    origin,
    'tools/call',
    { name: 'get_credits', arguments: {} },
    {
      Authorization: 'Basic not-a-bearer-key',
    }
  );
  check(basic.status === 401, 'non-bearer Authorization is rejected');
}

async function testTools(origin) {
  console.log('\nTools');
  // The Warmup tools only register when a Warmup key is present, so list with one.
  const list = await rpc(origin, 'tools/list', {}, {
    'X-ZeroBounce-Api-Key': 'list-key',
    [WARMUP_KEY_HEADER]: 'list-warmup-key',
  });
  const names = (list.message?.result?.tools ?? []).map((t) => t.name);
  const gatedListed = names.filter((n) => SDK_GATED.has(n));
  const fullSdk = gatedListed.length === SDK_GATED.size;
  const warmupListed = names.filter((n) => n.startsWith('warmup_'));
  const fullWarmup = warmupListed.length === WARMUP_TOOLS.length;
  console.log(`  (${names.length} tools listed; ${fullSdk ? 'SDK has all newer methods' : 'older SDK, gated tools hidden'}; ${fullWarmup ? 'SDK has the Warmup client' : 'no Warmup client in this SDK'})`);
  console.log(
    `  (${names.length} tools listed; ${fullSdk ? 'SDK has all newer methods' : 'older SDK, gated tools hidden'})`
  );

  check(
    gatedListed.length === 0 || fullSdk,
    'SDK-gated tools are listed all together or not at all',
    `listed: ${gatedListed.join(', ')}`
  );
  check(
    warmupListed.length === 0 || fullWarmup,
    'Warmup tools are listed all together or not at all',
    `listed ${warmupListed.length} of ${WARMUP_TOOLS.length}`
  );
  check(
    !fullWarmup || warmupListed.length === 26,
    'all 26 documented Warmup operations are exposed',
    `listed ${warmupListed.length}`
  );
  const expected = Object.keys(TOOL_ARGS).filter(
    (n) => (fullSdk || !SDK_GATED.has(n)) && (fullWarmup || !n.startsWith('warmup_'))
  );
  check(
    names.length === expected.length && expected.every((n) => names.includes(n)),
    `tools/list matches the expected ${expected.length} tools`,
    `missing: ${expected.filter((n) => !names.includes(n)).join(', ')} extra: ${names.filter((n) => !expected.includes(n)).join(', ')}`
  );

  for (const name of names) {
    const key = `tool-${name}`;
    const result = await callTool(origin, key, name, TOOL_ARGS[name] ?? {});
    const text = toolText(result);
    const reachedApi = loggedRequests(key).length > 0;
    check(
      result.status === 200 && reachedApi && !/is required|not a function|upgrade SDK/i.test(text),
      `${name} accepts valid arguments and calls the API`,
      `status ${result.status}, api calls ${loggedRequests(key).length}, output: ${text.slice(0, 160)}`
    );
  }

  const unknownTool = await callTool(origin, 'unknown-tool-key', 'does_not_exist', {});
  check(/Unknown tool/.test(toolText(unknownTool)), 'unknown tool returns an error result');

  return { names, fullSdk, fullWarmup };
}

async function testArgumentHandling(origin, names) {
  console.log('\nArgument handling');
  const has = (n) => names.includes(n);

  const missing = await callTool(origin, 'missing-arg', 'validate_email', {});
  check(/email is required/.test(toolText(missing)), 'missing required argument is rejected');
  check(loggedRequests('missing-arg').length === 0, 'rejected call does not reach the API');

  const badUrl = await callTool(origin, 'bad-return-url', 'bulk_validate_send_file', {
    fileContent: CSV,
    fileName: 'list.csv',
    returnUrl: 'http://127.0.0.1/hook',
  });
  check(
    /returnUrl must use HTTPS/.test(toolText(badUrl)),
    'non-HTTPS / private returnUrl is rejected'
  );

  const privateIpv6 = [
    ['https://[::1]/hook', 'loopback'],
    ['https://[::]/hook', 'unspecified'],
    ['https://[fe80::1]/hook', 'link-local'],
    ['https://[febf::1]/hook', 'link-local-high'],
    ['https://[fd00::1]/hook', 'unique-local'],
    ['https://[::ffff:127.0.0.1]/hook', 'mapped-loopback'],
    ['https://[::ffff:10.1.2.3]/hook', 'mapped-private'],
  ];
  for (const [returnUrl, label] of privateIpv6) {
    const result = await callTool(origin, `ipv6-${label}`, 'bulk_validate_send_file', {
      fileContent: CSV,
      fileName: 'list.csv',
      returnUrl,
    });
    check(
      /private, link-local, or loopback/.test(toolText(result)) &&
        loggedRequests(`ipv6-${label}`).length === 0,
      `IPv6 ${label} returnUrl is rejected`,
      toolText(result).slice(0, 180)
    );
  }

  const publicV6 = await callTool(origin, 'ipv6-public', 'bulk_validate_send_file', {
    fileContent: CSV,
    fileName: 'list.csv',
    returnUrl: 'https://[2606:4700::1111]/hook',
  });
  check(
    loggedRequests('ipv6-public').some((entry) =>
      String(entry.fields?.return_url ?? '').includes('2606:4700::1111')
    ),
    'public IPv6 returnUrl is forwarded',
    toolText(publicV6).slice(0, 180)
  );

  const midSize = `email\n${'a'.repeat(5 * 1024 * 1024)}@example.com\n`;
  const midFile = await callTool(origin, 'mid-file', 'bulk_validate_send_file', {
    fileContent: midSize,
    fileName: 'mid.csv',
  });
  check(
    midFile.status === 200 &&
      !/Payload Too Large/.test(`${midFile.text}\n${toolText(midFile)}`) &&
      loggedRequests('mid-file').length === 1,
    'fileContent larger than 4 MiB reaches the API',
    toolText(midFile).slice(0, 180)
  );

  const overCap = 'x'.repeat(32 * 1024 * 1024 + 1);
  const hugeFile = await callTool(origin, 'huge-file', 'bulk_validate_send_file', {
    fileContent: overCap,
    fileName: 'huge.csv',
  });
  check(
    /exceeds maximum size of \d+ bytes/.test(toolText(hugeFile)) &&
      loggedRequests('huge-file').length === 0,
    'fileContent over 32 MiB is rejected by the file limit',
    toolText(hugeFile).slice(0, 180)
  );

  if (has('add_filter')) {
    await callTool(origin, 'filter-fields', 'add_filter', TOOL_ARGS.add_filter);
    const [req] = loggedRequests('filter-fields');
    check(
      req?.fields.rule === 'allow' &&
        req?.fields.target === 'email' &&
        req?.fields.value === 'alice@example.com',
      'add_filter sends rule, target and value',
      JSON.stringify(req?.fields)
    );
    const noRule = await callTool(origin, 'filter-missing', 'add_filter', {
      target: 'email',
      value: 'x',
    });
    check(/rule is required/.test(toolText(noRule)), 'add_filter without rule is rejected');
  }

  if (has('export_s3_file')) {
    await callTool(origin, 's3-export', 'export_s3_file', TOOL_ARGS.export_s3_file);
    const [req] = loggedRequests('s3-export');
    check(
      req?.method === 'POST' &&
        req?.url === `${BULK_ROOT}/exportS3file` &&
        keysOf(req?.bodyFields) === 'api_key,export_bucket,file_id' &&
        req?.bodyFields.file_id === 'f1' &&
        req?.bodyFields.export_bucket === 'results-bucket' &&
        req?.bodyFields.api_key === 's3-export' &&
        keysOf(req?.query) === '',
      'export_s3_file POSTs file_id, export_bucket and the key in the form body',
      `${req?.method} ${req?.url} ${JSON.stringify(req?.bodyFields)}`
    );

    // The spec makes the bucket optional: without it the API falls back to the
    // bucket configured on the account, so an empty export_bucket must not go out.
    await callTool(origin, 's3-export-default', 'export_s3_file', { fileId: 'f1' });
    const [bare] = loggedRequests('s3-export-default');
    check(
      keysOf(bare?.bodyFields) === 'api_key,file_id',
      'export_s3_file omits export_bucket when it is not given',
      JSON.stringify(bare?.bodyFields)
    );
  }

  if (has('export_sftp_file')) {
    await callTool(origin, 'sftp-export', 'export_sftp_file', TOOL_ARGS.export_sftp_file);
    const [req] = loggedRequests('sftp-export');
    check(
      req?.method === 'POST' &&
        req?.url === `${BULK_ROOT}/exportSFTPfile` &&
        keysOf(req?.bodyFields) === 'api_key,export_path,file_id' &&
        req?.bodyFields.file_id === 'f1' &&
        req?.bodyFields.export_path === '/out',
      'export_sftp_file POSTs file_id and export_path (not export_bucket)',
      `${req?.method} ${req?.url} ${JSON.stringify(req?.bodyFields)}`
    );

    await callTool(origin, 'sftp-export-default', 'export_sftp_file', { fileId: 'f1' });
    const [bare] = loggedRequests('sftp-export-default');
    check(
      keysOf(bare?.bodyFields) === 'api_key,file_id',
      'export_sftp_file omits export_path when it is not given',
      JSON.stringify(bare?.bodyFields)
    );
  }

  for (const [name, path] of BULK_ROOT_JOBS) {
    if (!has(name)) {
      continue;
    }
    const key = `job-${name}`;
    const result = await callTool(origin, key, name, {
      ...TOOL_ARGS[name],
      hasHeaderRow: true,
      removeDuplicates: true,
    });
    const [req] = loggedRequests(key);
    check(
      req?.method === 'POST' && req?.url === `${BULK_ROOT}${path}`,
      `${name} POSTs to ${BULK_ROOT}${path}`,
      `${req?.method} ${req?.url}`
    );
    check(
      keysOf(req?.bodyFields) === 'api_key,file_name,has_header_row,remove_duplicates,return_url' &&
        req?.bodyFields.file_name === TOOL_ARGS[name].fileName &&
        req?.bodyFields.has_header_row === 'true' &&
        req?.bodyFields.remove_duplicates === 'true' &&
        req?.bodyFields.return_url === HOOK,
      `${name} sends file_name, has_header_row, remove_duplicates and return_url, and nothing else`,
      JSON.stringify(req?.bodyFields)
    );
    check(
      req?.bodyFields.api_key === key && keysOf(req?.query) === '',
      `${name} carries the API key in the form body, not the query string`,
      `query ${JSON.stringify(req?.query)}`
    );
    check(
      JSON.parse(toolText(result)).success === true,
      `${name} parses the job response`,
      toolText(result).slice(0, 160)
    );

    // has_header_row has no safe "unset": the API needs a value, so the tool
    // defaults it rather than dropping the field.
    await callTool(origin, `${key}-defaults`, name, TOOL_ARGS[name]);
    const [defaults] = loggedRequests(`${key}-defaults`);
    check(
      defaults?.bodyFields.has_header_row === 'false' &&
        keysOf(defaults?.bodyFields) === 'api_key,file_name,has_header_row,return_url',
      `${name} defaults has_header_row to false and omits remove_duplicates`,
      JSON.stringify(defaults?.bodyFields)
    );

    // return_url is required: the live API rejects a job without one, so the
    // tool must not create a job that can never report back.
    const noUrl = await callTool(origin, `${key}-nourl`, name, { fileName: 'in/list.csv' });
    check(
      /returnUrl is required/.test(toolText(noUrl)) && loggedRequests(`${key}-nourl`).length === 0,
      `${name} without returnUrl is rejected before the job is created`,
      toolText(noUrl).slice(0, 160)
    );

    const badUrl = await callTool(origin, `${key}-badurl`, name, {
      fileName: 'in/list.csv',
      returnUrl: 'https://127.0.0.1/hook',
    });
    check(
      /private, link-local, or loopback/.test(toolText(badUrl)) &&
        loggedRequests(`${key}-badurl`).length === 0,
      `${name} runs returnUrl through the callback validator`,
      toolText(badUrl).slice(0, 160)
    );
  }

  if (has('send_evaluated_file')) {
    // Op 15 takes the List Evaluator's file_id as a form field; the public docs
    // describe a file upload, which the API rejects.
    await callTool(origin, 'evaluated-file', 'send_evaluated_file', { fileId: 'eval-1' });
    const [req] = loggedRequests('evaluated-file');
    check(
      req?.method === 'POST' &&
        req?.url === `${BULK_ROOT}/v2/send-evaluated-file/` &&
        keysOf(req?.bodyFields) === 'api_key,file_id' &&
        req?.bodyFields.file_id === 'eval-1' &&
        req?.bodyFields.api_key === 'evaluated-file',
      'send_evaluated_file POSTs file_id as a form field, not a file upload',
      `${req?.method} ${req?.url} ${JSON.stringify(req?.bodyFields)}`
    );

    const missing = await callTool(origin, 'evaluated-missing', 'send_evaluated_file', {});
    check(
      /fileId is required/.test(toolText(missing)) &&
        loggedRequests('evaluated-missing').length === 0,
      'send_evaluated_file without fileId is rejected'
    );
  }

  if (has('list_evaluator_send_file')) {
    await callTool(origin, 'evaluator-column', 'list_evaluator_send_file', {
      ...TOOL_ARGS.list_evaluator_send_file,
      emailAddressColumn: 2,
    });
    const [req] = loggedRequests('evaluator-column');
    check(
      String(req?.fields.email_address_column) === '3',
      'list_evaluator_send_file honours emailAddressColumn (0-based 2 -> API 3)',
      JSON.stringify(req?.fields)
    );
  }

  if (has('bulk_email_finder_send_file')) {
    await callTool(origin, 'finder-column-zero', 'bulk_email_finder_send_file', {
      ...TOOL_ARGS.bulk_email_finder_send_file,
      firstNameColumn: 0,
      lastNameColumn: 2,
    });
    const [req] = loggedRequests('finder-column-zero');
    check(
      String(req?.fields.first_name_column) === '1' && String(req?.fields.last_name_column) === '3',
      'bulk_email_finder_send_file keeps column 0 (first_name_column -> 1)',
      JSON.stringify(req?.fields)
    );
  }
}

async function testErrorReporting(origin, names) {
  console.log('\nError reporting');
  const isError = (result) => result.message?.result?.isError === true;

  const html403 = await callTool(origin, 'html-403-getfile', 'bulk_validate_get_file', {
    fileId: 'f1',
  });
  const html403Text = toolText(html403);
  check(
    isError(html403) && html403Text.length < 500 && !/<html|<body|<p>/i.test(html403Text),
    'bulk get-file HTML error page is reduced to a short message',
    `${html403Text.length} chars: ${html403Text.slice(0, 160)}`
  );
  check(
    /Access denied \| zerobounce\.net/.test(html403Text),
    'HTML error message keeps the page title'
  );

  const html200 = await callTool(origin, 'html-200-getfile', 'bulk_ai_scoring_get_file', {
    fileId: 'f1',
  });
  check(
    isError(html200) && toolText(html200).length < 500,
    'bulk get-file HTML page with status 200 is an error, not CSV',
    toolText(html200).slice(0, 160)
  );

  const denied = await callTool(origin, 'html-403-credits', 'get_credits', {});
  // The fixture answers with an HTML "Access denied" page, so assert the
  // invariant this check is named for -- one "Error:" prefix and no doubling --
  // rather than one particular message. Pinning the exact text tied the check
  // to how a given SDK version words an HTML failure.
  const deniedText = toolText(denied);
  check(
    isError(denied) &&
      /^Error: /.test(deniedText) &&
      !/^Error:\s*(Error|\[Error\]):/.test(deniedText) &&
      deniedText.length < 500,
    'error text carries a single "Error:" prefix',
    deniedText
  );

  const hasJobs = names.includes('validate_s3_file') && names.includes('validate_sftp_file');
  if (hasJobs) {
    // The body the live API returns for an S3/SFTP job whose return_url never
    // reached the wire. It must surface as the API's own words, not a generic failure.
    const returnUrl400 = await callTool(
      origin,
      'returnurl-400-s3',
      'validate_s3_file',
      TOOL_ARGS.validate_s3_file
    );
    check(
      isError(returnUrl400) &&
        /Provided return URL is not permitted: None/.test(toolText(returnUrl400)) &&
        !/<html/i.test(toolText(returnUrl400)),
      'a 400 error_message body is reported verbatim',
      toolText(returnUrl400).slice(0, 200)
    );

    const returnUrl400Sftp = await callTool(
      origin,
      'returnurl-400-sftp',
      'validate_sftp_file',
      TOOL_ARGS.validate_sftp_file
    );
    check(
      isError(returnUrl400Sftp) &&
        /Provided return URL is not permitted: None/.test(toolText(returnUrl400Sftp)),
      'the same 400 body is reported for the SFTP job'
    );
  }

  const account = await callTool(
    origin,
    'batch-account-1',
    'validate_batch',
    TOOL_ARGS.validate_batch
  );
  check(
    isError(account) && /ran out of credits/.test(toolText(account)),
    'validate_batch reports an account-level error as an error',
    toolText(account).slice(0, 160)
  );

  const partial = await callTool(
    origin,
    'batch-partial-1',
    'validate_batch',
    TOOL_ARGS.validate_batch
  );
  check(
    !isError(partial) && /Invalid email address/.test(toolText(partial)),
    'validate_batch keeps per-address errors in a successful result',
    toolText(partial).slice(0, 160)
  );
}

async function testBatchEmailColumn(origin) {
  console.log('\nvalidate_batch emailAddressColumn');
  await callTool(origin, 'batch-column', 'validate_batch', {
    emails: [
      'Alice,alice@example.com',
      '"Smith, Bob",bob@example.com,extra',
      '"Q ""Quote""", q@example.com ',
    ],
    emailAddressColumn: 1,
  });
  const [req] = loggedRequests('batch-column');
  const sent = (req?.fields.email_batch ?? []).map((e) => e.email_address);
  check(
    JSON.stringify(sent) ===
      JSON.stringify(['alice@example.com', 'bob@example.com', 'q@example.com']),
    'emailAddressColumn reads that column from each CSV row (quoted fields too)',
    JSON.stringify(sent)
  );

  await callTool(origin, 'batch-plain', 'validate_batch', {
    emails: ['a@example.com', 'b@example.com'],
  });
  const plain = (loggedRequests('batch-plain')[0]?.fields.email_batch ?? []).map(
    (e) => e.email_address
  );
  check(
    JSON.stringify(plain) === JSON.stringify(['a@example.com', 'b@example.com']),
    'without emailAddressColumn, entries are sent unchanged',
    JSON.stringify(plain)
  );

  const missing = await callTool(origin, 'batch-column-missing', 'validate_batch', {
    emails: ['Alice,alice@example.com', 'Bob'],
    emailAddressColumn: 1,
  });
  check(
    /emails\[1\] has no value in column 1/.test(toolText(missing)) &&
      loggedRequests('batch-column-missing').length === 0,
    'a row without that column is rejected before calling the API',
    toolText(missing)
  );
}


async function testWarmup(origin) {
  console.log('\nWarmup API');
  const warmupCall = (apiKey, warmupKey, name, args) =>
    rpc(origin, 'tools/call', { name, arguments: args }, {
      'X-ZeroBounce-Api-Key': apiKey,
      ...(warmupKey === null ? {} : { [WARMUP_KEY_HEADER]: warmupKey }),
    });

  // -- registration gating ---------------------------------------------------
  const noWarmup = await rpc(origin, 'tools/list', {}, { 'X-ZeroBounce-Api-Key': 'bare-key' });
  const bareNames = (noWarmup.message?.result?.tools ?? []).map((t) => t.name);
  check(
    bareNames.length > 0 && bareNames.every((n) => !n.startsWith('warmup_')),
    'without a Warmup key, no Warmup tool is advertised',
    `listed: ${bareNames.filter((n) => n.startsWith('warmup_')).join(', ')}`
  );

  const unregistered = await warmupCall('bare-key', null, 'warmup_get_seed_count', {});
  check(
    /Unknown tool/.test(toolText(unregistered)) && warmupRequests().every((e) => e.apiKey !== 'bare-key'),
    'calling a Warmup tool without a Warmup key is an unknown tool, not an API call',
    toolText(unregistered).slice(0, 160)
  );

  const blank = await warmupCall('blank-warmup', '   ', 'warmup_get_seed_count', {});
  check(/Unknown tool/.test(toolText(blank)), 'a whitespace-only Warmup key does not register the tools');

  // -- method, URL and key placement ----------------------------------------
  await warmupCall('v-get-account', 'w-get-account', 'warmup_get_sending_account', {
    fromAddress: WARMUP_FROM,
  });
  const [getAccount] = loggedRequests('w-get-account');
  check(
    getAccount?.method === 'GET' &&
      getAccount?.url ===
        `https://warmup-api.zerobounce.net/api/v1/warmup/sending-account?from_address=${encodeURIComponent(WARMUP_FROM)}`,
    'warmup_get_sending_account sends GET to the Warmup host with from_address',
    `${getAccount?.method} ${getAccount?.url}`
  );
  check(
    getAccount?.apiKey === 'w-get-account',
    'the Warmup key travels in the API-Key header',
    JSON.stringify(getAccount?.apiKey)
  );
  check(
    getAccount?.accept === 'application/json' && getAccount?.contentType == null,
    'a Warmup GET asks for JSON and sends no body content type',
    `accept ${getAccount?.accept}, content-type ${getAccount?.contentType}`
  );

  // The validation key must not reach the Warmup host, and vice versa.
  check(
    loggedRequests('v-get-account').length === 0,
    'the validation key is not used for Warmup calls'
  );

  await warmupCall('cross-validation', 'cross-warmup', 'get_credits', {});
  const [credits] = loggedRequests('cross-validation');
  check(
    credits?.host === 'api.zerobounce.net' && loggedRequests('cross-warmup').length === 0,
    'the Warmup key is not used for validation calls',
    `${credits?.host}`
  );

  // -- query parameters ------------------------------------------------------
  await warmupCall('v-list-from', 'w-list-from', 'warmup_list_from_addresses', {
    searchFrom: 'sender@example.com',
    offset: 5,
    limit: 10,
  });
  const [listFrom] = loggedRequests('w-list-from');
  check(
    listFrom?.query.search_from === 'sender@example.com' &&
      listFrom?.query.offset === '5' &&
      listFrom?.query.limit === '10',
    'warmup_list_from_addresses sends search_from, offset and limit',
    JSON.stringify(listFrom?.query)
  );

  await warmupCall('v-stats-day', 'w-stats-day', 'warmup_get_statistics_per_day', {
    fromAddress: WARMUP_FROM,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  });
  const [statsDay] = loggedRequests('w-stats-day');
  check(
    statsDay?.path === '/statistics-per-day' &&
      statsDay?.query.start_date === '2026-10-01' &&
      statsDay?.query.end_date === '2026-10-31',
    'warmup_get_statistics_per_day sends start_date and end_date',
    JSON.stringify(statsDay?.query)
  );

  // -- bodies and verbs ------------------------------------------------------
  await warmupCall('v-update', 'w-update', 'warmup_update_sending_account', {
    fromAddress: WARMUP_FROM,
    engagementRuleId: 3,
    statusId: 4,
    autoEnable: false,
  });
  const [update] = loggedRequests('w-update');
  check(
    update?.method === 'PUT' &&
      update?.path === '/sending-accounts' &&
      update?.fields.from_address === WARMUP_FROM &&
      update?.fields.engagement_rule_id === 3 &&
      update?.fields.status_id === 4 &&
      update?.fields.auto_enable === false &&
      update?.contentType === 'application/json',
    'warmup_update_sending_account PUTs a JSON body with the rule, status and auto_enable',
    `${update?.method} ${update?.path} ${JSON.stringify(update?.fields)}`
  );

  await warmupCall('v-delete', 'w-delete', 'warmup_delete_sending_account', {
    fromAddress: WARMUP_FROM,
  });
  const [del] = loggedRequests('w-delete');
  check(
    del?.method === 'DELETE' && del?.query.from_address === WARMUP_FROM,
    'warmup_delete_sending_account sends DELETE with from_address',
    `${del?.method} ${JSON.stringify(del?.query)}`
  );

  await warmupCall('v-custom', 'w-custom', 'warmup_create_custom_engagement', {
    cFrom: WARMUP_FROM,
    replyPct: 10,
    importantPct: 20,
    clickPct: 15,
  });
  const [custom] = loggedRequests('w-custom');
  check(
    custom?.method === 'POST' &&
      custom?.path === '/custom-engagement' &&
      custom?.fields.c_from === WARMUP_FROM &&
      custom?.fields.reply_pct === 10 &&
      custom?.fields.important_pct === 20 &&
      custom?.fields.click_pct === 15,
    'warmup_create_custom_engagement POSTs c_from and the three percentages',
    JSON.stringify(custom?.fields)
  );

  await warmupCall('v-custom-get', 'w-custom-get', 'warmup_get_custom_engagement', {
    cFrom: WARMUP_FROM,
  });
  const [customGet] = loggedRequests('w-custom-get');
  check(
    customGet?.path === `/custom-engagement/${encodeURIComponent(WARMUP_FROM)}`,
    'warmup_get_custom_engagement puts c_from in the path, encoded',
    customGet?.path
  );

  await warmupCall('v-smtp', 'w-smtp', 'warmup_test_smtp_configuration', {
    ...TOOL_ARGS.warmup_test_smtp_configuration,
  });
  const [smtp] = loggedRequests('w-smtp');
  check(
    smtp?.method === 'POST' &&
      smtp?.path === '/test-smtp-configuration' &&
      smtp?.fields.username === 'smtp-user' &&
      smtp?.fields.port === 587,
    'warmup_test_smtp_configuration POSTs the SMTP fields',
    `${smtp?.method} ${smtp?.path}`
  );
  check(
    !String(smtp?.url).includes(SMTP_PLACEHOLDER) && !String(smtp?.url).includes('smtp-user'),
    'SMTP credentials go in the body, never the URL',
    smtp?.url
  );

  // -- CSV endpoints (operations 63 and 71) ----------------------------------
  const seedCsv = await warmupCall('v-seed-csv', 'w-seed-csv', 'warmup_download_seeds', {});
  const seedText = toolText(seedCsv);
  check(
    seedText.startsWith('seed,provider') && seedText.includes('seed1@example.com,gmail'),
    'warmup_download_seeds returns CSV text, not JSON',
    seedText.slice(0, 120)
  );
  check(
    loggedRequests('w-seed-csv')[0]?.path === '/seeds/download',
    'warmup_download_seeds calls /seeds/download'
  );

  const statsCsv = await warmupCall('v-stats-csv', 'w-stats-csv', 'warmup_download_statistics', {
    cFrom: WARMUP_FROM,
  });
  const statsText = toolText(statsCsv);
  check(
    statsText.startsWith('date,sent,inbox,spam') &&
      loggedRequests('w-stats-csv')[0]?.query.c_from === WARMUP_FROM,
    'warmup_download_statistics returns CSV text and sends c_from',
    statsText.slice(0, 120)
  );

  const notCsv = await warmupCall(
    'v-notcsv',
    'warmup-notcsv-1',
    'warmup_download_statistics',
    { cFrom: WARMUP_FROM }
  );
  check(
    notCsv.message?.result?.isError === true && /No statistics available/.test(toolText(notCsv)),
    'a CSV endpoint answering with JSON is reported as an error',
    toolText(notCsv).slice(0, 160)
  );

  // -- error bodies ----------------------------------------------------------
  const apiError = await warmupCall('v-error', 'warmup-error-1', 'warmup_get_statistics', {
    fromAddress: WARMUP_FROM,
  });
  const apiErrorText = toolText(apiError);
  check(
    apiError.message?.result?.isError === true &&
      /from_address parameter is invalid/.test(apiErrorText) &&
      !/^Error:\s*(Error|\[Error\]):/.test(apiErrorText),
    'a Warmup JSON error body becomes one short error message',
    apiErrorText.slice(0, 160)
  );
  check(
    !apiErrorText.includes('warmup-error-1'),
    'a Warmup error message does not echo the Warmup key',
    apiErrorText.slice(0, 160)
  );

  // -- argument validation ---------------------------------------------------
  const bareDomain = await warmupCall('v-dmarc', 'w-dmarc-bare', 'warmup_check_domain_dmarc', {
    fromAddress: 'example.com',
  });
  check(
    bareDomain.message?.result?.isError === true &&
      /email address/i.test(toolText(bareDomain)) &&
      loggedRequests('w-dmarc-bare').length === 0,
    'warmup_check_domain_dmarc rejects a bare domain before calling the API',
    toolText(bareDomain).slice(0, 160)
  );

  await warmupCall('v-dmarc-ok', 'w-dmarc-ok', 'warmup_check_domain_dmarc', {
    fromAddress: WARMUP_FROM,
    dkimSelector: 'selector1',
  });
  const [dmarc] = loggedRequests('w-dmarc-ok');
  check(
    dmarc?.query.from_address === WARMUP_FROM && dmarc?.query.dkim_selector === 'selector1',
    'warmup_check_domain_dmarc sends an email address and the DKIM selector',
    JSON.stringify(dmarc?.query)
  );

  const missing = await warmupCall('v-missing', 'w-missing', 'warmup_get_sending_account', {});
  check(
    /fromAddress is required/.test(toolText(missing)) && loggedRequests('w-missing').length === 0,
    'a missing Warmup argument is rejected before calling the API',
    toolText(missing).slice(0, 160)
  );

  const badRule = await warmupCall('v-bad-rule', 'w-bad-rule', 'warmup_set_engagement_rule', {
    cFrom: WARMUP_FROM,
    ruleId: 9,
  });
  check(
    badRule.message?.result?.isError === true && loggedRequests('w-bad-rule').length === 0,
    'an out-of-range engagement rule is rejected before calling the API',
    toolText(badRule).slice(0, 160)
  );

  // -- the key is never in a URL --------------------------------------------
  const all = warmupRequests();
  check(all.length > 0, `${all.length} Warmup requests reached the fixture`);
  const inUrl = all.filter((e) => e.apiKey && String(e.url).includes(e.apiKey));
  check(
    inUrl.length === 0,
    'no Warmup request ever carried its key in the query string',
    inUrl.map((e) => e.url).join(', ').slice(0, 200)
  );
  const noHeader = all.filter((e) => !e.apiKey);
  check(noHeader.length === 0, 'every Warmup request carried an API-Key header',
    noHeader.map((e) => e.path).join(', '));
  const offHost = all.filter((e) => !String(e.url).startsWith('https://warmup-api.zerobounce.net/api/v1/warmup'));
  check(offHost.length === 0, 'every Warmup request went to the Warmup base path',
    offHost.map((e) => e.url).join(', ').slice(0, 200));
}
/**
 * The Inbox Placement Tester is a different service behind the bulk host: its key
 * travels in an Authorization header, and GET /tests mixes naming conventions. The
 * live API silently ignores a parameter spelled the other way -- `pageSize` returns
 * the whole list and `created_after` does not filter -- so a renamed parameter looks
 * like a working call that quietly skips the filter. These checks pin the wire format.
 */
async function testInboxPlacement(origin, names) {
  console.log('\nInbox Placement Tester');
  if (!names.includes('get_inbox_placement_providers')) {
    console.log('  (installed SDK has no inbox placement methods; skipped)');
    return;
  }

  const isError = (result) => result.message?.result?.isError === true;
  const BASE = 'https://bulkapi.zerobounce.net/api/ipt';

  const operations = [
    ['get_inbox_placement_providers', {}, 'GET', `${BASE}/providers`],
    ['get_inbox_placement_test_types', {}, 'GET', `${BASE}/test-types`],
    [
      'create_inbox_placement_test',
      TOOL_ARGS.create_inbox_placement_test,
      'POST',
      `${BASE}/test`,
    ],
    ['get_inbox_placement_test', { testId: '42' }, 'GET', `${BASE}/test/42`],
    ['list_inbox_placement_tests', {}, 'GET', `${BASE}/tests`],
    ['delete_inbox_placement_test', { testId: '42' }, 'DELETE', `${BASE}/test/42`],
    ['get_inbox_placement_webhook', {}, 'GET', `${BASE}/webhook`],
    [
      'set_inbox_placement_webhook',
      { webhookUrl: 'https://hooks.example.com/ipt' },
      'PUT',
      `${BASE}/webhook`,
    ],
  ];

  for (const [name, args, method, expectedUrl] of operations) {
    const key = `ipt-wire-${name}`;
    const result = await callTool(origin, key, name, args);
    const [req] = loggedRequests(key);
    check(
      req?.method === method && req?.url === expectedUrl,
      `${name} sends ${method} ${expectedUrl.slice(BASE.length)}`,
      `got ${req?.method} ${req?.url}`
    );
    check(
      req?.auth === 'bearer' &&
        req?.apiKey === key &&
        !String(req?.url).includes(key) &&
        !('api_key' in (req?.query ?? {})),
      `${name} sends the key as Authorization: Bearer and never in the URL`,
      `auth ${req?.auth}, url ${req?.url}`
    );
    check(!isError(result), `${name} parses a successful response`, toolText(result).slice(0, 160));
  }

  // GET /tests: page_size is snake_case, createdAfter/createdBefore are camelCase.
  const listKey = 'ipt-list-params';
  await callTool(origin, listKey, 'list_inbox_placement_tests', {
    status: 'finished',
    createdAfter: '2030-01-01',
    createdBefore: '2031-12-31',
    page: 2,
    pageSize: 25,
  });
  const query = loggedRequests(listKey)[0]?.query ?? {};
  check(
    query.page_size === '25' && !('pageSize' in query),
    'list_inbox_placement_tests sends page_size, not pageSize (the API ignores pageSize)',
    JSON.stringify(query)
  );
  check(
    query.createdAfter === '2030-01-01' &&
      query.createdBefore === '2031-12-31' &&
      !('created_after' in query) &&
      !('created_before' in query),
    'list_inbox_placement_tests sends createdAfter/createdBefore (the API ignores created_after)',
    JSON.stringify(query)
  );
  check(
    query.status === 'finished' && query.page === '2',
    'list_inbox_placement_tests sends status and page',
    JSON.stringify(query)
  );

  const badStatus = await callTool(origin, 'ipt-bad-status', 'list_inbox_placement_tests', {
    status: 'pending',
  });
  check(
    /status must be one of running, finished/.test(toolText(badStatus)) &&
      loggedRequests('ipt-bad-status').length === 0,
    'an unsupported status is rejected before calling the API',
    toolText(badStatus).slice(0, 160)
  );

  const bigPage = await callTool(origin, 'ipt-big-page', 'list_inbox_placement_tests', {
    pageSize: 101,
  });
  check(
    /pageSize must be an integer between 1 and 100/.test(toolText(bigPage)) &&
      loggedRequests('ipt-big-page').length === 0,
    'pageSize above 100 is rejected before calling the API',
    toolText(bigPage).slice(0, 160)
  );

  // POST /test body.
  const createKey = 'ipt-create-body';
  await callTool(origin, createKey, 'create_inbox_placement_test', {
    name: 'October launch',
    testType: 1,
    senderEmail: 'sender@example.com',
    providerIds: [1, 2],
    seedIds: [7],
    providers: [{ id: 3, maxSeeds: 5 }],
    webhookUrl: 'https://hooks.example.com/ipt',
  });
  const createBody = loggedRequests(createKey)[0]?.body ?? {};
  check(
    createBody.name === 'October launch' &&
      createBody.testType === 1 &&
      createBody.senderEmail === 'sender@example.com' &&
      JSON.stringify(createBody.providerIds) === '[1,2]' &&
      JSON.stringify(createBody.seedIds) === '[7]' &&
      JSON.stringify(createBody.providers) === '[{"id":3,"maxSeeds":5}]' &&
      createBody.webhookUrl === 'https://hooks.example.com/ipt',
    'create_inbox_placement_test sends the whole test definition as JSON',
    JSON.stringify(createBody)
  );

  const longName = await callTool(origin, 'ipt-long-name', 'create_inbox_placement_test', {
    name: 'n'.repeat(65),
  });
  check(
    /name must be at most 64 characters/.test(toolText(longName)) &&
      loggedRequests('ipt-long-name').length === 0,
    'a name longer than 64 characters is rejected before calling the API',
    toolText(longName).slice(0, 160)
  );

  const badType = await callTool(origin, 'ipt-bad-type', 'create_inbox_placement_test', {
    name: 'x',
    testType: 4,
  });
  check(
    /testType must be one of 1, 2, 3/.test(toolText(badType)) &&
      loggedRequests('ipt-bad-type').length === 0,
    'an unsupported testType is rejected before calling the API',
    toolText(badType).slice(0, 160)
  );

  const noSender = await callTool(origin, 'ipt-no-sender', 'create_inbox_placement_test', {
    name: 'x',
    testType: 1,
  });
  check(
    /senderEmail is required when testType is 1/.test(toolText(noSender)) &&
      loggedRequests('ipt-no-sender').length === 0,
    'testType 1 without senderEmail is rejected before calling the API',
    toolText(noSender).slice(0, 160)
  );

  const badSeeds = await callTool(origin, 'ipt-bad-seeds', 'create_inbox_placement_test', {
    name: 'x',
    providers: [{ id: 3, maxSeeds: 0 }],
  });
  check(
    /providers\[0\]\.maxSeeds must be an integer of at least 1/.test(toolText(badSeeds)) &&
      loggedRequests('ipt-bad-seeds').length === 0,
    'a provider maxSeeds below 1 is rejected before calling the API',
    toolText(badSeeds).slice(0, 160)
  );

  // Webhook URLs are callbacks ZeroBounce posts to, so they get the returnUrl checks.
  const privateHook = await callTool(origin, 'ipt-private-hook', 'set_inbox_placement_webhook', {
    webhookUrl: 'https://127.0.0.1/hook',
  });
  check(
    /webhookUrl must not target private, link-local, or loopback addresses/.test(
      toolText(privateHook)
    ) && loggedRequests('ipt-private-hook').length === 0,
    'a loopback webhookUrl is rejected before calling the API',
    toolText(privateHook).slice(0, 160)
  );

  const insecureHook = await callTool(origin, 'ipt-http-hook', 'set_inbox_placement_webhook', {
    webhookUrl: 'http://hooks.example.com/ipt',
  });
  check(
    /webhookUrl must use HTTPS/.test(toolText(insecureHook)) &&
      loggedRequests('ipt-http-hook').length === 0,
    'a non-HTTPS webhookUrl is rejected before calling the API',
    toolText(insecureHook).slice(0, 160)
  );

  const hookKey = 'ipt-webhook-body';
  await callTool(origin, hookKey, 'set_inbox_placement_webhook', {
    webhookUrl: 'https://hooks.example.com/ipt',
  });
  check(
    loggedRequests(hookKey)[0]?.body?.webhookUrl === 'https://hooks.example.com/ipt',
    'set_inbox_placement_webhook sends webhookUrl as a JSON body',
    JSON.stringify(loggedRequests(hookKey)[0]?.body)
  );

  // Test ids reach the path as one encoded segment, numbers included.
  await callTool(origin, 'ipt-id-encoded', 'get_inbox_placement_test', { testId: 'a/b c' });
  check(
    loggedRequests('ipt-id-encoded')[0]?.url === `${BASE}/test/a%2Fb%20c`,
    'a testId is percent-encoded into one path segment',
    loggedRequests('ipt-id-encoded')[0]?.url
  );

  await callTool(origin, 'ipt-id-number', 'get_inbox_placement_test', { testId: 42 });
  check(
    loggedRequests('ipt-id-number')[0]?.url === `${BASE}/test/42`,
    'a numeric testId is accepted',
    loggedRequests('ipt-id-number')[0]?.url
  );

  const noId = await callTool(origin, 'ipt-no-id', 'get_inbox_placement_test', {});
  check(
    /testId is required/.test(toolText(noId)) && loggedRequests('ipt-no-id').length === 0,
    'get_inbox_placement_test without testId is rejected'
  );

  // DELETE answers 204 with no body; every other endpoint returns JSON, so an empty
  // body must not read as the usual "empty response" failure.
  const deleted = await callTool(origin, 'ipt-delete-empty', 'delete_inbox_placement_test', {
    testId: '42',
  });
  const deletedText = toolText(deleted);
  check(
    !isError(deleted) && /"success": true/.test(deletedText) && !/Empty response/.test(deletedText),
    'delete_inbox_placement_test reads an empty 204 body as success',
    deletedText.slice(0, 160)
  );

  // Django REST framework errors: {"detail": "..."} and a bare list of messages.
  const detail = await callTool(origin, 'ipt-detail-1', 'get_inbox_placement_test', {
    testId: '42',
  });
  const detailText = toolText(detail);
  check(
    isError(detail) &&
      /Inbox placement test not found\./.test(detailText) &&
      detailText.length < 200,
    'a Django "detail" error body is reduced to its message',
    detailText.slice(0, 160)
  );

  const conflict = await callTool(origin, 'ipt-conflict-1', 'delete_inbox_placement_test', {
    testId: '42',
  });
  const conflictText = toolText(conflict);
  check(
    isError(conflict) && /In-progress tests cannot be deleted\./.test(conflictText),
    'a failed delete stays an error, rather than passing as an empty-body success',
    conflictText.slice(0, 160)
  );
}

async function testKeyIsolation(origin, server) {
  console.log('\nPer-request API key isolation');
  const count = 60;
  const tools = ['get_credits', 'validate_email', 'get_activity_data'];
  const calls = Array.from({ length: count }, (_, i) => {
    const key = `concurrent-${i}`;
    const name = tools[i % tools.length];
    return callTool(origin, key, name, TOOL_ARGS[name]).then((result) => ({ key, result }));
  });
  const results = await Promise.all(calls);

  const ok = results.filter(({ result }) => result.status === 200 && result.message?.result);
  check(
    ok.length === count,
    `${count} concurrent requests all succeed`,
    `${ok.length}/${count} succeeded`
  );

  const leaked = results.filter(({ key }) => {
    const reqs = loggedRequests(key);
    return reqs.length !== 1;
  });
  check(
    leaked.length === 0,
    'each request reached the API exactly once, with its own key',
    `mismatched: ${leaked.map((r) => r.key).join(', ')}`
  );

  const crossed = results.filter(({ key, result }) => {
    const text = toolText(result);
    const other = text.match(/concurrent-\d+/g) ?? [];
    return other.some((k) => k !== key);
  });
  check(
    crossed.length === 0,
    "no response contains another caller's key",
    `crossed: ${crossed.map((r) => r.key).join(', ')}`
  );

  check(!/Already connected/.test(server.stderr()), 'server logged no transport reuse errors');
}

async function testBindHost() {
  console.log('\nBind host');
  const refused = spawnSync(process.execPath, [SERVER_PATH, '--http', '--host', '0.0.0.0'], {
    encoding: 'utf8',
    env: { ...process.env, MCP_TLS_TERMINATED: '' },
  });
  check(
    refused.status === 1 && /MCP_TLS_TERMINATED=true/.test(refused.stderr),
    'non-loopback bind requires explicit TLS termination'
  );
  const port = await freePort();
  const local = await startServer(['--port', String(port)], { MCP_HOST: '' });
  check(local.origin === `http://127.0.0.1:${port}`, 'binds to 127.0.0.1 by default', local.origin);
  await stopServer(local);

  const flagPort = await freePort();
  const flag = await startServer(['--port', String(flagPort), '--host', '0.0.0.0'], {
    MCP_TLS_TERMINATED: 'true',
  });
  check(
    flag.origin === `http://0.0.0.0:${flagPort}`,
    '--host 0.0.0.0 binds all interfaces',
    flag.origin
  );
  const viaAll = await fetch(`http://127.0.0.1:${flagPort}/health`);
  check(viaAll.status === 200, 'server bound to 0.0.0.0 answers on loopback');
  await stopServer(flag);

  const envPort = await freePort();
  const env = await startServer([`--port=${envPort}`], {
    MCP_HOST: '0.0.0.0',
    MCP_TLS_TERMINATED: 'true',
  });
  check(
    env.origin === `http://0.0.0.0:${envPort}`,
    'MCP_HOST=0.0.0.0 binds all interfaces',
    env.origin
  );
  await stopServer(env);

  console.log('\nRegional API base URL');
  // ZeroBounce serves the main API from three hosts. The SDK has always
  // supported them; until now this server gave no way to pick one.
  const readBaseUrl = async (origin) => {
    const r = await rpc(
      origin,
      'resources/read',
      { uri: 'zerobounce://config' },
      {
        'X-ZeroBounce-Api-Key': 'region-key',
      }
    );
    return JSON.parse(r.message.result.contents[0].text).baseUrl;
  };

  const defPort = await freePort();
  const def = await startServer([`--port=${defPort}`], { ZEROBOUNCE_API_URL: '' });
  check(
    (await readBaseUrl(def.origin)) === 'https://api.zerobounce.net/v2',
    'defaults to the main API host'
  );
  await stopServer(def);

  const usPort = await freePort();
  const us = await startServer([`--port=${usPort}`, '--url=us']);
  check(
    (await readBaseUrl(us.origin)) === 'https://api-us.zerobounce.net/v2',
    '--url=us selects the US host'
  );
  await stopServer(us);

  const euPort = await freePort();
  const eu = await startServer([`--port=${euPort}`], { ZEROBOUNCE_API_URL: 'eu' });
  check(
    (await readBaseUrl(eu.origin)) === 'https://api-eu.zerobounce.net/v2',
    'ZEROBOUNCE_API_URL=eu selects the EU host'
  );
  await stopServer(eu);

  const customPort = await freePort();
  const custom = await startServer([`--port=${customPort}`, '--url=https://stub.example.com/v2']);
  check(
    (await readBaseUrl(custom.origin)) === 'https://stub.example.com/v2',
    'an explicit https URL is kept as given'
  );
  await stopServer(custom);

  // Never silently fall back to production: a caller who asked for one host and
  // got another would send their key somewhere they did not choose.
  const insecure = spawnSync(
    process.execPath,
    [SERVER_PATH, '--http', '--url=http://api.zerobounce.net/v2'],
    {
      encoding: 'utf8',
    }
  );
  check(
    insecure.status === 1 && /must use https/i.test(insecure.stderr),
    'a non-https API URL is refused, not silently replaced',
    insecure.stderr.slice(0, 120)
  );

  const bogus = spawnSync(process.execPath, [SERVER_PATH, '--http', '--url=not-a-url'], {
    encoding: 'utf8',
  });
  check(bogus.status === 1 && /Invalid API URL/i.test(bogus.stderr),
    'a malformed API URL is refused', bogus.stderr.slice(0, 120));

  console.log('\nWarmup base URL');
  // There is no regional Warmup host: warmup-api-us and warmup-api-eu do not
  // resolve, so only the default and an explicit https URL are accepted.
  const readWarmupConfig = async (origin) => {
    const r = await rpc(origin, 'resources/read', { uri: 'zerobounce://config' }, {
      'X-ZeroBounce-Api-Key': 'region-key',
    });
    return JSON.parse(r.message.result.contents[0].text);
  };

  const wDefPort = await freePort();
  const wDef = await startServer([`--port=${wDefPort}`], { ZEROBOUNCE_WARMUP_API_URL: '' });
  const defConfig = await readWarmupConfig(wDef.origin);
  check(defConfig.warmupBaseUrl === 'https://warmup-api.zerobounce.net',
    'defaults to the single Warmup host', defConfig.warmupBaseUrl);
  // The detail is deliberately omitted. The value is a boolean saying whether a
  // key is set, never a key -- but CodeQL's clear-text-logging rule keys off the
  // identifier name and flags any logging of it, so this stays off the log.
  check(defConfig.warmupApiKeyConfigured === false,
    'HTTP mode reports no server-level Warmup key');
  await stopServer(wDef);

  const wCustomPort = await freePort();
  const wCustom = await startServer([`--port=${wCustomPort}`, '--warmup-url=https://warmup.example.com']);
  check((await readWarmupConfig(wCustom.origin)).warmupBaseUrl === 'https://warmup.example.com',
    '--warmup-url accepts an explicit https URL for a test host');
  await stopServer(wCustom);

  const wRegion = spawnSync(process.execPath, [SERVER_PATH, '--http', '--warmup-url=us'], {
    encoding: 'utf8',
  });
  check(wRegion.status === 1 && /Invalid Warmup API URL/i.test(wRegion.stderr),
    'a regional shorthand is refused: no regional Warmup host exists',
    wRegion.stderr.slice(0, 120));

  const wInsecure = spawnSync(
    process.execPath,
    [SERVER_PATH, '--http', '--warmup-url=http://warmup-api.zerobounce.net'],
    { encoding: 'utf8' }
  );
  check(wInsecure.status === 1 && /must use https/i.test(wInsecure.stderr),
    'a non-https Warmup URL is refused, not silently replaced',
    wInsecure.stderr.slice(0, 120));

  console.log('\nWarmup key in stdio mode');
  // stdio takes the Warmup key from a flag or the environment, mirroring --api-key.
  const stdioTools = (args, env) => {
    const result = spawnSync(process.execPath, ['--import', FAKE_API, SERVER_PATH, ...args], {
      encoding: 'utf8',
      env: { ...process.env, FAKE_ZB_LOG: LOG_FILE, ...env },
      input:
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } },
        }) +
        '\n' +
        JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) +
        '\n' +
        JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }) +
        '\n',
      timeout: 15000,
    });
    const listed = result.stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .find((m) => m?.id === 2);
    return (listed?.result?.tools ?? []).map((t) => t.name);
  };

  const noKeyTools = stdioTools(['--api-key=stdio-key'], { ZEROBOUNCE_WARMUP_API_KEY: '' });
  check(
    noKeyTools.length > 0 && noKeyTools.every((n) => !n.startsWith('warmup_')),
    'stdio without a Warmup key advertises no Warmup tools',
    `${noKeyTools.filter((n) => n.startsWith('warmup_')).length} listed`
  );

  const flagTools = stdioTools(['--api-key=stdio-key', '--warmup-api-key=stdio-warmup'], {
    ZEROBOUNCE_WARMUP_API_KEY: '',
  });
  check(
    flagTools.filter((n) => n.startsWith('warmup_')).length === 26,
    '--warmup-api-key registers all 26 Warmup tools in stdio mode',
    `${flagTools.filter((n) => n.startsWith('warmup_')).length} listed`
  );

  const envTools = stdioTools(['--api-key=stdio-key'], {
    ZEROBOUNCE_WARMUP_API_KEY: 'stdio-warmup-env',
  });
  check(
    envTools.filter((n) => n.startsWith('warmup_')).length === 26,
    'ZEROBOUNCE_WARMUP_API_KEY registers the Warmup tools in stdio mode',
    `${envTools.filter((n) => n.startsWith('warmup_')).length} listed`
  );

  const httpIgnoresEnv = await freePort();
  const httpEnv = await startServer([`--port=${httpIgnoresEnv}`], {
    ZEROBOUNCE_WARMUP_API_KEY: 'should-be-ignored',
  });
  const envList = await rpc(httpEnv.origin, 'tools/list', {}, { 'X-ZeroBounce-Api-Key': 'env-key' });
  const envNames = (envList.message?.result?.tools ?? []).map((t) => t.name);
  check(
    envNames.length > 0 && envNames.every((n) => !n.startsWith('warmup_')),
    'HTTP mode ignores ZEROBOUNCE_WARMUP_API_KEY, so one caller cannot spend another\'s Warmup key',
    `${envNames.filter((n) => n.startsWith('warmup_')).length} listed`
  );
  await stopServer(httpEnv);
  check(
    bogus.status === 1 && /Invalid API URL/i.test(bogus.stderr),
    'a malformed API URL is refused',
    bogus.stderr.slice(0, 120)
  );
}

async function main() {
  if (!existsSync(SERVER_PATH)) {
    console.error(`Server not found at ${SERVER_PATH}. Run npm run build first.`);
    process.exit(1);
  }
  console.log(`Testing HTTP mode of ${SERVER_PATH}`);

  const port = await freePort();
  const server = await startServer(['--port', String(port)]);
  try {
    await testRoutingAndAuth(server.origin);
    const { names } = await testTools(server.origin);
    await testArgumentHandling(server.origin, names);
    await testErrorReporting(server.origin, names);
    await testBatchEmailColumn(server.origin);
    await testWarmup(server.origin);
    await testInboxPlacement(server.origin, names);
    await testKeyIsolation(server.origin, server);
  } finally {
    await stopServer(server);
  }
  await testBindHost();

  console.log(`\n${passes} passed, ${failures} failed`);
  rmSync(workDir, { recursive: true, force: true });
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  rmSync(workDir, { recursive: true, force: true });
  process.exit(1);
});

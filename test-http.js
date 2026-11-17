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
import { createServer, connect } from 'node:net';
import { request as httpRequest } from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = process.env.ZB_MCP_SERVER || join(__dirname, 'dist', 'index.js');
const FAKE_API = join(__dirname, 'test', 'fake-zerobounce-api.mjs');

// Every server this suite starts inherits this process's environment. Drop the
// key variables, so a key in the developer's shell never reaches a server under
// test and the suite runs as it does in CI; a test that needs one sets a dummy.
delete process.env.ZEROBOUNCE_API_KEY;
delete process.env.ZEROBOUNCE_WARMUP_API_KEY;

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

/**
 * Runs the server once and expects it to exit. A guard that stops refusing
 * would leave the server listening, so the run is killed after a timeout and
 * the check fails instead of the suite hanging.
 */
const CLI_TIMEOUT_MS = 15000;
function runCli(args, options = {}) {
  return spawnSync(process.execPath, args, {
    encoding: 'utf8',
    timeout: CLI_TIMEOUT_MS,
    killSignal: 'SIGKILL',
    ...options,
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
  bulk_email_finder_send_file: {
    fileContent: CSV,
    fileName: 'list.csv',
    domainColumn: 3,
    firstNameColumn: 1,
  },
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

  // Each private IPv4 range, and the public address just outside it, so that
  // dropping or widening a range fails here.
  const ipv4Hosts = [
    ['10.0.0.1', true],
    ['127.0.0.1', true],
    ['0.0.0.0', true],
    ['169.254.1.1', true],
    ['169.253.1.1', false],
    ['169.255.1.1', false],
    ['172.16.0.1', true],
    ['172.31.255.255', true],
    ['172.15.0.1', false],
    ['172.32.0.1', false],
    ['192.168.1.1', true],
    ['192.169.1.1', false],
    ['193.168.1.1', false],
  ];
  for (const [host, isPrivate] of ipv4Hosts) {
    const key = `ipv4-${host}`;
    const result = await callTool(origin, key, 'bulk_validate_send_file', {
      fileContent: CSV,
      fileName: 'list.csv',
      returnUrl: `https://${host}/hook`,
    });
    const refused = /private, link-local, or loopback/.test(toolText(result));
    check(
      refused === isPrivate && (loggedRequests(key).length === 0) === isPrivate,
      `IPv4 ${host} returnUrl is ${isPrivate ? 'rejected' : 'accepted'}`,
      toolText(result).slice(0, 180)
    );
  }

  // A hostname must be fully qualified: "intranet" names a host on the local network.
  for (const [host, accepted] of [['intranet', false], ['hooks.example.com', true]]) {
    const key = `fqdn-${host}`;
    const result = await callTool(origin, key, 'bulk_validate_send_file', {
      fileContent: CSV,
      fileName: 'list.csv',
      returnUrl: `https://${host}/hook`,
    });
    const refused = /fully qualified domain name/.test(toolText(result));
    check(
      refused === !accepted && (loggedRequests(key).length > 0) === accepted,
      `returnUrl host ${host} is ${accepted ? 'accepted' : 'rejected as not fully qualified'}`,
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

  // Every send-file tool can send has_header_row; validate and AI scoring can
  // send remove_duplicate, and validate its optional columns and allow_phase_2.
  // Each is sent only when given, so the request with only the required
  // arguments carries none of them beyond the SDK's own defaults.
  const sendFileList = await rpc(origin, 'tools/list', {}, { 'X-ZeroBounce-Api-Key': 'send-file-schema' });
  const toolsByName = Object.fromEntries(
    (sendFileList.message?.result?.tools ?? []).map((tool) => [tool.name, tool])
  );
  const SEND_FILE_TOOLS = {
    bulk_validate_send_file: {
      args: {
        hasHeaderRow: true,
        removeDuplicate: true,
        firstNameColumn: 1,
        lastNameColumn: 2,
        genderColumn: 3,
        ipAddressColumn: 4,
        allowPhase2: true,
      },
      fields: {
        has_header_row: 'true',
        remove_duplicate: 'true',
        first_name_column: '2',
        last_name_column: '3',
        gender_column: '4',
        ip_address_column: '5',
        allow_phase_2: 'true',
      },
    },
    bulk_ai_scoring_send_file: {
      args: { hasHeaderRow: true, removeDuplicate: true },
      fields: { has_header_row: 'true', remove_duplicate: 'true' },
    },
    bulk_email_finder_send_file: { args: { hasHeaderRow: true }, fields: { has_header_row: 'true' } },
    bulk_domain_search_send_file: { args: { hasHeaderRow: true }, fields: { has_header_row: 'true' } },
  };
  for (const [name, { args, fields }] of Object.entries(SEND_FILE_TOOLS)) {
    if (!has(name)) {
      continue;
    }
    const props = toolsByName[name].inputSchema.properties;
    check(
      Object.keys(args).every((arg) => arg in props),
      `${name} advertises ${Object.keys(args).join(', ')}`,
      Object.keys(props).join(',')
    );
    await callTool(origin, `send-all-${name}`, name, { ...TOOL_ARGS[name], ...args });
    const [req] = loggedRequests(`send-all-${name}`);
    const sent = Object.fromEntries(Object.keys(fields).map((field) => [field, req?.fields[field]]));
    check(
      JSON.stringify(sent) === JSON.stringify(fields),
      `${name} sends ${Object.keys(fields).join(', ')} when given`,
      JSON.stringify(req?.fields)
    );
    await callTool(origin, `send-false-${name}`, name, { ...TOOL_ARGS[name], hasHeaderRow: false });
    const [falseReq] = loggedRequests(`send-false-${name}`);
    check(
      falseReq?.fields.has_header_row === 'false',
      `${name} sends hasHeaderRow false as false`,
      JSON.stringify(falseReq?.fields)
    );
    // Left out, has_header_row is still sent, as false (the CHANGELOG's promise).
    await callTool(origin, `send-default-${name}`, name, TOOL_ARGS[name]);
    const [defaultReq] = loggedRequests(`send-default-${name}`);
    check(
      defaultReq?.fields.has_header_row === 'false',
      `${name} sends has_header_row false when hasHeaderRow is left out`,
      JSON.stringify(defaultReq?.fields)
    );
    // 1 and 0 are the only numbers that read as booleans; 2 is not true or false.
    for (const [given, wire] of [[1, 'true'], [0, 'false']]) {
      await callTool(origin, `send-num-${given}-${name}`, name, { ...TOOL_ARGS[name], hasHeaderRow: given });
      const [numReq] = loggedRequests(`send-num-${given}-${name}`);
      check(
        numReq?.fields.has_header_row === wire,
        `${name} sends hasHeaderRow ${given} as ${wire}`,
        JSON.stringify(numReq?.fields)
      );
    }
    for (const given of [2, -1, 0.5]) {
      const badNum = await callTool(origin, `send-badnum-${given}-${name}`, name, { ...TOOL_ARGS[name], hasHeaderRow: given });
      check(
        badNum.message?.result?.isError === true && loggedRequests(`send-badnum-${given}-${name}`).length === 0,
        `${name} refuses hasHeaderRow ${given}, before any request`,
        toolText(badNum).slice(0, 160)
      );
    }
    const bad = await callTool(origin, `send-bad-${name}`, name, { ...TOOL_ARGS[name], hasHeaderRow: 'junk' });
    check(
      bad.message?.result?.isError === true && loggedRequests(`send-bad-${name}`).length === 0,
      `${name} refuses a hasHeaderRow that is not a boolean, before any request`,
      toolText(bad).slice(0, 120)
    );
  }
  // The email finder and domain search sendfile endpoints take no return_url,
  // so the tools do not offer one they would drop.
  for (const name of ['bulk_email_finder_send_file', 'bulk_domain_search_send_file']) {
    if (has(name)) {
      check(
        !('returnUrl' in toolsByName[name].inputSchema.properties),
        `${name} does not advertise returnUrl`
      );
    }
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

  // An error message over the cap is cut to 1000 UTF-16 units, at a character
  // boundary: never between the two halves of an emoji.
  const longError = await callTool(origin, 'long-error-credits', 'get_credits', {});
  const longText = toolText(longError);
  const kept = longText.replace(/^Error: /, '').replace(/… \(truncated\)$/, '');
  check(
    isError(longError) &&
      longText.endsWith('… (truncated)') &&
      kept.length <= 1000 &&
      kept.length >= 990 &&
      !/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]|\ufffd/.test(longText),
    'a long error message is capped at 1000 characters and never split mid-character',
    `${kept.length} kept, ends ${JSON.stringify(longText.slice(-20))}`
  );

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

async function testParityGuards(origin, names) {
  console.log('\nSDK parity: dead keys, getfile errors, finder name column, argument types');
  const has = (n) => names.includes(n);
  const isError = (result) => result.message?.result?.isError === true;

  // LIVE: an invalid or drained key gets an HTTP 200 with no "success" field.
  // SDK 3.0.0 resolved these three as results, so the tools reported success.
  const deadKeyCalls = [
    ['find_email', TOOL_ARGS.find_email],
    ['domain_search', TOOL_ARGS.domain_search],
    ['list_filters', TOOL_ARGS.list_filters],
  ];
  for (const [name, args] of deadKeyCalls) {
    if (!has(name)) continue;
    const result = await callTool(origin, `dead-key-${name}`, name, args);
    check(
      isError(result) &&
        /Invalid API key or your account ran out of credits/.test(toolText(result)),
      `${name} reports a dead key's 200 body as an error`,
      toolText(result).slice(0, 160)
    );
  }

  // A getfile JSON error body surfaces with the API's own message.
  for (const name of [
    'bulk_validate_get_file',
    'bulk_ai_scoring_get_file',
    'bulk_email_finder_get_file',
    'bulk_domain_search_get_file',
  ]) {
    if (!has(name)) continue;
    const result = await callTool(origin, `getfile-json-${name}`, name, { fileId: 'f1' });
    check(
      isError(result) && /File not found/.test(toolText(result)),
      `${name} reports a JSON error body with its message`,
      toolText(result).slice(0, 160)
    );
  }

  if (has('bulk_email_finder_send_file')) {
    await callTool(origin, 'finder-full-name', 'bulk_email_finder_send_file', {
      fileContent: CSV,
      fileName: 'list.csv',
      domainColumn: 3,
      fullNameColumn: 1,
    });
    const [req] = loggedRequests('finder-full-name');
    check(
      String(req?.fields.full_name_column) === '2' && req?.fields.first_name_column === undefined,
      'bulk_email_finder_send_file sends fullNameColumn (0-based 1 -> API 2)',
      JSON.stringify(req?.fields)
    );

    const noName = await callTool(origin, 'finder-no-name', 'bulk_email_finder_send_file', {
      fileContent: CSV,
      fileName: 'list.csv',
      domainColumn: 3,
    });
    check(
      isError(noName) &&
        /firstNameColumn or fullNameColumn is required/.test(toolText(noName)) &&
        loggedRequests('finder-no-name').length === 0,
      'bulk_email_finder_send_file without a name column is refused before any request',
      toolText(noName).slice(0, 160)
    );
  }

  // SDK 4.0.0 behaviour, which the bundled SDK must have. 3.1.0 resolved a 2xx
  // error_message body that does not mention the key or credits, and returned an
  // application/json getfile answer as if it were the file, so each of these
  // tools reported success. 0.3.0 shipped with 3.1.0 and nothing failed.
  for (const name of ['validate_email', 'score_email', 'get_activity_data', 'get_api_usage', 'get_credits']) {
    if (!has(name)) continue;
    const result = await callTool(origin, `error-message-200-${name}`, name, TOOL_ARGS[name]);
    check(
      isError(result) && /The request was refused/.test(toolText(result)),
      `${name} reports a 2xx error_message body as an error (bundled SDK >= 4.0.0)`,
      toolText(result).slice(0, 160)
    );
  }
  if (has('bulk_validate_get_file')) {
    const result = await callTool(origin, 'getfile-jsontype-validate', 'bulk_validate_get_file', { fileId: 'f1' });
    check(
      isError(result) && !/list\.csv/.test(toolText(result)),
      'bulk_validate_get_file reports an application/json answer as an error, not as the file (bundled SDK >= 4.0.0)',
      toolText(result).slice(0, 160)
    );
  }

  // A string or string-array argument of the wrong type is refused, as a
  // number or boolean of the wrong type is, instead of being dropped or sent.
  const wrongTypes = [
    ['validate_email', { email: 'valid@example.com', ipAddress: 123 }, /ipAddress must be a string/],
    ['validate_batch', { emails: [1, 2] }, /emails must contain only non-empty strings/],
    ['validate_batch', { emails: ['a@example.com', null] }, /emails must contain only non-empty strings/],
    ['find_email', { domain: 123, firstName: 'Alice' }, /domain must be a string/],
    ['domain_search', { domain: 'example.com', company: { name: 'x' } }, /company must be a string/],
  ];
  let wrongIndex = 0;
  for (const [name, args, expected] of wrongTypes) {
    if (!has(name)) continue;
    const key = `types-wrong-${wrongIndex++}`;
    const result = await callTool(origin, key, name, args);
    check(
      isError(result) && expected.test(toolText(result)) && loggedRequests(key).length === 0,
      `${name} refuses ${JSON.stringify(args)} before any request`,
      toolText(result).slice(0, 160)
    );
  }

  if (has('validate_email')) {
    const badTimeout = await callTool(origin, 'types-timeout-abc', 'validate_email', {
      email: 'valid@example.com',
      timeout: 'abc',
    });
    check(
      isError(badTimeout) &&
        /timeout must be a number/.test(toolText(badTimeout)) &&
        loggedRequests('types-timeout-abc').length === 0,
      'validate_email refuses timeout "abc" instead of dropping it',
      toolText(badTimeout).slice(0, 160)
    );

    await callTool(origin, 'types-strings', 'validate_email', {
      email: 'valid@example.com',
      timeout: '10',
      activityData: 'false',
      verifyPlus: 'TRUE',
    });
    const [req] = loggedRequests('types-strings');
    check(
      req?.fields.timeout === '10' &&
        req?.fields.activity_data === 'false' &&
        req?.fields.verify_plus === 'true',
      'validate_email reads "10", "false" and "TRUE" as the number and booleans they spell',
      JSON.stringify(req?.fields)
    );

    const badBoolean = await callTool(origin, 'types-bool-yes', 'validate_email', {
      email: 'valid@example.com',
      activityData: 'yes',
    });
    check(
      isError(badBoolean) &&
        /activityData must be true or false/.test(toolText(badBoolean)) &&
        loggedRequests('types-bool-yes').length === 0,
      'validate_email refuses activityData "yes" instead of dropping it',
      toolText(badBoolean).slice(0, 160)
    );
  }
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
    // Report whether it matched, never the value. The fixtures use fake keys,
    // but a harness that prints a key on failure is one real key away from
    // putting it in a CI log.
    getAccount?.apiKey === undefined ? 'no API-Key header' : 'unexpected key value'
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

  // zb_managed: every documented email_content and managed_sending field goes
  // out as given, and a fractional timezone_offset is accepted.
  const emailContent = {
    company_name: 'Example Inc',
    company_website: 'https://example.com',
    company_description: 'We send newsletters.',
    types_of_emails: ['transactional', 'newsletter', 'marketing'],
    example_email: 'Hello from Example Inc.',
  };
  const managedSending = {
    weekdays_only: true,
    timezone: 'Asia/Kolkata',
    timezone_offset: 5.5,
    warmup_start_date: '2026-12-01',
  };
  await warmupCall('v-zb-managed', 'w-zb-managed', 'warmup_add_sending_account', {
    fromAddress: WARMUP_FROM,
    onboardingModel: 'zb_managed',
    emailContent,
    managedSending,
  });
  const [managed] = loggedRequests('w-zb-managed');
  check(
    managed?.method === 'POST' &&
      managed?.path === '/sending-accounts' &&
      JSON.stringify(managed?.fields) ===
        JSON.stringify({
          from_address: WARMUP_FROM,
          onboarding_model: 'zb_managed',
          email_content: emailContent,
          managed_sending: managedSending,
        }),
    'warmup_add_sending_account sends every documented zb_managed field',
    `${managed?.method} ${managed?.path} ${JSON.stringify(managed?.fields)}`
  );
  for (const [offset, accepted] of [[3.0, true], [-9.5, true], [-11.5, false], [14.5, false]]) {
    const warmupKey = `w-offset-${String(offset).replace('.', '_')}`;
    const result = await warmupCall('v-offset', warmupKey, 'warmup_add_sending_account', {
      fromAddress: WARMUP_FROM,
      onboardingModel: 'zb_managed',
      managedSending: { timezone_offset: offset },
    });
    const sent = loggedRequests(warmupKey);
    check(
      accepted
        ? sent[0]?.fields?.managed_sending?.timezone_offset === offset
        : result.message?.result?.isError === true && sent.length === 0,
      `warmup_add_sending_account ${accepted ? 'accepts' : 'rejects'} timezone_offset ${offset}`,
      `${toolText(result).slice(0, 120)} ${JSON.stringify(sent[0]?.fields)}`
    );
  }

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

  // Only a 2xx makes an empty body a completed delete. An empty 404 or 500 is an
  // error with its status; reading it as "deleted" would hide a failed delete.
  for (const status of [404, 500]) {
    const failed = await callTool(origin, `ipt-empty-${status}-1`, 'delete_inbox_placement_test', {
      testId: '42',
    });
    const failedText = toolText(failed);
    check(
      isError(failed) && new RegExp(`\\b${status}\\b`).test(failedText) && !/deleted/.test(failedText),
      `delete_inbox_placement_test reports an empty ${status} as an error with its status`,
      failedText.slice(0, 160)
    );
  }
  const emptyOk = await callTool(origin, 'ipt-empty-200-1', 'delete_inbox_placement_test', {
    testId: '42',
  });
  check(
    !isError(emptyOk) && /"success": true/.test(toolText(emptyOk)),
    'delete_inbox_placement_test reads an empty 200 body as success',
    toolText(emptyOk).slice(0, 160)
  );
  // Only a body of zero bytes is empty: three spaces are not JSON, and not a
  // completed delete either (E8, E7).
  const blank = await callTool(origin, 'ipt-blank-200-1', 'delete_inbox_placement_test', {
    testId: '42',
  });
  check(
    isError(blank) && /\b200\b/.test(toolText(blank)) && !/deleted/.test(toolText(blank)),
    'delete_inbox_placement_test reports a whitespace-only 200 as an error with its status',
    toolText(blank).slice(0, 160)
  );
  // An empty 2xx is a success only for the delete.
  const emptyGet = await callTool(origin, 'ipt-empty-200-2', 'get_inbox_placement_test', {
    testId: '42',
  });
  check(
    isError(emptyGet),
    'get_inbox_placement_test reports an empty 200 as an error',
    toolText(emptyGet).slice(0, 160)
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

  // Nothing the server logs carries a key: every key that reached the fake API
  // in this run (including the error modes, whose bodies echo the key) is
  // searched for in the server's stderr, raw and URL-encoded.
  const sentKeys = existsSync(LOG_FILE)
    ? [...new Set(readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line).apiKey))]
        .filter((k) => typeof k === 'string' && k.length >= 8)
    : [];
  const logged = server.stderr();
  const leakedKeys = sentKeys.filter((k) => logged.includes(k) || logged.includes(encodeURIComponent(k)));
  check(
    sentKeys.length > 50 && leakedKeys.length === 0,
    `the server log carries none of the ${sentKeys.length} API keys used`,
    `leaked: ${leakedKeys.slice(0, 5).join(', ')}`
  );
}

async function testBindHost() {
  console.log('\nBind host');
  const refused = runCli([SERVER_PATH, '--http', '--host', '0.0.0.0'], {
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
  // The resource says whether a key is set; it never carries the key itself.
  const configRead = await rpc(def.origin, 'resources/read', { uri: 'zerobounce://config' }, {
    'X-ZeroBounce-Api-Key': 'config-secret-key',
  });
  const configText = configRead.message?.result?.contents?.[0]?.text ?? '';
  check(
    JSON.parse(configText || '{}').apiKeyConfigured === true && !configText.includes('config-secret-key'),
    'zerobounce://config reports apiKeyConfigured as true, not the key'
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

  const slashPort = await freePort();
  const slash = await startServer([`--port=${slashPort}`, '--url=https://stub.example.com/v2//']);
  check(
    (await readBaseUrl(slash.origin)) === 'https://stub.example.com/v2',
    'trailing slashes are stripped from an explicit API URL'
  );
  await stopServer(slash);

  // Never silently fall back to production: a caller who asked for one host and
  // got another would send their key somewhere they did not choose.
  const insecure = runCli(
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

  const bogus = runCli([SERVER_PATH, '--http', '--url=not-a-url'], {
    encoding: 'utf8',
  });
  check(bogus.status === 1 && /Invalid API URL/i.test(bogus.stderr),
    'a malformed API URL is refused', bogus.stderr.slice(0, 120));

  const userinfo = runCli(
    [SERVER_PATH, '--http', '--url=https://user:secret@127.0.0.1/v2'],
    { encoding: 'utf8' }
  );
  check(
    userinfo.status === 1 &&
      /must not contain a username or password/i.test(userinfo.stderr) &&
      !userinfo.stderr.includes('secret'),
    'an API URL with a username or password is refused without quoting it',
    userinfo.stderr.slice(0, 160)
  );

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

  const wSlashPort = await freePort();
  const wSlash = await startServer([`--port=${wSlashPort}`, '--warmup-url=https://warmup.example.com/']);
  check((await readWarmupConfig(wSlash.origin)).warmupBaseUrl === 'https://warmup.example.com',
    'trailing slashes are stripped from an explicit Warmup URL');
  await stopServer(wSlash);

  const wRegion = runCli([SERVER_PATH, '--http', '--warmup-url=us'], {
    encoding: 'utf8',
  });
  check(wRegion.status === 1 && /Invalid Warmup API URL/i.test(wRegion.stderr),
    'a regional shorthand is refused: no regional Warmup host exists',
    wRegion.stderr.slice(0, 120));

  const wInsecure = runCli(
    [SERVER_PATH, '--http', '--warmup-url=http://warmup-api.zerobounce.net'],
    { encoding: 'utf8' }
  );
  check(wInsecure.status === 1 && /must use https/i.test(wInsecure.stderr),
    'a non-https Warmup URL is refused, not silently replaced',
    wInsecure.stderr.slice(0, 120));

  console.log('\nWarmup key in stdio mode');
  // stdio takes the Warmup key from a flag or the environment, mirroring --api-key.
  const stdioTools = (args, env) => {
    const result = runCli(['--import', FAKE_API, SERVER_PATH, ...args], {
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

  // The same for the validation key: an HTTP caller who sends no key must get a
  // 401, never the server operator's ZEROBOUNCE_API_KEY. The value is a dummy,
  // set for this one server process only.
  const ENV_KEY = 'env-fallback-dummy-key';
  const httpKeyPort = await freePort();
  const httpKeyEnv = await startServer([`--port=${httpKeyPort}`], { ZEROBOUNCE_API_KEY: ENV_KEY });
  try {
    const listNoKey = await rpc(httpKeyEnv.origin, 'tools/list', {});
    check(
      listNoKey.status === 401 && /API key is required/.test(listNoKey.message?.error?.message ?? ''),
      'HTTP mode does not fall back to ZEROBOUNCE_API_KEY: tools/list without a key returns 401',
      `status ${listNoKey.status}`
    );
    const callNoKey = await rpc(httpKeyEnv.origin, 'tools/call', {
      name: 'validate_email',
      arguments: { email: 'valid@example.com' },
    });
    check(
      callNoKey.status === 401 && loggedRequests(ENV_KEY).length === 0,
      'HTTP mode does not fall back to ZEROBOUNCE_API_KEY: a tool call without a key returns 401 and sends nothing',
      `status ${callNoKey.status}, ${loggedRequests(ENV_KEY).length} requests with the environment key`
    );
  } finally {
    await stopServer(httpKeyEnv);
  }
  check(
    bogus.status === 1 && /Invalid API URL/i.test(bogus.stderr),
    'a malformed API URL is refused',
    bogus.stderr.slice(0, 120)
  );
}

/** The version esbuild baked into a bundle, or null. */
function bundledVersion(source) {
  const match = /\bSERVER_VERSION = (?:true \? )?"([^"]+)"/.exec(source);
  return match ? match[1] : null;
}

/**
 * The bundle must carry the package.json version. CI and Publish rebuild dist/
 * before testing, so the committed bundle is checked as well, from the git index
 * (what a checkout or a git install ships): the v0.3.1 release commit kept a
 * dist/index.js that still reported 0.3.0.
 */
function testBundleVersion() {
  console.log('\nBundle version');
  if (!process.env.ZB_MCP_SERVER) {
    const { version } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
    const built = bundledVersion(readFileSync(SERVER_PATH, 'utf8'));
    check(built === version, `dist/index.js carries the package.json version ${version}`, `bundle says ${built}`);
  }

  // The SDK is bundled and is only a devDependency, so an installed server has no copy of
  // it: the bundle must not load it at run time.
  const bundle = readFileSync(SERVER_PATH, 'utf8');
  check(
    !/\b(?:from|import|require)\s*\(?\s*['"]@zerobounce\/zero-bounce-sdk/.test(bundle),
    'dist/index.js bundles @zerobounce/zero-bounce-sdk instead of importing it'
  );

  const git = (...args) => spawnSync('git', ['-C', __dirname, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (git('ls-files', '--error-unmatch', 'dist/index.js').status !== 0) {
    console.log('  (not a git checkout with a committed dist/index.js; committed-bundle check skipped)');
    return;
  }
  const committedPackage = git('show', ':package.json');
  const committedBundle = git('show', ':dist/index.js');
  const committedVersion = committedPackage.status === 0 ? JSON.parse(committedPackage.stdout).version : null;
  const committedBuilt = committedBundle.status === 0 ? bundledVersion(committedBundle.stdout) : null;
  check(
    committedVersion !== null && committedBuilt === committedVersion,
    `the committed dist/index.js carries the committed package.json version ${committedVersion}`,
    `committed bundle says ${committedBuilt}; rebuild and commit dist/index.js`
  );
}


/** Sends one raw HTTP/1.1 request over a socket and returns what the server wrote back. */
function rawRequest(origin, text) {
  const { hostname, port } = new URL(origin);
  return new Promise((resolve) => {
    const socket = connect(Number(port), hostname);
    let data = '';
    const timer = setTimeout(() => socket.destroy(), 5000);
    socket.on('data', (chunk) => (data += chunk));
    socket.on('error', () => {});
    socket.on('close', () => {
      clearTimeout(timer);
      resolve(data);
    });
    socket.write(text);
  });
}

/** POSTs an initialize with exact header control (fetch cannot set Host or repeat a header). */
function postWithHeaders(origin, headerList) {
  const { hostname, port } = new URL(origin);
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 't', version: '0' } },
  });
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        hostname,
        port,
        path: '/mcp',
        method: 'POST',
        setHost: false,
        headers: [
          'Content-Type',
          'application/json',
          'Accept',
          'application/json, text/event-stream',
          'Content-Length',
          String(Buffer.byteLength(body)),
          ...headerList,
        ],
      },
      (res) => {
        let text = '';
        res.on('data', (c) => (text += c));
        res.on('end', () => resolve({ status: res.statusCode, text }));
      }
    );
    req.on('error', reject);
    req.end(body);
  });
}

async function testHttpHardening(origin, names) {
  console.log('\nHTTP hardening: request target, Host/Origin, credential headers');
  const has = (name) => names.includes(name);
  const { port } = new URL(origin);

  const bad = await rawRequest(origin, 'GET //[ HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n');
  check(/^HTTP\/1\.1 400/.test(bad), 'GET //[ is answered 400', bad.slice(0, 60));
  const alive = await fetch(`${origin}/health`);
  check(alive.status === 200, 'the server survives a request target that does not parse');
  const star = await rawRequest(origin, 'OPTIONS * HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n');
  check(/^HTTP\/1\.1 400/.test(star), 'a non-origin-form request target is answered 400');
  const doubleSlash = await rawRequest(origin, 'GET //mcp HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n');
  check(/^HTTP\/1\.1 400/.test(doubleSlash), '//mcp is not routed as /mcp');

  const hdr = (name, value) => [name, value];
  const key = ['X-ZeroBounce-Api-Key', 'hard-key'];
  const okHost = await postWithHeaders(origin, [...key, 'Host', `127.0.0.1:${port}`]);
  check(okHost.status === 200, 'Host 127.0.0.1 is accepted', okHost.text.slice(0, 120));
  const localhostHost = await postWithHeaders(origin, [...key, 'Host', `localhost:${port}`]);
  check(localhostHost.status === 200, 'Host localhost is accepted');
  const v6Host = await postWithHeaders(origin, [...key, 'Host', `[::1]:${port}`]);
  check(v6Host.status === 200, 'Host [::1] is accepted');
  const evilHost = await postWithHeaders(origin, [...key, 'Host', `evil.example:${port}`]);
  check(evilHost.status === 403, 'a foreign Host is refused (DNS rebinding)', String(evilHost.status));
  const rebind = await postWithHeaders(origin, [
    ...key, 'Host', 'evil.example', 'Origin', 'http://evil.example',
  ]);
  check(rebind.status === 403, 'Host evil.example with a same-site Origin is refused');
  const crossOrigin = await postWithHeaders(origin, [
    ...key, 'Host', `127.0.0.1:${port}`, 'Origin', 'http://evil.example',
  ]);
  check(crossOrigin.status === 403, 'a cross-origin Origin is refused');
  const nullOrigin = await postWithHeaders(origin, [...key, 'Host', `127.0.0.1:${port}`, 'Origin', 'null']);
  check(nullOrigin.status === 403, 'Origin: null is refused');
  const localOrigin = await postWithHeaders(origin, [
    ...key, 'Host', `127.0.0.1:${port}`, 'Origin', `http://localhost:${port}`,
  ]);
  check(localOrigin.status === 200, 'a loopback Origin is accepted');
  const noHost = await rawRequest(origin, 'POST /mcp HTTP/1.0\r\nContent-Length: 2\r\nX-ZeroBounce-Api-Key: hard-key\r\n\r\n{}');
  check(/^HTTP\/1\.[01] 403/.test(noHost), 'a request without a Host header is refused');

  const dup = await postWithHeaders(origin, [
    ...key, ...hdr('X-ZeroBounce-Api-Key', 'other-key'), 'Host', `127.0.0.1:${port}`,
  ]);
  check(dup.status === 400, 'two X-ZeroBounce-Api-Key headers are refused', String(dup.status));
  const dupAuth = await postWithHeaders(origin, [
    'Authorization', 'Bearer a-key', 'Authorization', 'Bearer b-key', 'Host', `127.0.0.1:${port}`,
  ]);
  check(dupAuth.status === 400, 'two Authorization headers are refused');
  const conflict = await postWithHeaders(origin, [
    ...key, 'Authorization', 'Bearer other-key', 'Host', `127.0.0.1:${port}`,
  ]);
  check(conflict.status === 400, 'an X key that differs from the Bearer token is refused');
  const same = await postWithHeaders(origin, [
    ...key, 'Authorization', 'Bearer hard-key', 'Host', `127.0.0.1:${port}`,
  ]);
  check(same.status === 200, 'the same key in both headers is accepted');
  const dupWarmup = await postWithHeaders(origin, [
    ...key, 'X-ZeroBounce-Warmup-Api-Key', 'w1', 'X-ZeroBounce-Warmup-Api-Key', 'w2', 'Host', `127.0.0.1:${port}`,
  ]);
  check(dupWarmup.status === 400, 'two Warmup key headers are refused');

  // Key characters, over HTTP (latin-1 only) and on the command line (all of Unicode).
  const softHyphen = await postWithHeaders(origin, [
    'X-ZeroBounce-Api-Key', Buffer.from('ab­cd', 'latin1').toString('latin1'), 'Host', `127.0.0.1:${port}`,
  ]);
  check(softHyphen.status === 401, 'a key with U+00AD is refused over HTTP');
  const warmupBad = await postWithHeaders(origin, [
    ...key, 'X-ZeroBounce-Warmup-Api-Key', 'ab­cd', 'Host', `127.0.0.1:${port}`,
  ]);
  check(warmupBad.status === 401, 'a Warmup key with an invisible character is refused over HTTP');
  const warmupGood = await postWithHeaders(origin, [
    ...key, 'X-ZeroBounce-Warmup-Api-Key', 'warm-key', 'Host', `127.0.0.1:${port}`,
  ]);
  check(warmupGood.status === 200, 'a clean Warmup key is accepted over HTTP');

  const cliKey = (value, extra = []) =>
    runCli([SERVER_PATH, '--api-key', value, ...extra], { env: { ...process.env, ZEROBOUNCE_API_KEY: '' } });
  const invisible = {
    'U+200B': '​',
    'U+200C': '‌',
    'U+200F': '‏',
    'U+202A': '‪',
    'U+2060': '⁠',
    'U+2064': '⁤',
    'U+2069': '⁩',
    'U+FFFA': '￺',
    'U+E0001 (tag)': '\u{e0001}',
    'U+115F': 'ᅟ',
    'U+3164': 'ㅤ',
    'U+FE0F': '️',
    'U+034F': '͏',
    'U+061C': '؜',
    'U+0085 (C1)': '\u0085',
    'U+2003 (em space)': ' ',
  };
  for (const [label, ch] of Object.entries(invisible)) {
    const r = cliKey(`ab${ch}cd`);
    check(
      r.status === 1 && /invisible characters/.test(r.stderr),
      `a key with ${label} is refused`,
      `${r.status} ${r.stderr.slice(0, 100)}`
    );
  }
  const warmupCli = runCli([SERVER_PATH, '--api-key', 'good-key', '--warmup-api-key', 'ab‌d']);
  check(warmupCli.status === 1 && /invisible characters/.test(warmupCli.stderr), 'a Warmup key with U+200C is refused');
  const marksOnly = cliKey('́̂');
  check(marksOnly.status === 1, 'a key of combining marks only is refused');

  // Base URL: an empty query or fragment is still a query or fragment.
  for (const url of ['https://api.example.test/v2?', 'https://api.example.test/v2#', 'https://api.example.test/v2?a=1']) {
    const r = runCli([SERVER_PATH, '--http', '--url', url]);
    check(
      r.status === 1 && /query string or a fragment/.test(r.stderr),
      `API URL ${url} is refused`,
      r.stderr.slice(0, 100)
    );
  }

  // returnUrl / webhookUrl
  console.log('\nreturnUrl and webhookUrl');
  const send = (returnUrl, apiKey = 'url-key') =>
    callTool(origin, apiKey, 'bulk_validate_send_file', { fileContent: 'email\na@example.com\n', fileName: 'u.csv', returnUrl });
  const refusedUrls = [
    'https://localhost./hook',
    'https://LOCALHOST/hook',
    'https://foo.localhost/hook',
    'https://app.localhost./hook',
    'https://[::127.0.0.1]/hook',
    'https://[::ffff:0:7f00:1]/hook',
    'https://[::ffff:7f00:1]/hook',
    'https://[64:ff9b::7f00:1]/hook',
    'https://[64:ff9b::a00:1]/hook',
    'https://[64:ff9b:1::1]/hook',
    'https://[2002:7f00:1::]/hook',
    'https://[2002:a9fe:a9fe::1]/hook',
    'https://100.64.0.1/hook',
    'https://198.18.0.1/hook',
    'https://192.0.0.1/hook',
    'https://224.0.0.1/hook',
    'https://255.255.255.255/hook',
    'https://169.254.169.254/hook',
    'https://0x7f.1/hook',
    'https://2130706433/hook',
    'https://[fec0::1]/hook',
    'https://[ff02::1]/hook',
    'https://[fe80::1]/hook',
    'https://[fd00::1]/hook',
    'https://[2001:db8::1]/hook',
    'https://[::]/hook',
    'https://127.0.0.1.nip.io/hook',
    'https://a.b.sslip.io/hook',
    'https://metadata.google.internal/hook',
    'https://metadata.google.internal./hook',
    'https://metadata.goog/hook',
    'https://192.31.196.1/hook',
    'https://192.52.193.1/hook',
    'https://192.175.48.1/hook',
    'https://[2620:4f:8000::1]/hook',
    'https://user:pw@example.com/hook',
    'https://user@example.com/hook',
    'https://example.com:8443/hook',
    'https://example.com:80/hook',
    'https://exa\tmple.com/hook',
    'https://example.com/ho\nok',
    'https://example.com/ho\rok',
    'https://example.com/hook​',
    'https://example.com/hook⁠',
    ' https://example.com/hook',
    'https://example.com/hook ',
    'https://example.com\\@evil.test/hook',
    'https://example.com/ho\u0000ok',
  ];
  for (const url of refusedUrls) {
    const r = await send(url);
    check(
      /returnUrl must/.test(toolText(r)) && loggedRequests('url-key').length === 0,
      `returnUrl ${JSON.stringify(url)} is refused`,
      toolText(r).slice(0, 120)
    );
  }
  const accepted = await send('https://Example.COM.:443/Hook?a=1#f', 'url-ok');
  const sent = loggedRequests('url-ok').find((e) => e.fields?.return_url);
  check(
    sent?.fields.return_url === 'https://example.com/Hook?a=1#f',
    'the normalised href is forwarded (lower-case host, no trailing dot, :443 dropped)',
    `${sent?.fields.return_url} ${toolText(accepted).slice(0, 80)}`
  );
  for (const url of ['https://[2606:4700::1111]/hook', 'https://1.1.1.1/hook', 'https://[2002:808:808::]/hook']) {
    const r = await send(url, `url-ok-${url.length}`);
    check(
      loggedRequests(`url-ok-${url.length}`).length === 1,
      `public returnUrl ${url} is forwarded`,
      toolText(r).slice(0, 100)
    );
  }
  if (has('set_inbox_placement_webhook')) {
    const r = await callTool(origin, 'hook-key', 'set_inbox_placement_webhook', {
      webhookUrl: 'https://metadata.google.internal/x',
    });
    check(/webhookUrl must/.test(toolText(r)), 'webhookUrl uses the same refusal');
    const r2 = await callTool(origin, 'hook-key', 'set_inbox_placement_webhook', {
      webhookUrl: 'https://user:pw@example.com/x',
    });
    check(/webhookUrl must not contain a username/.test(toolText(r2)), 'webhookUrl with userinfo is refused');
  }
  const rootJob = names.find((n) => /_s3_file$/.test(n) || /_sftp_file$/.test(n));
  if (rootJob) {
    const r = await callTool(origin, 'root-key', rootJob, { ...TOOL_ARGS[rootJob], returnUrl: 'https://example.com/h\nx' });
    check(/returnUrl must not contain control/.test(toolText(r)), `${rootJob} refuses CR/LF in returnUrl`, toolText(r).slice(0, 100));
    const r2 = await callTool(origin, 'root-key', rootJob, { ...TOOL_ARGS[rootJob], fileName: 'a\r\nb.csv' });
    check(/fileName must not contain control/.test(toolText(r2)), `${rootJob} refuses CR/LF in fileName`);
  }

  console.log('\nInput limits');
  const bulk = (args) =>
    callTool(origin, 'limit-key', 'bulk_validate_send_file', { fileContent: 'email\na@example.com\n', fileName: 'l.csv', ...args });
  for (const [label, args, re] of [
    ['CRLF in fileName', { fileName: 'a\r\nX: 1.csv' }, /fileName must not contain control/],
    ['NUL in fileName', { fileName: 'a\u0000.csv' }, /fileName must not contain control/],
    ['negative column', { emailAddressColumn: -1 }, /emailAddressColumn must be a whole number/],
    ['fractional column', { emailAddressColumn: 1.5 }, /emailAddressColumn must be a whole number/],
    ['huge column', { emailAddressColumn: 1e9 }, /emailAddressColumn must be a whole number/],
    ['column 1000', { emailAddressColumn: 1000 }, /emailAddressColumn must be a whole number/],
    ['unsafe-integer column', { emailAddressColumn: 2 ** 60 }, /emailAddressColumn must be a whole number/],
    ['fractional first-name column', { firstNameColumn: 0.5 }, /firstNameColumn must be a whole number/],
  ]) {
    const r = await bulk(args);
    check(re.test(toolText(r)) && loggedRequests('limit-key').length === 0, `${label} is refused`, toolText(r).slice(0, 120));
  }
  const col999 = await callTool(origin, 'col-ok', 'bulk_validate_send_file', {
    fileContent: 'email\na@example.com\n', fileName: 'l.csv', emailAddressColumn: 999,
  });
  check(loggedRequests('col-ok').length === 1, 'column 999 (the last) is accepted', toolText(col999).slice(0, 100));
  if (has('list_evaluator_send_file')) {
    const r = await callTool(origin, 'le-key', 'list_evaluator_send_file', {
      fileContent: 'a@example.com\n', fileName: 'l.csv', emailAddressColumn: -1,
    });
    check(/emailAddressColumn must be a whole number/.test(toolText(r)), 'list_evaluator_send_file refuses a negative column');
    const r2 = await callTool(origin, 'le-key', 'list_evaluator_send_file', {
      fileContent: 'a@example.com\n', fileName: 'l\n.csv',
    });
    check(/fileName must not contain control/.test(toolText(r2)), 'list_evaluator_send_file refuses CR/LF in fileName');
  }
  const batch = (args) => callTool(origin, 'batch-limit', 'validate_batch', args);
  const b1 = await batch({ emails: ['a@example.com'], emailAddressColumn: -1 });
  check(/emailAddressColumn must be a whole number/.test(toolText(b1)), 'validate_batch refuses a negative column');
  const b2 = await batch({ emails: Array.from({ length: 201 }, (_, i) => `u${i}@example.com`) });
  check(/at most 200/.test(toolText(b2)) && loggedRequests('batch-limit').length === 0, 'validate_batch refuses 201 emails');
  const b3 = await batch({ emails: ['a'.repeat(321) + '@example.com'] });
  check(/at most 320 characters/.test(toolText(b3)), 'validate_batch refuses an email over 320 characters');
  const b4 = await callTool(origin, 'batch-200', 'validate_batch', {
    emails: Array.from({ length: 200 }, (_, i) => `u${i}@example.com`),
  });
  check(loggedRequests('batch-200').length === 1, 'validate_batch accepts exactly 200 emails', toolText(b4).slice(0, 100));
  const v1 = await callTool(origin, 'email-limit', 'validate_email', { email: 'a'.repeat(100000) + '@example.com' });
  check(/at most 320 characters/.test(toolText(v1)) && loggedRequests('email-limit').length === 0, 'validate_email refuses a 100000-character email');
  if (has('get_api_usage')) {
    for (const [start, end, label] of [
      ['yesterday', '2024-01-02', 'a word'],
      ['2024-13-45', '2024-01-02', 'month 13'],
      ['2023-02-29', '2024-01-02', 'Feb 29 in a common year'],
      ['2024-1-2', '2024-01-02', 'a short form'],
      ['2024-02-01', '2024-01-01', 'start after end'],
    ]) {
      const r = await callTool(origin, 'usage-limit', 'get_api_usage', { startDate: start, endDate: end });
      check(
        /startDate|endDate/.test(toolText(r)) && r.message?.result?.isError === true && loggedRequests('usage-limit').length === 0,
        `get_api_usage refuses ${label}`,
        toolText(r).slice(0, 100)
      );
    }
    const okDates = await callTool(origin, 'usage-ok', 'get_api_usage', { startDate: '2024-02-29', endDate: '2024-02-29' });
    check(loggedRequests('usage-ok').length === 1, 'get_api_usage accepts a real leap day, start equal to end', toolText(okDates).slice(0, 100));
  }
}

async function testAllowedHosts() {
  console.log('\nAllowed hosts on a public bind');
  const port = await freePort();
  const server = await startServer(['--port', String(port), '--host', '0.0.0.0', '--allowed-host', 'mcp.example.test'], {
    MCP_TLS_TERMINATED: 'true',
  });
  const key = ['X-ZeroBounce-Api-Key', 'ah-key'];
  const good = await postWithHeaders(server.origin.replace('0.0.0.0', '127.0.0.1'), [...key, 'Host', 'mcp.example.test']);
  check(good.status === 200, 'an --allowed-host name is accepted');
  const bad = await postWithHeaders(server.origin.replace('0.0.0.0', '127.0.0.1'), [...key, 'Host', 'evil.example']);
  check(bad.status === 403, 'a name that is not allowed is refused');
  const origin = await postWithHeaders(server.origin.replace('0.0.0.0', '127.0.0.1'), [
    ...key, 'Host', 'mcp.example.test', 'Origin', 'https://evil.example',
  ]);
  check(origin.status === 403, 'a cross-origin Origin is refused on a public bind');
  const own = await postWithHeaders(server.origin.replace('0.0.0.0', '127.0.0.1'), [
    ...key, 'Host', 'mcp.example.test', 'Origin', 'https://mcp.example.test',
  ]);
  check(own.status === 200, 'the allowed host as Origin is accepted');
  await stopServer(server);

  const envPort = await freePort();
  const env = await startServer(['--port', String(envPort), '--host', '0.0.0.0'], {
    MCP_TLS_TERMINATED: 'true',
    MCP_ALLOWED_HOSTS: 'a.example.test, b.example.test:443',
  });
  const base = env.origin.replace('0.0.0.0', '127.0.0.1');
  const e1 = await postWithHeaders(base, [...key, 'Host', 'b.example.test']);
  const e2 = await postWithHeaders(base, [...key, 'Host', 'c.example.test']);
  check(e1.status === 200 && e2.status === 403, 'MCP_ALLOWED_HOSTS lists the accepted names');
  await stopServer(env);

  const openPort = await freePort();
  const open = await startServer(['--port', String(openPort), '--host', '0.0.0.0'], { MCP_TLS_TERMINATED: 'true' });
  const o1 = await postWithHeaders(open.origin.replace('0.0.0.0', '127.0.0.1'), [...key, 'Host', 'whatever.example']);
  check(o1.status === 200, 'a wildcard bind with no allow-list does not restrict Host');
  check(/Host header is not restricted/.test(open.stderr()), 'and says so on stderr');
  await stopServer(open);
}

async function testTransportEdges() {
  console.log('\nTransport edges: allowed-host validation, duplicate Host, Origin, limits');
  for (const bad of ['https://mcp.example.org', ':::', 'a/b', '[::]', '[:::]', '0.0.0.0', '-', 'a_b', 'host:99999', 'host:0', '-a.example', 'a-.example', 'a..example', '[::]:80']) {
    const r = runCli([SERVER_PATH, '--http', '--allowed-host', bad], { encoding: 'utf8', env: { ...process.env } });
    check(r.status === 1 && /Invalid allowed host/.test(r.stderr), `--allowed-host ${bad} stops startup`, `${r.status} ${r.stderr.slice(0, 120)}`);
  }
  const envBad = runCli([SERVER_PATH, '--http', '--host', '0.0.0.0'], {
    encoding: 'utf8',
    env: { ...process.env, MCP_TLS_TERMINATED: 'true', MCP_ALLOWED_HOSTS: 'https://mcp.example.org' },
  });
  for (const good of ['mcp.example.org', 'mcp.example.org:8443', 'EXAMPLE.org.', '10.0.0.5', '[2001:db8::1]:443']) {
    const goodServer = await startServer(['--port', String(await freePort()), '--allowed-host', good]);
    check(true, `--allowed-host ${good} is accepted`);
    await stopServer(goodServer);
  }
  check(envBad.status === 1 && /Invalid allowed host/.test(envBad.stderr), 'MCP_ALLOWED_HOSTS with a URL stops startup');

  const port = await freePort();
  const server = await startServer(['--port', String(port)]);
  const key = ['X-ZeroBounce-Api-Key', 'edge-key'];
  const dupHost = await rawRequest(
    server.origin,
    `GET /health HTTP/1.1\r\nHost: 127.0.0.1\r\nHost: evil.example\r\nConnection: close\r\n\r\n`
  );
  check(/^HTTP\/1\.1 400/.test(dupHost), 'two Host headers are refused with 400', dupHost.slice(0, 40));
  const ws = await postWithHeaders(server.origin, [...key, 'Host', `127.0.0.1:${port}`, 'Origin', `ws://127.0.0.1:${port}`]);
  check(ws.status === 403, 'a ws:// Origin is refused even when its host is allowed');
  const dot = await postWithHeaders(server.origin, [...key, 'Host', 'localhost.']);
  check(dot.status === 200, 'a trailing dot on the Host name is ignored');
  await stopServer(server);

  const cfgPort = await freePort();
  const child = spawn(process.execPath, ['--import', FAKE_API, '--import', join(__dirname, 'test', 'inspect-http.mjs'), SERVER_PATH, '--http', '--port', String(cfgPort)], {
    env: { ...process.env, FAKE_ZB_LOG: LOG_FILE },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let err = '';
  child.stderr.on('data', (c) => (err += c));
  for (let i = 0; i < 100 && !/HTTPCFG/.test(err); i++) await new Promise((r) => setTimeout(r, 100));
  child.kill();
  const cfg = JSON.parse((err.match(/HTTPCFG (\{.*\})/) ?? [, 'null'])[1]);
  check(cfg?.headersTimeout === 15000, 'headersTimeout is 15 s', JSON.stringify(cfg));
  check(cfg?.requestTimeout === 120000, 'requestTimeout is 120 s');
  check(cfg?.maxConnections === 512, 'maxConnections is 512');

  const openPort = await freePort();
  const open = await startServer(['--port', String(openPort), '--host', '0.0.0.0'], { MCP_TLS_TERMINATED: 'true' });
  const base = open.origin.replace('0.0.0.0', '127.0.0.1');
  const cross = await postWithHeaders(base, [...key, 'Host', 'whatever.example', 'Origin', 'https://evil.example']);
  check(cross.status === 403, 'unrestricted wildcard bind: a cross-origin Origin is refused');
  const same = await postWithHeaders(base, [...key, 'Host', 'whatever.example', 'Origin', 'https://whatever.example']);
  check(same.status === 200, 'unrestricted wildcard bind: a same-origin Origin is accepted');
  await stopServer(open);
}

async function main() {
  if (!existsSync(SERVER_PATH)) {
    console.error(`Server not found at ${SERVER_PATH}. Run npm run build first.`);
    process.exit(1);
  }
  console.log(`Testing HTTP mode of ${SERVER_PATH}`);
  testBundleVersion();

  const port = await freePort();
  const server = await startServer(['--port', String(port)]);
  try {
    await testRoutingAndAuth(server.origin);
    const { names } = await testTools(server.origin);
    await testArgumentHandling(server.origin, names);
    await testErrorReporting(server.origin, names);
    await testParityGuards(server.origin, names);
    await testBatchEmailColumn(server.origin);
    await testWarmup(server.origin);
    await testInboxPlacement(server.origin, names);
    await testKeyIsolation(server.origin, server);
    await testHttpHardening(server.origin, names);
  } finally {
    await stopServer(server);
  }
  await testBindHost();
  await testAllowedHosts();
  await testTransportEdges();

  console.log(`\n${passes} passed, ${failures} failed`);
  rmSync(workDir, { recursive: true, force: true });
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  rmSync(workDir, { recursive: true, force: true });
  process.exit(1);
});

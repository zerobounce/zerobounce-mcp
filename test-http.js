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
    const child = spawn(
      process.execPath,
      ['--import', FAKE_API, SERVER_PATH, '--http', ...args],
      { env: { ...process.env, FAKE_ZB_LOG: LOG_FILE, ...env }, stdio: ['ignore', 'ignore', 'pipe'] }
    );
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

const CSV = 'email,first,last,domain\nalice@example.com,Alice,Smith,example.com\n';

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
  list_s3_files: {},
  validate_s3_file: { fileName: 'input/list.csv' },
  score_s3_file: { fileName: 'input/list.csv' },
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
  'list_s3_files',
  'validate_s3_file',
  'score_s3_file',
  'export_s3_file',
]);

async function testRoutingAndAuth(origin) {
  console.log('\nRouting and auth');
  const health = await fetch(`${origin}/health`);
  check(health.status === 200, 'GET /health returns 200');

  const get = await fetch(`${origin}/mcp`);
  check(get.status === 405 && get.headers.get('allow') === 'POST', 'GET /mcp returns 405 with Allow: POST');

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
  check(init.status === 200 && init.message?.result?.serverInfo?.name === 'zerobounce-mcp', 'initialize succeeds');
  if (!process.env.ZB_MCP_SERVER) {
    const { version } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
    const reported = init.message?.result?.serverInfo?.version;
    check(reported === version, `serverInfo reports package version ${version}`, `reported ${reported}`);
  }

  const bearer = await rpc(origin, 'tools/call', { name: 'get_credits', arguments: {} }, {
    Authorization: 'Bearer bearer-key',
  });
  check(
    bearer.status === 200 && loggedRequests('bearer-key').length === 1,
    'Authorization: Bearer key is forwarded to the API'
  );

  const padded = await rpc(origin, 'tools/call', { name: 'get_credits', arguments: {} }, {
    Authorization: `bEaReR ${' '.repeat(2000)}padded-key`,
  });
  check(
    padded.status === 200 && loggedRequests('padded-key').length === 1,
    'Authorization bearer token is read after long whitespace'
  );

  const basic = await rpc(origin, 'tools/call', { name: 'get_credits', arguments: {} }, {
    Authorization: 'Basic not-a-bearer-key',
  });
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
  check(/returnUrl must use HTTPS/.test(toolText(badUrl)), 'non-HTTPS / private returnUrl is rejected');

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
      /private, link-local, or loopback/.test(toolText(result)) && loggedRequests(`ipv6-${label}`).length === 0,
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
    loggedRequests('ipv6-public').some((entry) => String(entry.fields?.return_url ?? '').includes('2606:4700::1111')),
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
    /exceeds maximum size of \d+ bytes/.test(toolText(hugeFile)) && loggedRequests('huge-file').length === 0,
    'fileContent over 32 MiB is rejected by the file limit',
    toolText(hugeFile).slice(0, 180)
  );

  if (has('add_filter')) {
    await callTool(origin, 'filter-fields', 'add_filter', TOOL_ARGS.add_filter);
    const [req] = loggedRequests('filter-fields');
    check(
      req?.fields.rule === 'allow' && req?.fields.target === 'email' && req?.fields.value === 'alice@example.com',
      'add_filter sends rule, target and value',
      JSON.stringify(req?.fields)
    );
    const noRule = await callTool(origin, 'filter-missing', 'add_filter', { target: 'email', value: 'x' });
    check(/rule is required/.test(toolText(noRule)), 'add_filter without rule is rejected');
  }

  if (has('export_s3_file')) {
    await callTool(origin, 's3-export', 'export_s3_file', TOOL_ARGS.export_s3_file);
    const [req] = loggedRequests('s3-export');
    check(
      req?.fields.file_id === 'f1' && req?.fields.export_bucket === 'results-bucket',
      'export_s3_file sends file_id and export_bucket',
      JSON.stringify(req?.fields)
    );
  }

  if (has('validate_s3_file')) {
    await callTool(origin, 's3-validate', 'validate_s3_file', TOOL_ARGS.validate_s3_file);
    const [req] = loggedRequests('s3-validate');
    check(req?.fields.file_name === 'input/list.csv', 'validate_s3_file sends file_name', JSON.stringify(req?.fields));
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

async function testErrorReporting(origin) {
  console.log('\nError reporting');
  const isError = (result) => result.message?.result?.isError === true;

  const html403 = await callTool(origin, 'html-403-getfile', 'bulk_validate_get_file', { fileId: 'f1' });
  const html403Text = toolText(html403);
  check(
    isError(html403) && html403Text.length < 500 && !/<html|<body|<p>/i.test(html403Text),
    'bulk get-file HTML error page is reduced to a short message',
    `${html403Text.length} chars: ${html403Text.slice(0, 160)}`
  );
  check(/Access denied \| zerobounce\.net/.test(html403Text), 'HTML error message keeps the page title');

  const html200 = await callTool(origin, 'html-200-getfile', 'bulk_ai_scoring_get_file', { fileId: 'f1' });
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

  const account = await callTool(origin, 'batch-account-1', 'validate_batch', TOOL_ARGS.validate_batch);
  check(
    isError(account) && /ran out of credits/.test(toolText(account)),
    'validate_batch reports an account-level error as an error',
    toolText(account).slice(0, 160)
  );

  const partial = await callTool(origin, 'batch-partial-1', 'validate_batch', TOOL_ARGS.validate_batch);
  check(
    !isError(partial) && /Invalid email address/.test(toolText(partial)),
    'validate_batch keeps per-address errors in a successful result',
    toolText(partial).slice(0, 160)
  );
}

async function testBatchEmailColumn(origin) {
  console.log('\nvalidate_batch emailAddressColumn');
  await callTool(origin, 'batch-column', 'validate_batch', {
    emails: ['Alice,alice@example.com', '"Smith, Bob",bob@example.com,extra', '"Q ""Quote""", q@example.com '],
    emailAddressColumn: 1,
  });
  const [req] = loggedRequests('batch-column');
  const sent = (req?.fields.email_batch ?? []).map((e) => e.email_address);
  check(
    JSON.stringify(sent) === JSON.stringify(['alice@example.com', 'bob@example.com', 'q@example.com']),
    'emailAddressColumn reads that column from each CSV row (quoted fields too)',
    JSON.stringify(sent)
  );

  await callTool(origin, 'batch-plain', 'validate_batch', { emails: ['a@example.com', 'b@example.com'] });
  const plain = (loggedRequests('batch-plain')[0]?.fields.email_batch ?? []).map((e) => e.email_address);
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
  check(ok.length === count, `${count} concurrent requests all succeed`, `${ok.length}/${count} succeeded`);

  const leaked = results.filter(({ key }) => {
    const reqs = loggedRequests(key);
    return reqs.length !== 1;
  });
  check(leaked.length === 0, 'each request reached the API exactly once, with its own key', `mismatched: ${leaked.map((r) => r.key).join(', ')}`);

  const crossed = results.filter(({ key, result }) => {
    const text = toolText(result);
    const other = text.match(/concurrent-\d+/g) ?? [];
    return other.some((k) => k !== key);
  });
  check(crossed.length === 0, 'no response contains another caller\'s key', `crossed: ${crossed.map((r) => r.key).join(', ')}`);

  check(!/Already connected/.test(server.stderr()), 'server logged no transport reuse errors');
}

async function testBindHost() {
  console.log('\nBind host');
  const refused = spawnSync(process.execPath, [SERVER_PATH, '--http', '--host', '0.0.0.0'], {
    encoding: 'utf8',
    env: { ...process.env, MCP_TLS_TERMINATED: '' },
  });
  check(refused.status === 1 && /MCP_TLS_TERMINATED=true/.test(refused.stderr),
    'non-loopback bind requires explicit TLS termination');
  const port = await freePort();
  const local = await startServer(['--port', String(port)], { MCP_HOST: '' });
  check(local.origin === `http://127.0.0.1:${port}`, 'binds to 127.0.0.1 by default', local.origin);
  await stopServer(local);

  const flagPort = await freePort();
  const flag = await startServer(['--port', String(flagPort), '--host', '0.0.0.0'], { MCP_TLS_TERMINATED: 'true' });
  check(flag.origin === `http://0.0.0.0:${flagPort}`, '--host 0.0.0.0 binds all interfaces', flag.origin);
  const viaAll = await fetch(`http://127.0.0.1:${flagPort}/health`);
  check(viaAll.status === 200, 'server bound to 0.0.0.0 answers on loopback');
  await stopServer(flag);

  const envPort = await freePort();
  const env = await startServer([`--port=${envPort}`], { MCP_HOST: '0.0.0.0', MCP_TLS_TERMINATED: 'true' });
  check(env.origin === `http://0.0.0.0:${envPort}`, 'MCP_HOST=0.0.0.0 binds all interfaces', env.origin);
  await stopServer(env);

  console.log('\nRegional API base URL');
  // ZeroBounce serves the main API from three hosts. The SDK has always
  // supported them; until now this server gave no way to pick one.
  const readBaseUrl = async (origin) => {
    const r = await rpc(origin, 'resources/read', { uri: 'zerobounce://config' }, {
      'X-ZeroBounce-Api-Key': 'region-key',
    });
    return JSON.parse(r.message.result.contents[0].text).baseUrl;
  };

  const defPort = await freePort();
  const def = await startServer([`--port=${defPort}`], { ZEROBOUNCE_API_URL: '' });
  check(await readBaseUrl(def.origin) === 'https://api.zerobounce.net/v2',
    'defaults to the main API host');
  await stopServer(def);

  const usPort = await freePort();
  const us = await startServer([`--port=${usPort}`, '--url=us']);
  check(await readBaseUrl(us.origin) === 'https://api-us.zerobounce.net/v2',
    '--url=us selects the US host');
  await stopServer(us);

  const euPort = await freePort();
  const eu = await startServer([`--port=${euPort}`], { ZEROBOUNCE_API_URL: 'eu' });
  check(await readBaseUrl(eu.origin) === 'https://api-eu.zerobounce.net/v2',
    'ZEROBOUNCE_API_URL=eu selects the EU host');
  await stopServer(eu);

  const customPort = await freePort();
  const custom = await startServer([`--port=${customPort}`, '--url=https://stub.example.com/v2']);
  check(await readBaseUrl(custom.origin) === 'https://stub.example.com/v2',
    'an explicit https URL is kept as given');
  await stopServer(custom);

  // Never silently fall back to production: a caller who asked for one host and
  // got another would send their key somewhere they did not choose.
  const insecure = spawnSync(process.execPath, [SERVER_PATH, '--http', '--url=http://api.zerobounce.net/v2'], {
    encoding: 'utf8',
  });
  check(insecure.status === 1 && /must use https/i.test(insecure.stderr),
    'a non-https API URL is refused, not silently replaced', insecure.stderr.slice(0, 120));

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
  check(defConfig.warmupApiKeyConfigured === false,
    'HTTP mode reports no server-level Warmup key', String(defConfig.warmupApiKeyConfigured));
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
    await testErrorReporting(server.origin);
    await testBatchEmailColumn(server.origin);
    await testWarmup(server.origin);
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

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

function callTool(origin, apiKey, name, args) {
  return rpc(origin, 'tools/call', { name, arguments: args }, { 'X-ZeroBounce-Api-Key': apiKey });
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
};

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
  'get_inbox_placement_providers',
  'get_inbox_placement_test_types',
  'create_inbox_placement_test',
  'get_inbox_placement_test',
  'list_inbox_placement_tests',
  'delete_inbox_placement_test',
  'get_inbox_placement_webhook',
  'set_inbox_placement_webhook',
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
  const list = await rpc(origin, 'tools/list', {}, { 'X-ZeroBounce-Api-Key': 'list-key' });
  const names = (list.message?.result?.tools ?? []).map((t) => t.name);
  const gatedListed = names.filter((n) => SDK_GATED.has(n));
  const fullSdk = gatedListed.length === SDK_GATED.size;
  console.log(`  (${names.length} tools listed; ${fullSdk ? 'SDK has all newer methods' : 'older SDK, gated tools hidden'})`);

  check(
    gatedListed.length === 0 || fullSdk,
    'SDK-gated tools are listed all together or not at all',
    `listed: ${gatedListed.join(', ')}`
  );
  const expected = Object.keys(TOOL_ARGS).filter((n) => fullSdk || !SDK_GATED.has(n));
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

  return { names, fullSdk };
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

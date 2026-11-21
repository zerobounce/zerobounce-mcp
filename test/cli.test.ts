/**
 * Offline check of the command line: --help and --version answer without a key,
 * and an unknown flag or stray argument is refused instead of ignored. Run by
 * `npm test`; no network (every run exits before any server starts).
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getAllTools } from '../src/tools/index.js';
import { DESTRUCTIVE_TOOL_NAMES, TOOL_NAMES } from '../src/tools/catalog.js';

const ENTRY = fileURLToPath(new URL('../src/index.ts', import.meta.url));
const ROOT = fileURLToPath(new URL('..', import.meta.url));

function run(args: string[], env: Record<string, string> = {}) {
  const clean: NodeJS.ProcessEnv = { ...process.env };
  for (const name of Object.keys(clean)) {
    if (name.startsWith('ZEROBOUNCE_') || name.startsWith('MCP_') || name === 'PORT') delete clean[name];
  }
  return spawnSync(process.execPath, ['--import', 'tsx', ENTRY, ...args], {
    cwd: ROOT,
    env: { ...clean, ...env },
    encoding: 'utf8',
    timeout: 30000,
  });
}

let failures = 0;
function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (error) {
    failures++;
    console.error(`FAIL ${name}\n${error instanceof Error ? error.stack : String(error)}`);
  }
}

check('--help prints usage to stdout, exits 0 without a key', () => {
  const r = run(['--help']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Usage: zerobounce-mcp/);
  assert.match(r.stdout, /--api-key/);
  assert.doesNotMatch(r.stderr, /API key is required/);
});

check('-h behaves like --help', () => {
  const r = run(['-h']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Usage: zerobounce-mcp/);
});

check('--version prints the version and exits 0 without a key', () => {
  const r = run(['--version']);
  assert.equal(r.status, 0);
  assert.match(r.stdout.trim(), /^\d+\.\d+\.\d+|^0\.0\.0-dev$/);
  assert.equal(run(['-v']).stdout, r.stdout);
});

check('--help after other valid flags still answers help', () => {
  const r = run(['--port', '4000', '--help']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Usage:/);
});

check('a flag followed by another flag is a missing value, not a help request', () => {
  const r = run(['--api-key', '--help'], {});
  assert.equal(r.status, 1);
  assert.match(r.stderr, /--api-key requires a value/);
  assert.doesNotMatch(r.stdout, /Usage:/);
});

check('an unknown flag is refused with exit 1 even when a key is set', () => {
  const r = run(['--api-ky', 'x'], { ZEROBOUNCE_API_KEY: 'dummy-test-key-not-real' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Unknown argument: --api-ky/);
  assert.equal(r.stdout, '');
});

check('an unknown --flag=value is refused and the value is not echoed', () => {
  const r = run(['--bogus=secret-value'], { ZEROBOUNCE_API_KEY: 'dummy-test-key-not-real' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Unknown argument: --bogus\./);
  assert.doesNotMatch(r.stderr, /secret-value/);
});

check('a stray positional argument is refused and not echoed', () => {
  const r = run(['stray-positional'], { ZEROBOUNCE_API_KEY: 'dummy-test-key-not-real' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Unknown argument: unexpected positional argument/);
  assert.doesNotMatch(r.stderr, /stray-positional/);
});

function rpc(args: string[], messages: object[], env: Record<string, string> = {}) {
  const clean: NodeJS.ProcessEnv = { ...process.env };
  for (const name of Object.keys(clean)) {
    if (name.startsWith('ZEROBOUNCE_') || name.startsWith('MCP_') || name === 'PORT') delete clean[name];
  }
  const r = spawnSync(process.execPath, ['--import', 'tsx', ENTRY, ...args], {
    cwd: ROOT,
    env: { ...clean, ...env },
    input: messages.map((m) => JSON.stringify(m)).join('\n') + '\n',
    encoding: 'utf8',
    timeout: 30000,
  });
  const replies = new Map<number, Record<string, unknown>>();
  for (const line of r.stdout.split('\n').filter(Boolean)) {
    const message = JSON.parse(line) as { id?: number };
    if (typeof message.id === 'number') replies.set(message.id, message as Record<string, unknown>);
  }
  return { ...r, replies };
}

const HANDSHAKE = [
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'cli-test', version: '1' } },
  },
  { jsonrpc: '2.0', method: 'notifications/initialized' },
];

// MCP directories (LobeHub, Glama, Smithery) start a server without credentials to read its
// tools; a server that exits without a key shows up as having none.
check('without a key, stdio starts, lists tools and prompts, and refuses tool calls', () => {
  for (const args of [[], ['--api-key=']]) {
    const r = rpc(args, [
      ...HANDSHAKE,
      { jsonrpc: '2.0', id: 2, method: 'tools/list' },
      { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'get_credits', arguments: {} } },
      { jsonrpc: '2.0', id: 4, method: 'prompts/list' },
    ]);
    assert.match(r.stderr, /No ZeroBounce API key/, `stderr for ${JSON.stringify(args)}`);
    const init = r.replies.get(1)?.result as { capabilities: Record<string, unknown> };
    assert.ok(init.capabilities.prompts, 'prompts capability');
    const tools = (r.replies.get(2)?.result as { tools: { name: string }[] }).tools;
    assert.ok(tools.length >= 49, `tools/list returned ${tools.length}`);
    assert.ok(!tools.some((t) => t.name.startsWith('warmup_')), 'no Warmup tools without a Warmup key');
    const call = r.replies.get(3)?.result as { isError: boolean; content: { text: string }[] };
    assert.equal(call.isError, true);
    assert.match(call.content[0].text, /API key is required/);
    const prompts = (r.replies.get(4)?.result as { prompts: { name: string }[] }).prompts;
    assert.ok(prompts.length >= 1, 'at least one prompt');
  }
});

check('prompts/get builds the message and refuses a missing required argument', () => {
  const r = rpc([], [
    ...HANDSHAKE,
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'prompts/get',
      params: { name: 'check_email_before_sending', arguments: { email: 'valid@example.com' } },
    },
    { jsonrpc: '2.0', id: 3, method: 'prompts/get', params: { name: 'clean_email_list', arguments: {} } },
    { jsonrpc: '2.0', id: 4, method: 'prompts/get', params: { name: 'no_such_prompt' } },
  ]);
  const ok = r.replies.get(2)?.result as { messages: { role: string; content: { text: string } }[] };
  assert.equal(ok.messages[0].role, 'user');
  assert.match(ok.messages[0].content.text, /valid@example\.com/);
  const missing = r.replies.get(3)?.error as { code: number; message: string };
  assert.equal(missing.code, -32602);
  assert.match(missing.message, /Missing required argument: emails/);
  assert.match((r.replies.get(4)?.error as { message: string }).message, /Unknown prompt/);
});

check('a malformed key is still refused at startup', () => {
  const r = run(['--api-key=bad\u200bkey']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /must not contain control characters or invisible characters/);
  assert.doesNotMatch(r.stderr, /bad/);
});

check('tool definitions follow the hosted server: names, titles, hints, descriptions', () => {
  const tools = getAllTools({ warmupConfigured: true }).map((tool) => tool.definition);
  assert.deepEqual(
    tools.map((tool) => tool.name).sort(),
    [...TOOL_NAMES].sort(),
    'every catalog tool is listed, and only those'
  );
  for (const tool of tools) {
    const text = tool.description ?? '';
    assert.ok(tool.title, `${tool.name} has a title`);
    assert.match(text, /\nWhen to use: /, tool.name);
    assert.match(text, /\n(CREDITS|WRITE): /, tool.name);
    const destructive = DESTRUCTIVE_TOOL_NAMES.has(tool.name as never);
    assert.equal(tool.annotations?.destructiveHint, destructive, `${tool.name} destructiveHint`);
    if (destructive || /\nWRITE: /.test(text)) {
      assert.equal(tool.annotations?.readOnlyHint, false, `${tool.name} readOnlyHint`);
    }
  }
  for (const name of ['warmup_update_sending_account', 'warmup_change_from_address', 'delete_file']) {
    assert.ok(DESTRUCTIVE_TOOL_NAMES.has(name as never), `${name} is destructive`);
  }
});

if (failures) {
  console.error(`${failures} CLI check(s) failed`);
  process.exit(1);
}
console.log('CLI checks passed');

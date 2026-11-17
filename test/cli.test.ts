/**
 * Offline check of the command line: --help and --version answer without a key,
 * and an unknown flag or stray argument is refused instead of ignored. Run by
 * `npm test`; no network (every run exits before any server starts).
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { bulkEmailFinderTools } from '../src/tools/bulk-email-finder.js';
import { bulkDomainSearchTools } from '../src/tools/bulk-domain-search.js';

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

check('a missing key without --help is still the key error', () => {
  const r = run([]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /API key is required/);
});

check('bulk finder and domain search descriptions do not say "bulk bulk"', () => {
  for (const tools of [bulkEmailFinderTools, bulkDomainSearchTools]) {
    for (const tool of [tools.sendFile, tools.fileStatus, tools.getFile, tools.deleteFile]) {
      const text = tool.definition.description;
      assert.doesNotMatch(text, /bulk bulk/i, text);
      assert.match(text, /bulk (email finder|domain search)/);
    }
  }
});

if (failures) {
  console.error(`${failures} CLI check(s) failed`);
  process.exit(1);
}
console.log('CLI checks passed');

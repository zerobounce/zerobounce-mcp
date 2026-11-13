/**
 * Offline check that the MCP's own client objects hold no API key in an
 * inspectable property: util.format %o, showHidden inspect, JSON and a walk of
 * every own property all come up without it. Run by `npm test`; no network.
 *
 * The bundled ZeroBounce SDK keeps its own copy of the key; the `sdk` and
 * `warmupClient` members are the SDK's objects and are skipped here. That copy
 * is closed by the SDK fix, which reaches this package with the next SDK bump.
 */
import assert from 'node:assert/strict';
import util from 'node:util';
import { ZeroBounceClient } from '../src/zerobounce-client.js';

const KEY = 'mcp-probe-key-1234567890';
const WARMUP_KEY = 'mcp-warmup-key-0987654321';
const SDK_OWNED = new Set(['sdk', 'warmupClient']);

function keyReachable(root: unknown): string | null {
  const seen = new Set<unknown>();
  const stack: Array<[unknown, string]> = [[root, 'client']];
  while (stack.length) {
    const [value, where] = stack.pop()!;
    if (typeof value === 'string') {
      if (value.includes(KEY) || value.includes(WARMUP_KEY)) return where;
      continue;
    }
    if (value === null || (typeof value !== 'object' && typeof value !== 'function')) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    for (const name of Reflect.ownKeys(value as object)) {
      if (typeof name === 'string' && SDK_OWNED.has(name)) continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, name);
      if (descriptor && 'value' in descriptor) stack.push([descriptor.value, `${where}.${String(name)}`]);
    }
  }
  return null;
}

const client = new ZeroBounceClient({ apiKey: KEY, warmupApiKey: WARMUP_KEY });
const text = (value: unknown) => [
  util.format('%o', value),
  util.format('%O', value),
  util.inspect(value, { showHidden: true, depth: 9 }),
  JSON.stringify(value),
];

// The client's own state, without the SDK's objects (see the header).
const ownState = Object.fromEntries(
  Reflect.ownKeys(client)
    .filter((name) => !SDK_OWNED.has(String(name)))
    .map((name) => [String(name), (client as unknown as Record<string, unknown>)[String(name)]])
);

assert.equal(keyReachable(client), null);
for (const shown of text(ownState)) {
  assert.ok(!shown.includes(KEY) && !shown.includes(WARMUP_KEY), 'a client dump carries a key');
}
console.log('client-key: ok');

/**
 * Offline check that the MCP's own objects hold no API key in an inspectable
 * property: the ZeroBounce client and the MCP server object that holds it
 * (its config, its client, its SDK server). util.format %o, showHidden inspect,
 * JSON and a walk of every own property all come up without it. Run by
 * `npm test`; no network.
 *
 * The bundled ZeroBounce SDK keeps its own copy of the key; the `sdk` and
 * `warmupClient` members are the SDK's objects and are skipped here. That copy
 * is closed by the SDK fix, which reaches this package with the next SDK bump.
 */
import assert from 'node:assert/strict';
import util from 'node:util';
import { ZeroBounceClient } from '../src/zerobounce-client.js';
import { ZeroBounceMCPServer } from '../src/server.js';

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
    // Map and Set entries are not own properties, so they are walked too.
    if (value instanceof Map) {
      for (const [key, entry] of value) stack.push([key, `${where}.<key>`], [entry, `${where}.<${String(key)}>`]);
    }
    if (value instanceof Set) {
      for (const entry of value) stack.push([entry, `${where}.<entry>`]);
    }
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

// An object's own state, without the SDK's objects (see the header).
const ownStateOf = (object: object) =>
  Object.fromEntries(
    Reflect.ownKeys(object)
      .filter((name) => !SDK_OWNED.has(String(name)))
      .map((name) => [String(name), (object as Record<string, unknown>)[String(name)]])
  );
const ownState = ownStateOf(client);

assert.equal(keyReachable(client), null);
for (const shown of text(ownState)) {
  assert.ok(!shown.includes(KEY) && !shown.includes(WARMUP_KEY), 'a client dump carries a key');
}

// The server object keeps the client and what the config resource reports. It
// must hold neither key anywhere a walk, a dump or a JSON copy would reach.
const server = new ZeroBounceMCPServer({
  apiKey: KEY,
  baseUrl: 'https://api.zerobounce.net/v2',
  warmupApiKey: WARMUP_KEY,
  warmupBaseUrl: 'https://api.zerobounce.net/warmup',
});
assert.equal(keyReachable(server), null, 'the server object holds a key');
// Its dump: the config, the client's own state and the SDK server, without the
// bundled SDK's objects (its own copy of the key is skipped, as above).
const internals = server as unknown as { config: unknown; client: ZeroBounceClient; server: unknown };
const serverState = { config: internals.config, client: ownStateOf(internals.client), server: internals.server };
// The SDK server is circular, so it has no JSON copy: JSON covers the rest.
const serverDumps = [
  util.format('%o', serverState),
  util.format('%O', serverState),
  util.inspect(serverState, { showHidden: true, depth: 9 }),
  JSON.stringify({ config: internals.config, client: ownStateOf(internals.client) }),
];
for (const shown of serverDumps) {
  assert.ok(!shown.includes(KEY) && !shown.includes(WARMUP_KEY), 'a server dump carries a key');
}
console.log('client-key: ok');

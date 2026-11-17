/**
 * Offline check of the server's own masking (src/security/redact.ts, vendored
 * from the JS SDK 5.0.0): every secret of a call is masked in every tool
 * result, success and error, on every tool path, in the spellings the audits
 * used. fetch is stubbed; nothing leaves the machine. Run by `npm test`.
 */
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { ZeroBounceMCPServer } from '../src/server.js';
import { formatErrorMessage, looksLikeHtml, looksLikeHtmlDownload } from '../src/errors.js';
import { redactResultText, redactSecrets, collectArgSecrets, CREDENTIAL_OMITTED_MESSAGE } from '../src/security/redact.js';

const KEY = 'probeKeyAbc123def';
const WKEY = 'warmKeyQrs456tuv';
const SMTP_USER = 'u';
const SMTP_PW = 'smtpPwXyz789';

type Reply = { status: number; body: string; ct?: string; throwMsg?: string; cause?: string };
let next: Reply = { status: 200, body: '{}' };
(globalThis as unknown as { fetch: unknown }).fetch = async (): Promise<Response> => {
  if (next.throwMsg !== undefined) {
    throw new TypeError(next.throwMsg, next.cause ? { cause: new Error(next.cause) } : undefined);
  }
  return new Response(next.body, {
    status: next.status,
    headers: { 'content-type': next.ct ?? 'application/json' },
  });
};

const uesc = (s: string) => [...s].map((c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
const ent = (s: string) => [...s].map((c) => '&#x' + c.charCodeAt(0).toString(16) + ';').join('');
const pct = (s: string) => [...s].map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
const variants = (k: string): Record<string, string> => ({
  exact: k,
  upper: k.toUpperCase(),
  lower: k.toLowerCase(),
  uEscape: uesc(k),
  bigU: [...k].map((c) => '\\U' + c.charCodeAt(0).toString(16).padStart(8, '0')).join(''),
  htmlEntity: ent(k),
  allPercent: pct(k),
  doublePercent: pct(pct(k)),
  percent25: encodeURIComponent(encodeURIComponent('%' + k)),
  hexByte: [...k].map((c) => '\\x' + c.charCodeAt(0).toString(16)).join(''),
  combining: k.slice(0, -1) + k.slice(-1) + '́',
  turkish: k.replace(/i/g, 'İ').toUpperCase(),
});

const server = new ZeroBounceMCPServer({
  apiKey: KEY,
  baseUrl: 'https://127.0.0.1:9/v2',
  warmupApiKey: WKEY,
  warmupBaseUrl: 'https://127.0.0.1:9',
});
const [a, b] = InMemoryTransport.createLinkedPair();
await server.connect(b);
const client = new Client({ name: 'redaction-test', version: '1' });
await client.connect(a);
const toolNames = new Set((await client.listTools()).tools.map((t) => t.name));

async function call(name: string, args: Record<string, unknown>): Promise<{ text: string; isError: boolean }> {
  assert.ok(toolNames.has(name), `tool ${name} is advertised`);
  const r = (await client.callTool({ name, arguments: args })) as {
    isError?: boolean;
    content: Array<{ text: string }>;
  };
  return { text: r.content.map((c) => c.text).join(''), isError: !!r.isError };
}

const leaks = (text: string, secret: string) =>
  text.includes(secret) || text.toLowerCase().includes(secret.toLowerCase());

// Every validation-key tool path with an error body that echoes the key.
const PATHS: Array<[string, Record<string, unknown>]> = [
  ['validate_email', { email: 'a@b.co' }],
  ['score_email', { email: 'a@b.co' }],
  ['find_email', { domain: 'b.co', firstName: 'x' }],
  ['domain_search', { domain: 'b.co' }],
  ['get_credits', {}],
  ['get_activity_data', { email: 'a@b.co' }],
  ['list_filters', {}],
  ['get_api_usage', { startDate: '2024-01-01', endDate: '2024-01-02' }],
  ['bulk_validate_file_status', { fileId: 'f1' }],
  ['get_inbox_placement_test', { testId: 't1' }],
];

for (const [name, args] of PATHS) {
  for (const [label, form] of Object.entries(variants(KEY))) {
    next = { status: 400, body: JSON.stringify({ error: `Invalid api_key ${form}` }) };
    const r = await call(name, args);
    assert.ok(r.isError, `${name}/${label}: is an error`);
    assert.ok(!leaks(r.text, KEY), `${name}/${label}: key leaked: ${r.text.slice(0, 200)}`);
    assert.ok(!r.text.includes(form) || form.length < 3, `${name}/${label}: spelling leaked`);
  }
}

// 200 bodies: {"error"}, success:false, and a success body that echoes the key.
for (const body of [
  JSON.stringify({ error: `bad ${KEY}` }),
  JSON.stringify({ success: false, message: `bad ${KEY}` }),
  JSON.stringify({ Credits: '5', echo: KEY, more: variants(KEY).htmlEntity }),
]) {
  next = { status: 200, body };
  const r = await call('get_credits', {});
  assert.ok(!leaks(r.text, KEY), `200 body leaked: ${r.text.slice(0, 200)}`);
}
next = { status: 200, body: JSON.stringify({ address: 'a@b.co', status: 'valid', echo: `k=${KEY}` }) };
{
  const r = await call('validate_email', { email: 'a@b.co' });
  assert.ok(!r.isError && !leaks(r.text, KEY) && r.text.includes('***'), 'success result is masked too');
}

// HTML <title>: taken after masking, and only from a body that is not JSON.
next = { status: 403, body: `<html><head><title>Blocked ${KEY}</title></head></html>`, ct: 'text/html' };
{
  const r = await call('validate_email', { email: 'a@b.co' });
  assert.ok(!leaks(r.text, KEY), 'title leaked the key');
}
{
  const html = formatErrorMessage(new Error('<html><head><title>Blocked '+ uesc('Zq') +'</title></head></html>'), []);
  assert.match(html, /HTML error page \("Blocked/);
  // A JSON error whose string holds HTML is JSON, never an HTML page (lesson 142).
  const json = formatErrorMessage(new Error('{"error":"<html><title>x</title></html>"}'), []);
  assert.ok(!/HTML error page/.test(json), 'JSON body is not HTML');
  assert.equal(looksLikeHtml('[ "<html>" ]'), false);
  assert.equal(looksLikeHtml(' \n{"a":"<body>"}'), false);
}

// Transport errors: the SDK's status-0 text, masked, with the key in the cause.
next = {
  status: 0,
  body: '',
  throwMsg: 'fetch failed',
  cause: `connect ECONNREFUSED https://api.zerobounce.net/v2/validate?api_key=${KEY} ${variants(KEY).percent25}`,
};
{
  const r = await call('validate_email', { email: 'a@b.co' });
  assert.ok(r.isError && /fetch failed/.test(r.text), `transport text kept: ${r.text}`);
  assert.ok(!leaks(r.text, KEY), 'transport error leaked the key');
}

// validate_batch: the server's own throw for an account-level error ('all').
next = {
  status: 200,
  body: JSON.stringify({ email_batch: [], errors: [{ email_address: 'all', error: `bad key ${KEY}` }] }),
};
{
  const r = await call('validate_batch', { emails: ['a@b.co'] });
  assert.ok(r.isError && /bad key/.test(r.text), `'all' error is reported: ${r.text}`);
  assert.ok(!leaks(r.text, KEY), 'validate_batch account error leaked the key');
  next = {
    status: 200,
    body: JSON.stringify({ email_batch: [], errors: [{ email_address: 'all', error: `bad ${variants(KEY).htmlEntity}` }] }),
  };
  const entity = await call('validate_batch', { emails: ['a@b.co'] });
  assert.ok(entity.isError && !leaks(entity.text, KEY) && !entity.text.includes('&#x'), 'entity spelling is not shown');
  // A different address is NOT an account-level error (mutant 'all' -> 'ALL').
  next = {
    status: 200,
    body: JSON.stringify({ email_batch: [], errors: [{ email_address: 'a@b.co', error: 'bad syntax' }] }),
  };
  const ok = await call('validate_batch', { emails: ['a@b.co'] });
  assert.ok(!ok.isError, 'a per-address error stays a result');
}

// The bundled SDK 5.0.0 returns Credits as the declared string.
next = { status: 200, body: '{"Credits":2375323}' };
assert.match((await call('get_credits', {})).text, /"Credits": "2375323"/);

// The client's own account-error branch, with the SDK answering as an older one
// would (an 'all' error returned, not thrown): masked, and only for 'all'.
{
  const { ZeroBounceClient } = await import('../src/zerobounce-client.js');
  const direct = new ZeroBounceClient({ apiKey: KEY, baseUrl: 'https://127.0.0.1:9/v2' });
  const sdk = (direct as unknown as { sdk: { validateBatch: () => Promise<unknown> } }).sdk;
  for (const address of ['all', 'ALL', ' All ']) {
    sdk.validateBatch = async () => ({ email_batch: [], errors: [{ email_address: address, error: `bad ${KEY}` }] });
    await assert.rejects(direct.validateBatch(['a@b.co']), (e: Error) => /^bad \*\*\*$/.test(e.message));
  }
  sdk.validateBatch = async () => ({ email_batch: [], errors: [{ email_address: 'x@y.co', error: 'bad' }] });
  assert.equal((await direct.validateBatch(['a@b.co'])).errors.length, 1);
}

// Bulk download: HTML page, JSON body, markup, and a plain CSV that holds the key.
next = { status: 200, body: `<html><title>Denied ${KEY}</title></html>`, ct: 'text/csv' };
{
  const r = await call('bulk_validate_get_file', { fileId: 'f1' });
  assert.ok(r.isError && !leaks(r.text, KEY), `download title: ${r.text}`);
}
next = { status: 200, body: '<title>Access denied</title>', ct: 'text/csv' };
assert.ok((await call('bulk_validate_get_file', { fileId: 'f1' })).isError, '<-start download is an error');
next = { status: 200, body: JSON.stringify({ success: false, message: `no file for ${KEY}` }), ct: 'text/csv' };
{
  const r = await call('bulk_validate_get_file', { fileId: 'f1' });
  assert.ok(r.isError && !leaks(r.text, KEY), 'JSON download body is an error, masked');
}
next = { status: 200, body: `email,status\n"a@b.co",valid\nnote,${KEY}\n`, ct: 'text/csv' };
{
  const r = await call('bulk_validate_get_file', { fileId: 'f1' });
  assert.ok(!r.isError && r.text.includes('a@b.co') && !leaks(r.text, KEY), 'CSV returned, key masked');
}
assert.equal(looksLikeHtmlDownload('\ufeff \n\u00a0<x/>'), true);
assert.equal(looksLikeHtmlDownload('﻿ a,b\n<b>'), false);

// Warmup key, SMTP username/password (short username), Inbox Placement key.
for (const [label, form] of Object.entries(variants(WKEY))) {
  next = { status: 400, body: JSON.stringify({ message: `Invalid key ${form}` }) };
  const r = await call('warmup_test_smtp_configuration', {
    fromAddress: 'a@b.co', username: SMTP_USER, password: SMTP_PW, server: 's.example', port: 587,
  });
  assert.ok(!leaks(r.text, WKEY), `warmup/${label}: key leaked: ${r.text.slice(0, 200)}`);
}
for (const [label, form] of Object.entries(variants(SMTP_PW))) {
  next = { status: 500, body: JSON.stringify({ message: `login failed for ${SMTP_USER} / ${form}` }) };
  const r = await call('warmup_test_smtp_configuration', {
    fromAddress: 'a@b.co', username: SMTP_USER, password: SMTP_PW, server: 's.example', port: 587,
  });
  assert.ok(!leaks(r.text, SMTP_PW), `smtp/${label}: password leaked: ${r.text.slice(0, 200)}`);
}

// A short secret does not cut letters out of fixed words (the SDK's or ours).
{
  const fixed = 'ZeroBounce returned an HTML error page instead of an API response.';
  assert.equal(redactResultText(fixed, ['u']), fixed);
  assert.equal(redactResultText(`user u logged ${'u'}`, ['u']), 'user *** logged ***');
  assert.equal(redactResultText('xu u_ éu', ['u']), 'xu ***_ éu');
  // ...while a body-derived piece is masked with every secret, however short.
  assert.equal(redactSecrets('name=u', ['u']).includes('name=u'), false);
}

// Long text is masked in full, for any length (the 64 KiB cap of redactSecrets).
{
  const big = `${'x,y\n'.repeat(40000)}tail ${uesc(KEY)} ${KEY}\n`;
  const out = redactResultText(big, [KEY]);
  assert.ok(out.length > 100000 && !leaks(out, KEY) && !out.includes(uesc(KEY)), 'long text masked');
  assert.ok(out.startsWith('x,y\nx,y\n'), 'long text keeps its content');
}

// Mutants: the 2000-character HTML probe and the 1000-character message cut.
{
  assert.equal(looksLikeHtml(`${'a'.repeat(1990)}<html>`), true);
  assert.equal(looksLikeHtml(`${'a'.repeat(2100)}<html>`), false);
  const cut = formatErrorMessage(new Error('x'.repeat(1500)), []);
  assert.equal(cut, `${'x'.repeat(1000)}… (truncated)`);
  assert.equal(formatErrorMessage(new Error('x'.repeat(1000)), []), 'x'.repeat(1000));
}

// Windows: every spelling placed across every window boundary of a long single
// line, in redactResultText and in a bulk get_file CSV result.
{
  const forms = Object.entries(variants(KEY)).filter(([label]) => label !== 'lower');
  const WINDOW = 16384;
  const check = (out: string, form: string, label: string) => {
    assert.ok(!leaks(out, KEY) && !out.includes(form), `${label}: spelling leaked across a boundary`);
  };
  for (const [label, form] of forms) {
    for (const boundary of [WINDOW, 2 * WINDOW]) {
      const offsets = new Set<number>();
      for (let o = boundary - form.length - 2; o <= boundary + 2; o += 5) offsets.add(o);
      offsets.add(boundary - Math.floor(form.length / 2)).add(boundary - 1).add(boundary);
      for (const offset of offsets) {
        const text = `${'x'.repeat(offset)}${form}${'y'.repeat(40000 - offset)}`;
        check(redactResultText(text, [KEY]), form, `${label}@${offset}`);
      }
    }
  }
  // The same through a tool: a CSV whose one long cell holds the spelling.
  for (const [label, form] of forms) {
    for (const offset of [16384 - Math.floor(form.length / 2), 16384 - 5, 16384 + 1]) {
      next = { status: 200, body: `email,note\na@b.co,${'x'.repeat(offset)}${form}${'y'.repeat(2000)}\n`, ct: 'text/csv' };
      const r = await call('bulk_validate_get_file', { fileId: 'f1' });
      assert.ok(!r.isError && r.text.includes('a@b.co'), `csv ${label}: returned`);
      check(r.text, form, `csv ${label}@${offset}`);
    }
  }
}

// A short secret: a whole token between any non-alphanumeric characters, in any
// case, next to an escape; a spelling it takes after decoding is never returned.
{
  const mask = (text: string) => redactResultText(text, ['bob1']);
  assert.equal(mask('user%3Dbob1 ok'), 'user%3D*** ok');
  assert.equal(mask('a\\nbob1\\n'), 'a\\n***\\n');
  assert.equal(mask('"bob1"'), '"***"');
  assert.equal(mask('say BOB1.'), 'say ***.');
  assert.equal(mask('a_bob1_b'), 'a_***_b');
  assert.equal(mask('&quot;bob1&quot;'), '&quot;***&quot;');
  assert.equal(mask('bob12 xbob1 bob1é'), 'bob12 xbob1 bob1é');
  assert.equal(mask('x%41bob1'), 'x%41bob1');
  assert.equal(mask('a %62ob1 b'), CREDENTIAL_OMITTED_MESSAGE);
  assert.equal(mask('a bob%31 b'), CREDENTIAL_OMITTED_MESSAGE);
  // Words around a one-letter secret are never cut, in any message path.
  assert.equal(redactResultText('auth failed for user u', ['u']), 'auth failed for user ***');
  // A short secret across a window boundary, as an encoded spelling.
  const long = `${' '.repeat(16384 - 3)}%62ob1 ${'y'.repeat(20000)}`;
  assert.ok(!mask(long).includes('%62ob1') && mask(long).includes(CREDENTIAL_OMITTED_MESSAGE));
}
{
  // The bulk get_file error path (bodyText) holds the same rule for a short username.
  next = { status: 200, body: JSON.stringify({ success: false, message: 'auth failed: user u rejected' }), ct: 'text/csv' };
  const r = await call('warmup_test_smtp_configuration', {
    fromAddress: 'a@b.co', username: SMTP_USER, password: SMTP_PW, server: 's.example', port: 587,
  });
  assert.ok(!/a\*\*\*th|\*\*\*ser/.test(r.text), `short secret cut words: ${r.text}`);
  const { ZeroBounceClient } = await import('../src/zerobounce-client.js');
  const direct = new ZeroBounceClient({ apiKey: KEY, baseUrl: 'https://127.0.0.1:9/v2' });
  const sdk = (direct as unknown as { sdk: { getFile: () => Promise<unknown> } }).sdk;
  sdk.getFile = async () => ({ message: 'auth failed: user u rejected' });
  const { withSecrets } = await import('../src/security/redact.js');
  await assert.rejects(
    withSecrets(['u'], () => direct.bulkValidateGetFile('f1')),
    (e: Error) => e.message === 'auth failed: user *** rejected',
  );
}

// "Unknown tool" and "Unknown resource" never echo a key.
{
  const unknown = (await client.callTool({ name: `nope_${KEY}`, arguments: {} })) as { content: Array<{ text: string }>; isError?: boolean };
  assert.ok(unknown.isError && /Unknown tool/.test(unknown.content[0].text) && !leaks(unknown.content[0].text, KEY));
  const upper = (await client.callTool({ name: KEY.toUpperCase(), arguments: {} })) as { content: Array<{ text: string }> };
  assert.ok(!leaks(upper.content[0].text, KEY), 'upper-cased key as a tool name');
  await assert.rejects(client.readResource({ uri: `zerobounce://${KEY}` }), (e: Error) => /Unknown resource/.test(e.message) && !leaks(e.message, KEY));
}

// errors.ts: a key across the 1000-character cut, the surrogate guard, non-Error throws, HTML.
{
  const message = formatErrorMessage(new Error(`${'x'.repeat(990)}${KEY}${'y'.repeat(100)}`), [KEY]);
  assert.ok(!message.includes(KEY.slice(0, 4)), `key start survived the cut: ${message.slice(980)}`);
  assert.equal(formatErrorMessage(new Error(`${'x'.repeat(999)}😀${'y'.repeat(10)}`), []), `${'x'.repeat(999)}… (truncated)`);
  assert.equal(formatErrorMessage({ code: 7 }, []), '{"code":7}');
  assert.equal(formatErrorMessage({ message: 'boom' }, []), 'boom');
  assert.equal(formatErrorMessage({}, []), 'Unknown error');
  assert.equal(formatErrorMessage(Symbol('s'), []), 'Unknown error');
  const loop: Record<string, unknown> = {};
  loop.self = loop;
  assert.equal(formatErrorMessage(loop, []), 'Unknown error');
  assert.equal(formatErrorMessage({ key: KEY }, [KEY]), '{"key":"***"}');
  assert.equal(formatErrorMessage(null, []), 'null');
  assert.equal(
    formatErrorMessage(new Error('<title>Access denied</title>'), []),
    'ZeroBounce returned an HTML error page ("Access denied") instead of an API response. Check the API key and request parameters.',
  );
  assert.equal(formatErrorMessage(new Error('<html>'), []).startsWith('ZeroBounce returned an HTML error page'), true);
  assert.equal(formatErrorMessage(new Error('Rejected: <html><title>x</title>'), []), 'Rejected: <html><title>x</title>');
}

// Email addresses are 320 characters at most on every tool that takes one; dates are real.
{
  const local = (n: number) => `${'a'.repeat(n - '@b.co'.length)}@b.co`;
  const cases: Array<[string, string, (v: string) => Record<string, unknown>]> = [
    ['score_email', 'email', (v) => ({ email: v })],
    ['get_activity_data', 'email', (v) => ({ email: v })],
    ['validate_email', 'email', (v) => ({ email: v })],
    ['create_inbox_placement_test', 'senderEmail', (v) => ({ name: 'n', testType: 1, senderEmail: v })],
    ['warmup_get_from_address_statistics', 'fromAddress', (v) => ({ fromAddress: v })],
    ['warmup_change_from_address', 'newFromAddress', (v) => ({ oldFromAddress: 'a@b.co', newFromAddress: v })],
  ];
  for (const [tool, field, args] of cases) {
    assert.ok(toolNames.has(tool), `${tool} is advertised`);
    next = { status: 200, body: '{}' };
    const refused = await call(tool, args(local(321)));
    assert.ok(refused.isError && refused.text.includes(`${field} must be at most 320 characters`), `${tool}: 321 refused: ${refused.text}`);
    const kept = await call(tool, args(local(320)));
    assert.ok(!kept.text.includes('at most 320'), `${tool}: 320 accepted: ${kept.text}`);
  }
  for (const bad of ['2024-02-30', 'yesterday', '2024-13-01', '2024-01-01T25:00:00Z', '2024-01-01T10:00:00+25:00', '2024-1-1']) {
    for (const field of ['createdAfter', 'createdBefore']) {
      const r = await call('list_inbox_placement_tests', { [field]: bad });
      assert.ok(r.isError && r.text.includes(`${field} must be a real ISO 8601 date`), `${field}=${bad}: ${r.text}`);
    }
  }
  for (const good of ['2024-02-29', '2024-01-05T10:00:00Z', '2024-01-05T10:00:00.123+02:00', '2024-01-05T10:00']) {
    next = { status: 200, body: '{"tests":[]}' };
    const r = await call('list_inbox_placement_tests', { createdAfter: good });
    assert.ok(!r.text.includes('must be a real ISO'), `${good} accepted: ${r.text}`);
  }
}

// Secrets named in a call's arguments.
assert.deepEqual(collectArgSecrets({ username: 'a', password: 'b', port: 1, nested: { api_key: 'c' }, server: 'd' }).sort(), ['a', 'b', 'c']);

await client.close();
console.log('redaction: ok');

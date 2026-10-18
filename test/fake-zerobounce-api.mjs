/**
 * Test-only preload: replaces global fetch for ZeroBounce API hosts so the server can
 * be exercised offline. Every request is appended as a JSON line to FAKE_ZB_LOG with
 * the API key, path and fields it carried, and answered after a random delay so
 * concurrent requests interleave.
 *
 * API keys starting with these prefixes select an error mode, mirroring responses seen
 * from the live API:
 *   html-403-       403 with a large HTML "Access denied" page
 *   html-200-       200 with an HTML page instead of JSON or CSV
 *   batch-account-  /validatebatch reports an account-level error for "all" addresses
 *   batch-partial-  /validatebatch reports an error for one address only
 *
 * Usage: node --import ./test/fake-zerobounce-api.mjs dist/index.js --http
 */

/* eslint-env node */
import { appendFileSync } from 'node:fs';

const LOG_FILE = process.env.FAKE_ZB_LOG;
const realFetch = globalThis.fetch;

async function readFields(body) {
  const fields = {};
  if (!body) {
    return fields;
  }
  if (body instanceof FormData || body instanceof URLSearchParams) {
    for (const [name, value] of body.entries()) {
      fields[name] = typeof value === 'string' ? value : `<file ${value.name ?? 'blob'}>`;
    }
    return fields;
  }
  const text = typeof body === 'string' ? body : await new Response(body).text();
  try {
    return JSON.parse(text);
  } catch {
    return Object.fromEntries(new URLSearchParams(text));
  }
}

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url);
  if (url.hostname !== 'zerobounce.net' && !url.hostname.endsWith('.zerobounce.net')) {
    return realFetch(input, init);
  }

  const fields = { ...Object.fromEntries(url.searchParams), ...(await readFields(init.body)) };
  const entry = {
    method: init.method ?? 'GET',
    host: url.hostname,
    path: url.pathname.replace(/^\/v2/, ''),
    apiKey: fields.api_key ?? null,
    fields,
  };
  if (LOG_FILE) {
    appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  }

  await new Promise((resolve) => setTimeout(resolve, Math.random() * 40));

  const key = entry.apiKey ?? '';
  if (key.startsWith('html-403-') || key.startsWith('html-200-')) {
    const page =
      '<!DOCTYPE html><html lang="en-US"><head><title>Access denied | zerobounce.net</title></head><body>' +
      '<p>blocked</p>'.repeat(20000) +
      '</body></html>';
    return new Response(page, {
      status: key.startsWith('html-403-') ? 403 : 200,
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
    });
  }
  if (entry.path === '/validatebatch' && key.startsWith('batch-account-')) {
    return Response.json({
      errors: [{ email_address: 'all', error: 'Invalid API Key or your account ran out of credits' }],
      email_batch: [],
    });
  }
  if (entry.path === '/validatebatch' && key.startsWith('batch-partial-')) {
    return Response.json({
      errors: [{ email_address: 'bad@', error: 'Invalid email address' }],
      email_batch: [{ address: 'good@example.com', status: 'valid' }],
    });
  }

  // Echo the key back in every shape the client might read, so tool output can be
  // matched to the request that produced it.
  const payload = {
    success: true,
    Credits: entry.apiKey,
    echo_api_key: entry.apiKey,
    echo_path: entry.path,
    file_id: `file-for-${entry.apiKey}`,
    file_status: 'Complete',
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

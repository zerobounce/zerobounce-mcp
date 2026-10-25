/**
 * Test-only preload: replaces global fetch for ZeroBounce API hosts so the server can
 * be exercised offline. Every request is appended as a JSON line to FAKE_ZB_LOG with
 * the API key, path and fields it carried, and answered after a random delay so
 * concurrent requests interleave.
 *
 * The Inbox Placement Tester (bulkapi.zerobounce.net/api/ipt) is served too. It
 * authenticates with `Authorization: Bearer` rather than an api_key parameter, so the
 * bearer token is logged as the request's apiKey and every entry records the full URL
 * and its query separately -- that is what lets a test assert the key never reaches
 * the query string.
 *
 * API keys starting with these prefixes select an error mode, mirroring responses seen
 * from the live API:
 *   html-403-       403 with a large HTML "Access denied" page
 *   html-200-       200 with an HTML page instead of JSON or CSV
 *   batch-account-  /validatebatch reports an account-level error for "all" addresses
 *   batch-partial-  /validatebatch reports an error for one address only
 *   ipt-detail-     the Inbox Placement Tester answers 404 with a Django `detail` error
 *   ipt-conflict-   the Inbox Placement Tester answers 400 with a JSON list of messages
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

/** One header value, whatever shape the caller passed its headers in. */
function readHeader(headers, name) {
  if (!headers) {
    return null;
  }
  if (typeof headers.get === 'function') {
    return headers.get(name);
  }
  const entries = Array.isArray(headers) ? headers : Object.entries(headers);
  for (const [key, value] of entries) {
    if (String(key).toLowerCase() === name) {
      return value;
    }
  }
  return null;
}

function bearerToken(headers) {
  const header = readHeader(headers, 'authorization');
  const match = /^Bearer\s+(.+)$/i.exec(String(header ?? '').trim());
  return match ? match[1].trim() : null;
}

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url);
  if (url.hostname !== 'zerobounce.net' && !url.hostname.endsWith('.zerobounce.net')) {
    return realFetch(input, init);
  }

  const query = Object.fromEntries(url.searchParams);
  const body = await readFields(init.body);
  const fields = { ...query, ...body };
  const bearer = bearerToken(init.headers);
  const entry = {
    method: init.method ?? 'GET',
    host: url.hostname,
    path: url.pathname.replace(/^\/v2/, ''),
    // The Inbox Placement Tester carries its key in the Authorization header; every
    // other endpoint carries it as an api_key parameter.
    apiKey: fields.api_key ?? bearer ?? null,
    auth: bearer ? 'bearer' : fields.api_key != null ? 'parameter' : 'none',
    url: url.toString(),
    query,
    body,
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

  // Inbox Placement Tester: its own host path, its own error shapes, and a delete
  // that answers 204 with no body at all.
  if (url.hostname === 'bulkapi.zerobounce.net' && entry.path.startsWith('/api/ipt')) {
    if (key.startsWith('ipt-detail-')) {
      // Django REST framework reports errors as {"detail": "..."}.
      return Response.json({ detail: 'Inbox placement test not found.' }, { status: 404 });
    }
    if (key.startsWith('ipt-conflict-')) {
      return new Response(JSON.stringify(['In-progress tests cannot be deleted.']), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (entry.method === 'DELETE') {
      return new Response(null, { status: 204 });
    }
    return Response.json({
      echo_api_key: entry.apiKey,
      echo_path: entry.path,
      echo_method: entry.method,
      echo_query: entry.query,
      echo_body: entry.body,
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

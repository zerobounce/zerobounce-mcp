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
 *   returnurl-400- 400 with the live API's "Provided return URL is not permitted: None"
 *
 * The Warmup API (warmup-api.zerobounce.net) is served too. It carries its key in an
 * `API-Key` header rather than an `api_key` parameter, so warmup entries log that header
 * as `apiKey` and record the full URL for checking that the key never reaches the query
 * string. Warmup key prefixes:
 *   warmup-error-   400 with a JSON error body
 *   warmup-notcsv-  a CSV download endpoint answers with JSON instead
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

const WARMUP_BASE_PATH = '/api/v1/warmup';

/** One header value, whatever shape the caller passed its headers in, case-insensitively. */
function readHeader(headers, name) {
  if (!headers) return null;
  const wanted = String(name).toLowerCase();
  if (typeof headers.get === 'function') return headers.get(name);
  const entries =
    typeof headers.entries === 'function'
      ? headers.entries()
      : Array.isArray(headers)
        ? headers
        : Object.entries(headers);
  for (const [key, value] of entries) {
    if (String(key).toLowerCase() === wanted) return value;
  }
  return null;
}

function bearerToken(headers) {
  const header = readHeader(headers, 'authorization');
  const match = /^Bearer\s+(.+)$/i.exec(String(header ?? '').trim());
  return match ? match[1].trim() : null;
}

/** CSV downloads, keyed by the warmup sub-path that serves them. */
const WARMUP_CSV = {
  '/seeds/download': 'seed,provider\nseed1@example.com,gmail\nseed2@example.com,outlook\n',
  '/statistics/download': 'date,sent,inbox,spam\n2026-10-01,10,9,1\n',
};

async function handleWarmup(url, init, fields) {
  const path = url.pathname.slice(WARMUP_BASE_PATH.length) || '/';
  const key = readHeader(init.headers, 'API-Key') ?? null;
  const entry = {
    method: init.method ?? 'GET',
    host: url.hostname,
    path,
    apiKey: key,
    url: url.href,
    query: Object.fromEntries(url.searchParams),
    contentType: readHeader(init.headers, 'Content-Type'),
    accept: readHeader(init.headers, 'Accept'),
    fields,
  };
  if (LOG_FILE) {
    appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  }

  await new Promise((resolve) => setTimeout(resolve, Math.random() * 40));

  const prefix = String(key ?? '');
  if (prefix.startsWith('warmup-error-')) {
    return new Response(JSON.stringify({ detail: 'from_address parameter is invalid.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const csv = WARMUP_CSV[path];
  if (csv !== undefined) {
    if (prefix.startsWith('warmup-notcsv-')) {
      return new Response(JSON.stringify({ message: 'No statistics available.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(csv, {
      status: 200,
      headers: { 'Content-Type': 'text/csv; charset=utf-8' },
    });
  }

  // Echo the key and the sub-path back so a response can be matched to the
  // request that produced it, the same way the validation fixture does.
  return new Response(
    JSON.stringify({
      success: true,
      echo_api_key: key,
      echo_path: path,
      echo_method: entry.method,
      echo_query: entry.query,
      echo_body: fields,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url);
  if (url.hostname !== 'zerobounce.net' && !url.hostname.endsWith('.zerobounce.net')) {
    return realFetch(input, init);
  }

  const query = Object.fromEntries(url.searchParams);
  // Read the body once: a request body is a stream and cannot be consumed twice.
  const bodyFields = await readFields(init.body);
  const fields = { ...query, ...bodyFields };
  const bearer = bearerToken(init.headers);

  if (url.pathname.startsWith(WARMUP_BASE_PATH)) {
    return handleWarmup(url, init, fields);
  }
  const entry = {
    method: init.method ?? 'GET',
    host: url.hostname,
    // The full URL as sent, so tests can pin host, path and query together.
    url: url.href,
    path: url.pathname.replace(/^\/v2/, ''),
    // The Inbox Placement Tester carries its key in the Authorization header;
    // every other endpoint carries it as an api_key parameter.
    apiKey: fields.api_key ?? bearer ?? null,
    auth: bearer ? 'bearer' : fields.api_key != null ? 'parameter' : 'none',
    // Kept apart so tests can assert where the key and each field travelled.
    query,
    body: bodyFields,
    bodyFields,
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
  if (key.startsWith('returnurl-400-')) {
    // Verbatim from the live API when an S3/SFTP job goes out without return_url.
    return new Response(
      JSON.stringify({ error_message: 'Provided return URL is not permitted: None' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  if (entry.path === '/validatebatch' && key.startsWith('batch-account-')) {
    return Response.json({
      errors: [
        { email_address: 'all', error: 'Invalid API Key or your account ran out of credits' },
      ],
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

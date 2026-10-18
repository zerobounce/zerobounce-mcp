/**
 * Test-only preload: replaces global fetch for ZeroBounce API hosts so the server can
 * be exercised offline. Every request is appended as a JSON line to FAKE_ZB_LOG with
 * the API key, path and fields it carried, and answered after a random delay so
 * concurrent requests interleave.
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
  if (!url.hostname.endsWith('zerobounce.net')) {
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

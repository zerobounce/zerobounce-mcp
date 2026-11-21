/**
 * ZeroBounce MCP Server
 * Model Context Protocol server for ZeroBounce email validation
 */

import { isIPv4, isIPv6 } from 'node:net';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { formatErrorMessage } from './errors.js';
import { HTTP_MAX_REQUEST_BODY_BYTES } from './security/bulk-input.js';
import { DEFAULT_WARMUP_BASE_URL } from './warmup-client.js';
import { ZeroBounceMCPServer, type ServerConfig } from './server.js';

interface CliConfig extends ServerConfig {
  transport: 'stdio' | 'http';
  host: string;
  port: number;
  /** Extra Host names accepted in HTTP mode (public binds behind a proxy). */
  allowedHosts: string[];
}

const API_KEY_HEADER = 'x-zerobounce-api-key';
const WARMUP_API_KEY_HEADER = 'x-zerobounce-warmup-api-key';

const DEFAULT_API_BASE_URL = 'https://api.zerobounce.net/v2';

/**
 * ZeroBounce serves the main API from three hosts. Only these three exist:
 * there is no regional bulk or warmup host, so the bulk endpoints stay where
 * they are regardless of this setting.
 */
const REGIONAL_API_BASE_URLS: Record<string, string> = {
  default: DEFAULT_API_BASE_URL,
  us: 'https://api-us.zerobounce.net/v2',
  eu: 'https://api-eu.zerobounce.net/v2',
};

function authorityHasUserinfo(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.username || parsed.password) return true;
  const afterScheme = raw.trim().replace(/^https?:/i, '');
  const authority = afterScheme.replace(/^[/\\]+/, '').split(/[/\\?#]/)[0] || '';
  return authority.includes('@');
}

/**
 * An explicit base URL must be https, with no username, password, query, or
 * fragment. The error does not include the URL: it can hold a credential.
 */
function requireExplicitHttpsBase(raw: string, label: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`Invalid ${label}. Use an https:// URL.`);
  }
  if (authorityHasUserinfo(raw)) {
    throw new Error(`The ${label} must not contain a username or password.`);
  }
  if (parsed.search || parsed.hash || raw.includes('?') || raw.includes('#')) {
    throw new Error(`The ${label} must not contain a query string or a fragment.`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`The ${label} must use https.`);
  }
  return raw.replace(/\/+$/, '');
}

/** Accepts `us`, `eu`, `default`, or an explicit https URL (for a test host). */
function resolveApiBaseUrl(value: string | undefined): string {
  const raw = value?.trim();
  if (!raw) return DEFAULT_API_BASE_URL;

  const region = REGIONAL_API_BASE_URLS[raw.toLowerCase()];
  if (region) return region;

  try {
    return requireExplicitHttpsBase(raw, 'API URL');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid API URL')) throw error;
    if (!(error instanceof Error) || !error.message.startsWith('Invalid ')) throw error;
    throw new Error('Invalid API URL. Use us, eu, or an https:// URL.');
  }
}

/**
 * The Warmup API has exactly one host: `warmup-api-us` and `warmup-api-eu` do
 * not resolve, so there are deliberately no regional shorthands here. An
 * explicit https URL is accepted so the server can be pointed at a test double.
 */
function resolveWarmupBaseUrl(value: string | undefined): string {
  const raw = value?.trim();
  if (!raw) return DEFAULT_WARMUP_BASE_URL;
  try {
    return requireExplicitHttpsBase(raw, 'Warmup API URL');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid Warmup API URL')) throw error;
    if (!(error instanceof Error) || !error.message.startsWith('Invalid ')) throw error;
    throw new Error('Invalid Warmup API URL. Use an https:// URL.');
  }
}

/** Invisible characters that are not the ordinary ASCII space (U+0020). As ZeroBounce JS SDK 5.0.0 isInvisibleChar. */
function isInvisibleChar(code: number): boolean {
  return (
    code === 0x00ad ||
    code === 0x034f ||
    (code >= 0x0600 && code <= 0x0605) ||
    code === 0x0890 ||
    code === 0x0891 ||
    code === 0x061c ||
    code === 0x06dd ||
    code === 0x070f ||
    code === 0x08e2 ||
    code === 0x115f ||
    code === 0x1160 ||
    code === 0x17b4 ||
    code === 0x17b5 ||
    (code >= 0x180b && code <= 0x180f) ||
    (code >= 0x200b && code <= 0x200f) ||
    (code >= 0x202a && code <= 0x202e) ||
    (code >= 0x2060 && code <= 0x206f) ||
    code === 0x2800 ||
    code === 0x3164 ||
    (code >= 0xfe00 && code <= 0xfe0f) ||
    code === 0xfeff ||
    code === 0xffa0 ||
    (code >= 0xfff0 && code <= 0xfffb) ||
    code === 0x110bd ||
    code === 0x110cd ||
    (code >= 0x13430 && code <= 0x1343f) ||
    (code >= 0x1bca0 && code <= 0x1bca3) ||
    (code >= 0x1d173 && code <= 0x1d17a) ||
    (code >= 0xe0000 && code <= 0xe0fff)
  );
}

/**
 * A key with surrounding whitespace, a control (C0 or C1), a lone surrogate,
 * Unicode whitespace, an invisible/format character, or only combining marks
 * is refused (as ZeroBounce JS SDK 5.0.0 checkApiKey). A mid-key space stays allowed.
 */
function assertSafeApiKey(key: string, label: string): void {
  const message = `${label} must not contain control characters or invisible characters.`;
  if (key !== key.trim()) throw new Error(message);
  let onlyMarks = true;
  for (const char of key) {
    const code = char.codePointAt(0) ?? 0;
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) throw new Error(message);
    if (code >= 0xd800 && code <= 0xdfff) throw new Error(message);
    if (char !== ' ' && /\s/u.test(char)) throw new Error(message);
    if (isInvisibleChar(code)) throw new Error(message);
    if (!/\p{M}/u.test(char)) onlyMarks = false;
  }
  if (onlyMarks) throw new Error(message);
}

async function runStdio(config: ServerConfig): Promise<void> {
  const server = new ZeroBounceMCPServer(config);
  await server.connect(new StdioServerTransport());
  console.error(
    `ZeroBounce MCP server running on stdio${config.warmupApiKey ? ' (Warmup tools enabled)' : ''}`
  );
  if (!config.apiKey) {
    console.error(
      'No ZeroBounce API key: tools are listed, but calls return an error until ZEROBOUNCE_API_KEY or --api-key is set.'
    );
  }
}

// Same set as a JavaScript `\s` match, checked one character at a time so a long
// Authorization header cannot force the regex engine into polynomial backtracking.
function isHttpWhitespace(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    code === 0x09 ||
    code === 0x0a ||
    code === 0x0b ||
    code === 0x0c ||
    code === 0x0d ||
    code === 0x20 ||
    code === 0xa0 ||
    code === 0x1680 ||
    code === 0x2028 ||
    code === 0x2029 ||
    code === 0x202f ||
    code === 0x205f ||
    code === 0x3000 ||
    code === 0xfeff ||
    (code >= 0x2000 && code <= 0x200a)
  );
}

function bearerToken(authorization: string): string {
  const scheme = 'bearer';
  if (authorization.length <= scheme.length) return '';
  if (authorization.slice(0, scheme.length).toLowerCase() !== scheme) return '';
  let index = scheme.length;
  if (!isHttpWhitespace(authorization[index])) return '';
  while (index < authorization.length && isHttpWhitespace(authorization[index])) {
    index += 1;
  }
  if (index >= authorization.length) return '';
  return authorization.slice(index).trim();
}

/** How many times a header was sent (Node joins repeated headers into one string). */
function headerCount(req: IncomingMessage, name: string): number {
  let count = 0;
  for (let i = 0; i < req.rawHeaders.length; i += 2) {
    if (req.rawHeaders[i]?.toLowerCase() === name) count += 1;
  }
  return count;
}

function headerValue(req: IncomingMessage, name: string): string {
  const header = req.headers[name];
  const value = Array.isArray(header) ? header[0] : header;
  return value?.trim() ?? '';
}

/**
 * Each HTTP caller supplies their own ZeroBounce key, so there is deliberately
 * no fallback to ZEROBOUNCE_API_KEY in this mode. A repeated key header, a
 * repeated Authorization header, or an X-ZeroBounce-Api-Key that disagrees with
 * the Bearer token is refused: which key a call would run with must never depend
 * on header order.
 */
function getRequestApiKey(req: IncomingMessage): string {
  if (
    headerCount(req, API_KEY_HEADER) > 1 ||
    headerCount(req, 'authorization') > 1 ||
    headerCount(req, WARMUP_API_KEY_HEADER) > 1
  ) {
    throw new RequestError('Duplicate credential headers are not allowed.');
  }
  const value = headerValue(req, API_KEY_HEADER);
  const authorization = req.headers.authorization;
  const bearer = typeof authorization === 'string' ? bearerToken(authorization) : '';
  if (value && bearer && value !== bearer) {
    throw new RequestError('Conflicting API keys in X-ZeroBounce-Api-Key and Authorization.');
  }
  return value || bearer;
}

class RequestError extends Error {}

/**
 * The Warmup key is a credential of its own, so it travels per request like the
 * validation key and is never taken from the server's environment: one caller's
 * Warmup key must not warm another caller's mailboxes. A request without it
 * simply gets a server with no Warmup tools.
 */
function getRequestWarmupApiKey(req: IncomingMessage): string {
  return headerValue(req, WARMUP_API_KEY_HEADER);
}

function sendJsonRpcError(res: ServerResponse, status: number, message: string): void {
  res.writeHead(status, { 'Content-Type': 'application/json' }).end(
    JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message },
      id: null,
    })
  );
}

async function handleMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  baseUrl: string,
  warmupBaseUrl: string
): Promise<void> {
  // Stateless mode: no sessions, so GET (SSE stream) and DELETE (session end) do not apply.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJsonRpcError(res, 405, 'Method not allowed.');
    return;
  }

  let apiKey: string;
  try {
    apiKey = getRequestApiKey(req);
  } catch (error) {
    sendJsonRpcError(res, 400, formatErrorMessage(error));
    return;
  }
  if (!apiKey) {
    sendJsonRpcError(
      res,
      401,
      `ZeroBounce API key is required. Send it in the X-ZeroBounce-Api-Key header or as Authorization: Bearer <key>.`
    );
    return;
  }
  try {
    assertSafeApiKey(apiKey, 'ZeroBounce API key');
    const warmupKey = getRequestWarmupApiKey(req);
    if (warmupKey) assertSafeApiKey(warmupKey, 'ZeroBounce Warmup API key');
  } catch (error) {
    sendJsonRpcError(res, 401, formatErrorMessage(error));
    return;
  }

  // A fresh server per request keeps each caller's API key isolated: an SDK Server
  // can only be connected to one transport at a time, and sharing one instance
  // across concurrent requests would mix up which key a tool call runs with.
  const server = new ZeroBounceMCPServer({
    apiKey,
    baseUrl,
    warmupApiKey: getRequestWarmupApiKey(req) || undefined,
    warmupBaseUrl,
  });
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    maxRequestBodySize: HTTP_MAX_REQUEST_BODY_BYTES,
  });
  res.on('close', () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res);
}

const LOOPBACK_NAMES = ['localhost', '127.0.0.1', '::1'];

/** Host name of a Host header value or an Origin URL: lower case, no port, no brackets, no trailing dot. */
function hostnameOf(value: string): string | undefined {
  const text = value.trim().toLowerCase();
  let host: string;
  if (text.startsWith('[')) {
    const end = text.indexOf(']');
    if (end < 0) return undefined;
    host = text.slice(1, end);
    if (text.slice(end + 1) !== '' && !/^:\d{1,5}$/.test(text.slice(end + 1))) return undefined;
  } else {
    const parts = text.split(':');
    if (parts.length > 2) return undefined;
    host = parts[0] ?? '';
    if (parts.length === 2 && !/^\d{1,5}$/.test(parts[1] ?? '')) return undefined;
  }
  host = host.replace(/\.+$/, '');
  return host || undefined;
}

/**
 * Whether an `--allowed-host` value is a host name a Host header can carry: a DNS
 * name (letters, digits and inner hyphens in each label, at most 253 characters,
 * one trailing dot allowed), an IPv4 address that is not 0.0.0.0, or a bracketed
 * IPv6 address that parses and is not the unspecified address, each with an
 * optional :port from 1 to 65535.
 */
function isValidAllowedHost(value: string): boolean {
  const text = value.trim().toLowerCase();
  if (text.startsWith('[')) {
    const match = /^\[([0-9a-f:.]+)\](?::(\d+))?$/.exec(text);
    if (!match || !isIPv6(match[1])) return false;
    let normalized: string;
    try {
      normalized = new URL(`http://[${match[1]}]/`).hostname;
    } catch {
      return false;
    }
    if (normalized === '[::]') return false;
    return portInRange(match[2]);
  }
  const parts = text.split(':');
  if (parts.length > 2) return false;
  let host = parts[0];
  if (parts.length === 2 && !portInRange(parts[1])) return false;
  if (isIPv4(host)) return host !== '0.0.0.0';
  if (host.endsWith('.')) host = host.slice(0, -1);
  if (!host || host.length > 253) return false;
  return host.split('.').every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
}

function portInRange(port: string | undefined): boolean {
  if (port === undefined) return true;
  if (!/^\d{1,5}$/.test(port)) return false;
  const n = Number(port);
  return n >= 1 && n <= 65535;
}

/**
 * The Host names this server answers to, against DNS rebinding: the bound host
 * (loopback names for a loopback bind) plus any `--allowed-host` / MCP_ALLOWED_HOSTS
 * names. Null means "not restricted": a wildcard bind with nothing configured.
 */
function buildAllowedHosts(bindHost: string, extra: string[]): Set<string> | null {
  const bind = hostnameOf(bindHost) ?? bindHost.toLowerCase();
  const wildcard = bind === '0.0.0.0' || bind === '::';
  const names = new Set<string>();
  for (const name of extra) {
    const host = hostnameOf(name);
    if (!host || !isValidAllowedHost(name)) {
      throw new Error(
        `Invalid allowed host ${JSON.stringify(name)}: use a host name such as mcp.example.org (optionally with :port), not a URL.`
      );
    }
    names.add(host);
  }
  if (LOOPBACK_NAMES.includes(bind)) {
    for (const name of LOOPBACK_NAMES) names.add(name);
  } else if (!wildcard) {
    names.add(bind);
  } else if (names.size === 0) {
    return null;
  }
  return names;
}

/** Whether Host (and Origin, when a browser sends one) are acceptable for /mcp. */
function hostAndOriginAllowed(req: IncomingMessage, allowed: Set<string> | null): boolean {
  const hostHeader = req.headers.host;
  if (allowed) {
    const host = typeof hostHeader === 'string' ? hostnameOf(hostHeader) : undefined;
    if (!host || !allowed.has(host)) return false;
  }
  const origin = req.headers.origin;
  if (origin === undefined) return true;
  if (typeof origin !== 'string') return false;
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false; // includes "null"
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
  if (allowed) {
    const originHost = hostnameOf(parsed.host);
    return originHost !== undefined && allowed.has(originHost);
  }
  // No allow-list: only a same-origin browser request is accepted.
  return typeof hostHeader === 'string' && parsed.host.toLowerCase() === hostHeader.trim().toLowerCase();
}

/** The path of a request target, or undefined when it is not an origin-form target. */
function requestPath(target: string | undefined): string | undefined {
  // `//…` would be read as an authority by some parsers (`//[` does not parse at all).
  if (!target || !target.startsWith('/') || target.startsWith('//')) return undefined;
  const end = target.search(/[?#]/);
  return end < 0 ? target : target.slice(0, end);
}

async function runHttp(
  host: string,
  port: number,
  baseUrl: string,
  warmupBaseUrl: string,
  allowedHostNames: string[] = []
): Promise<void> {
  const allowedHosts = buildAllowedHosts(host, allowedHostNames);
  if (!allowedHosts) {
    console.error(
      'Warning: Host header is not restricted (wildcard bind without MCP_ALLOWED_HOSTS or --allowed-host). Set the public host name to enable DNS-rebinding protection.'
    );
  }
  const httpServer = createServer((req, res) => {
    try {
      // The request target is parsed by hand: `new URL('//[', ...)` throws.
      const pathname = requestPath(req.url);
      if (pathname === undefined) {
        res.writeHead(400, { 'Content-Type': 'application/json' }).end('{"error":"Bad request target."}');
        return;
      }

      // RFC 9112 section 3.2: a request with more than one Host header is refused.
      if (req.rawHeaders.filter((_, i) => i % 2 === 0 && _.toLowerCase() === 'host').length > 1) {
        res.writeHead(400, { 'Content-Type': 'application/json' }).end('{"error":"Duplicate Host header."}');
        return;
      }

      if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"status":"ok"}');
        return;
      }

      if (pathname !== '/mcp') {
        res.writeHead(404).end();
        return;
      }

      if (!hostAndOriginAllowed(req, allowedHosts)) {
        sendJsonRpcError(res, 403, 'Forbidden: Host or Origin is not allowed.');
        return;
      }

      handleMcpRequest(req, res, baseUrl, warmupBaseUrl).catch((error) => {
        console.error('Error handling MCP request:', formatErrorMessage(error));
        if (!res.headersSent) {
          sendJsonRpcError(res, 500, 'Internal server error.');
        }
      });
    } catch (error) {
      console.error('Error routing request:', formatErrorMessage(error));
      try {
        if (!res.headersSent) res.writeHead(500).end();
        else res.end();
      } catch {
        res.destroy();
      }
    }
  });
  // Slow-loris limits: Node's defaults are 60 s for headers and 300 s for a whole request.
  httpServer.headersTimeout = 15_000;
  httpServer.requestTimeout = 120_000;
  httpServer.keepAliveTimeout = 5_000;
  httpServer.maxConnections = 512;

  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(port, host, resolve);
  });
  console.error(`ZeroBounce MCP server listening on http://${host}:${port}/mcp`);
}

declare const __PACKAGE_VERSION__: string | undefined;

// Parse command line arguments
function parseArgs(): CliConfig {
  const args = process.argv.slice(2);
  const config: CliConfig = {
    apiKey: '',
    warmupApiKey: '',
    transport: process.env.MCP_TRANSPORT?.trim() === 'http' ? 'http' : 'stdio',
    // Loopback by default; hosted deployments must opt in to 0.0.0.0 explicitly.
    host: process.env.MCP_HOST?.trim() || '127.0.0.1',
    port: Number(process.env.PORT) || 3000,
    allowedHosts: (process.env.MCP_ALLOWED_HOSTS ?? '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean),
    baseUrl: resolveApiBaseUrl(process.env.ZEROBOUNCE_API_URL),
    warmupBaseUrl: resolveWarmupBaseUrl(process.env.ZEROBOUNCE_WARMUP_API_URL),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--api-key' || arg === '-k') {
      if (nextArg) {
        config.apiKey = nextArg;
        i++;
      } else {
        throw new Error('--api-key requires a value');
      }
    } else if (arg.startsWith('--api-key=')) {
      config.apiKey = arg.slice('--api-key='.length);
    } else if (arg === '--warmup-api-key') {
      if (nextArg) {
        config.warmupApiKey = nextArg;
        i++;
      } else {
        throw new Error('--warmup-api-key requires a value');
      }
    } else if (arg.startsWith('--warmup-api-key=')) {
      config.warmupApiKey = arg.slice('--warmup-api-key='.length);
    } else if (arg === '--warmup-url') {
      if (nextArg) {
        config.warmupBaseUrl = resolveWarmupBaseUrl(nextArg);
        i++;
      } else {
        throw new Error('--warmup-url requires a value');
      }
    } else if (arg.startsWith('--warmup-url=')) {
      config.warmupBaseUrl = resolveWarmupBaseUrl(arg.slice('--warmup-url='.length));
    } else if (arg === '--allowed-host') {
      if (nextArg) {
        config.allowedHosts.push(nextArg);
        i++;
      } else {
        throw new Error('--allowed-host requires a value');
      }
    } else if (arg.startsWith('--allowed-host=')) {
      config.allowedHosts.push(arg.slice('--allowed-host='.length));
    } else if (arg === '--http') {
      config.transport = 'http';
    } else if (arg === '--port') {
      if (nextArg) {
        config.port = Number(nextArg);
        i++;
      } else {
        throw new Error('--port requires a value');
      }
    } else if (arg.startsWith('--port=')) {
      config.port = Number(arg.slice('--port='.length));
    } else if (arg === '--host') {
      if (nextArg) {
        config.host = nextArg;
        i++;
      } else {
        throw new Error('--host requires a value');
      }
    } else if (arg.startsWith('--host=')) {
      config.host = arg.slice('--host='.length);
    } else if (arg === '--url') {
      if (nextArg) {
        config.baseUrl = resolveApiBaseUrl(nextArg);
        i++;
      } else {
        throw new Error('--url requires a value');
      }
    } else if (arg.startsWith('--url=')) {
      config.baseUrl = resolveApiBaseUrl(arg.slice('--url='.length));
    } else {
      // A mistyped flag must not be ignored: --api-ky would otherwise start the server
      // with the key from the environment, or without the option the user meant to set.
      throw new Error(`Unknown argument: ${arg.startsWith('-') ? arg.split('=')[0] : 'unexpected positional argument'}. Run with --help for the options.`);
    }
  }

  if (!Number.isInteger(config.port) || config.port <= 0) {
    throw new Error('--port must be a positive integer');
  }

  if (config.transport === 'http') {
    const loopback = config.host === '127.0.0.1' || config.host === '::1' || config.host === 'localhost';
    if (!loopback && process.env.MCP_TLS_TERMINATED !== 'true') {
      throw new Error('Non-loopback HTTP binding requires MCP_TLS_TERMINATED=true and a trusted TLS-terminating proxy.');
    }
    return config;
  }

  if (!config.apiKey) {
    config.apiKey = process.env.ZEROBOUNCE_API_KEY?.trim() ?? '';
  }

  // Optional: the Warmup tools are simply not registered without it, so a user
  // who has no Warmup subscription is not forced to supply anything.
  if (!config.warmupApiKey) {
    config.warmupApiKey = process.env.ZEROBOUNCE_WARMUP_API_KEY?.trim() ?? '';
  }

  // No key is not an error here: the server starts, lists its tools and prompts, and every
  // tool call says the key is missing. MCP directories and clients start a server without
  // credentials to see what it offers. A key that is set must still be well formed.
  if (config.apiKey) assertSafeApiKey(config.apiKey, 'ZeroBounce API key');
  if (config.warmupApiKey) assertSafeApiKey(config.warmupApiKey, 'ZeroBounce Warmup API key');

  return config;
}

const HELP_TEXT = `ZeroBounce MCP server

Usage: zerobounce-mcp [options]

Options:
  -k, --api-key <key>        ZeroBounce API key (or ZEROBOUNCE_API_KEY)
      --warmup-api-key <key> ZeroBounce Warmup API key, enables the Warmup tools (or ZEROBOUNCE_WARMUP_API_KEY)
      --url <url>            ZeroBounce API base URL (or ZEROBOUNCE_API_URL)
      --warmup-url <url>     Warmup API base URL (or ZEROBOUNCE_WARMUP_API_URL)
      --http                 Serve MCP over HTTP instead of stdio (or MCP_TRANSPORT=http)
      --port <port>          HTTP port, default 3000 (or PORT)
      --host <host>          HTTP bind address, default 127.0.0.1 (or MCP_HOST)
      --allowed-host <name>  Host name accepted in HTTP mode besides the bind address; repeatable (or MCP_ALLOWED_HOSTS, comma-separated)
  -h, --help                 Show this help and exit
  -v, --version              Show the version and exit

Binding a non-loopback --host also requires MCP_TLS_TERMINATED=true (HTTPS ends at a trusted proxy).
Unknown options are refused. In HTTP mode the API key comes from each request
(X-ZeroBounce-Api-Key or Authorization: Bearer), not from the command line.
`;

// --help and --version are answered before anything else is read, so they never need a key.
function handleInfoFlags(args: string[]): boolean {
  // A value-taking flag consumes the next argument, so it is skipped here.
  const valueFlags = new Set(['--api-key', '-k', '--warmup-api-key', '--warmup-url', '--port', '--host', '--url', '--allowed-host']);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (valueFlags.has(arg)) {
      // `--api-key --help` is a missing value, not the key "--help".
      if (args[i + 1]?.startsWith('--')) throw new Error(`${arg} requires a value`);
      i++;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(HELP_TEXT);
      return true;
    }
    if (arg === '--version' || arg === '-v') {
      process.stdout.write(`${typeof __PACKAGE_VERSION__ === 'string' ? __PACKAGE_VERSION__ : '0.0.0-dev'}\n`);
      return true;
    }
  }
  return false;
}

// Main entry point
async function main(): Promise<void> {
  try {
    if (handleInfoFlags(process.argv.slice(2))) return;
    const config = parseArgs();
    if (config.transport === 'http') {
      await runHttp(config.host, config.port, config.baseUrl, config.warmupBaseUrl, config.allowedHosts);
    } else {
      await runStdio({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        warmupApiKey: config.warmupApiKey || undefined,
        warmupBaseUrl: config.warmupBaseUrl,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', formatErrorMessage(error));
  process.exit(1);
});

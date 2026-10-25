/**
 * ZeroBounce MCP Server
 * Model Context Protocol server for ZeroBounce email validation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { HTTP_MAX_REQUEST_BODY_BYTES } from './security/bulk-input.js';
import { ZeroBounceClient } from './zerobounce-client.js';
import { DEFAULT_WARMUP_BASE_URL } from './warmup-client.js';
import { getAllTools, getToolRegistry } from './tools/index.js';

interface ServerConfig {
  apiKey: string;
  baseUrl: string;
  /** Optional: without it the Warmup tools are not registered at all. */
  warmupApiKey?: string;
  warmupBaseUrl: string;
}

interface CliConfig extends ServerConfig {
  transport: 'stdio' | 'http';
  host: string;
  port: number;
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

/** Accepts `us`, `eu`, `default`, or an explicit https URL (for a test host). */
function resolveApiBaseUrl(value: string | undefined): string {
  const raw = value?.trim();
  if (!raw) return DEFAULT_API_BASE_URL;

  const region = REGIONAL_API_BASE_URLS[raw.toLowerCase()];
  if (region) return region;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `Invalid API URL: ${raw}. Use us, eu, or an https:// URL.`
    );
  }
  if (parsed.protocol !== 'https:') {
    // Never silently fall back to production here: a caller who asked for one
    // host and got another would send their key somewhere they did not choose.
    throw new Error(`The API URL must use https, got: ${raw}`);
  }
  return raw.replace(/\/+$/, '');
}

/**
 * The Warmup API has exactly one host: `warmup-api-us` and `warmup-api-eu` do
 * not resolve, so there are deliberately no regional shorthands here. An
 * explicit https URL is accepted so the server can be pointed at a test double.
 */
function resolveWarmupBaseUrl(value: string | undefined): string {
  const raw = value?.trim();
  if (!raw) return DEFAULT_WARMUP_BASE_URL;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`Invalid Warmup API URL: ${raw}. Use an https:// URL.`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`The Warmup API URL must use https, got: ${raw}`);
  }
  return raw.replace(/\/+$/, '');
}

// Injected from package.json by the esbuild --define in `npm run build`.
declare const __PACKAGE_VERSION__: string | undefined;
const SERVER_VERSION = typeof __PACKAGE_VERSION__ === 'string' ? __PACKAGE_VERSION__ : '0.0.0-dev';

class ZeroBounceMCPServer {
  private server: Server;
  private client: ZeroBounceClient;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.client = new ZeroBounceClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      warmupApiKey: config.warmupApiKey,
      warmupBaseUrl: config.warmupBaseUrl,
    });

    this.server = new Server(
      {
        name: 'zerobounce-mcp',
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    const availability = { warmupConfigured: this.client.hasWarmup };
    const allTools = getAllTools(availability);
    const toolRegistry = getToolRegistry(availability);

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: allTools.map((tool) => tool.definition),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const handler = toolRegistry.get(name);
      if (!handler) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
      }

      return handler(this.client, args || {});
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'zerobounce://config',
          name: 'ZeroBounce Configuration',
          description: 'Current ZeroBounce API configuration',
          mimeType: 'application/json',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'zerobounce://config') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  baseUrl: this.config.baseUrl,
                  apiKeyConfigured: !!this.config.apiKey,
                  warmupBaseUrl: this.config.warmupBaseUrl,
                  warmupApiKeyConfigured: !!this.config.warmupApiKey,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  async connect(transport: Transport): Promise<void> {
    await this.server.connect(transport);
  }

  async close(): Promise<void> {
    await this.server.close();
  }
}

async function runStdio(config: ServerConfig): Promise<void> {
  const server = new ZeroBounceMCPServer(config);
  await server.connect(new StdioServerTransport());
  console.error(
    `ZeroBounce MCP server running on stdio${config.warmupApiKey ? ' (Warmup tools enabled)' : ''}`
  );
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

function headerValue(req: IncomingMessage, name: string): string {
  const header = req.headers[name];
  const value = Array.isArray(header) ? header[0] : header;
  return value?.trim() ?? '';
}

// Each HTTP caller supplies their own ZeroBounce key, so there is deliberately
// no fallback to ZEROBOUNCE_API_KEY in this mode.
function getRequestApiKey(req: IncomingMessage): string {
  const value = headerValue(req, API_KEY_HEADER);
  if (value) {
    return value;
  }

  const authorization = req.headers.authorization;
  return typeof authorization === 'string' ? bearerToken(authorization) : '';
}

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

  const apiKey = getRequestApiKey(req);
  if (!apiKey) {
    sendJsonRpcError(
      res,
      401,
      `ZeroBounce API key is required. Send it in the X-ZeroBounce-Api-Key header or as Authorization: Bearer <key>.`
    );
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

async function runHttp(
  host: string,
  port: number,
  baseUrl: string,
  warmupBaseUrl: string
): Promise<void> {
  const httpServer = createServer((req, res) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');

    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"status":"ok"}');
      return;
    }

    if (pathname !== '/mcp') {
      res.writeHead(404).end();
      return;
    }

    handleMcpRequest(req, res, baseUrl, warmupBaseUrl).catch((error) => {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        sendJsonRpcError(res, 500, 'Internal server error.');
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(port, host, resolve);
  });
  console.error(`ZeroBounce MCP server listening on http://${host}:${port}/mcp`);
}

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

  if (!config.apiKey) {
    throw new Error(
      'ZeroBounce API key is required. Provide it via the --api-key flag or the ZEROBOUNCE_API_KEY environment variable.'
    );
  }

  return config;
}

// Main entry point
async function main(): Promise<void> {
  try {
    const config = parseArgs();
    if (config.transport === 'http') {
      await runHttp(config.host, config.port, config.baseUrl, config.warmupBaseUrl);
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
  console.error('Fatal error:', error);
  process.exit(1);
});

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
import { ZeroBounceClient } from './zerobounce-client.js';
import { getAllTools, getToolRegistry } from './tools/index.js';

interface ServerConfig {
  apiKey: string;
}

interface CliConfig extends ServerConfig {
  transport: 'stdio' | 'http';
  port: number;
}

const API_KEY_HEADER = 'x-zerobounce-api-key';

class ZeroBounceMCPServer {
  private server: Server;
  private client: ZeroBounceClient;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.client = new ZeroBounceClient({
      apiKey: config.apiKey,
    });

    this.server = new Server(
      {
        name: 'zerobounce-mcp',
        version: '0.1.0',
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
    const allTools = getAllTools();
    const toolRegistry = getToolRegistry();

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
                  baseUrl: 'https://api.zerobounce.net/v2',
                  apiKeyConfigured: !!this.config.apiKey,
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

async function runStdio(apiKey: string): Promise<void> {
  const server = new ZeroBounceMCPServer({ apiKey });
  await server.connect(new StdioServerTransport());
  console.error('ZeroBounce MCP server running on stdio');
}

// Each HTTP caller supplies their own ZeroBounce key, so there is deliberately
// no fallback to ZEROBOUNCE_API_KEY in this mode.
function getRequestApiKey(req: IncomingMessage): string {
  const header = req.headers[API_KEY_HEADER];
  const value = Array.isArray(header) ? header[0] : header;
  if (value?.trim()) {
    return value.trim();
  }

  const match = req.headers.authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1].trim() ?? '';
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

async function handleMcpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
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

  const server = new ZeroBounceMCPServer({ apiKey });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res);
}

async function runHttp(port: number): Promise<void> {
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

    handleMcpRequest(req, res).catch((error) => {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        sendJsonRpcError(res, 500, 'Internal server error.');
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(port, resolve);
  });
  console.error(`ZeroBounce MCP server listening on http://0.0.0.0:${port}/mcp`);
}

// Parse command line arguments
function parseArgs(): CliConfig {
  const args = process.argv.slice(2);
  const config: CliConfig = {
    apiKey: '',
    transport: process.env.MCP_TRANSPORT?.trim() === 'http' ? 'http' : 'stdio',
    port: Number(process.env.PORT) || 3000,
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
    }
  }

  if (!Number.isInteger(config.port) || config.port <= 0) {
    throw new Error('--port must be a positive integer');
  }

  if (config.transport === 'http') {
    return config;
  }

  if (!config.apiKey) {
    config.apiKey = process.env.ZEROBOUNCE_API_KEY?.trim() ?? '';
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
      await runHttp(config.port);
    } else {
      await runStdio(config.apiKey);
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

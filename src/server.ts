/**
 * The MCP server object: the tools, the config resource and the client it
 * uses. index.ts runs it over stdio or HTTP; tests build it directly
 * (test/client-key.test.ts), so it lives apart from the entry point.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ZeroBounceClient } from './zerobounce-client.js';
import { getAllTools, getToolRegistry } from './tools/index.js';

export interface ServerConfig {
  apiKey: string;
  baseUrl: string;
  /** Optional: without it the Warmup tools are not registered at all. */
  warmupApiKey?: string;
  warmupBaseUrl: string;
}

// Injected from package.json by the esbuild --define in `npm run build`.
declare const __PACKAGE_VERSION__: string | undefined;
const SERVER_VERSION = typeof __PACKAGE_VERSION__ === 'string' ? __PACKAGE_VERSION__ : '0.0.0-dev';

export class ZeroBounceMCPServer {
  private server: Server;
  private client: ZeroBounceClient;
  // The keys are not kept on this object: it is inspectable, and the client
  // holds its key privately. Only what the config resource reports is kept.
  private config: {
    baseUrl?: string;
    warmupBaseUrl?: string;
    apiKeyConfigured: boolean;
    warmupApiKeyConfigured: boolean;
  };

  constructor(config: ServerConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      warmupBaseUrl: config.warmupBaseUrl,
      apiKeyConfigured: !!config.apiKey,
      warmupApiKeyConfigured: !!config.warmupApiKey,
    };
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
                  apiKeyConfigured: this.config.apiKeyConfigured,
                  warmupBaseUrl: this.config.warmupBaseUrl,
                  warmupApiKeyConfigured: this.config.warmupApiKeyConfigured,
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

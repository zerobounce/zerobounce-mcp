/**
 * ZeroBounce MCP Server
 * Model Context Protocol server for ZeroBounce email validation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ZeroBounce MCP server running on stdio');
  }
}

// Parse command line arguments
function parseArgs(): ServerConfig {
  const args = process.argv.slice(2);
  const config: ServerConfig = {
    apiKey: '',
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
      config.apiKey = arg.split('=')[1];
    }
  }

  if (!config.apiKey) {
    throw new Error(
      'ZeroBounce API key is required. Provide it via --api-key flag.'
    );
  }

  return config;
}

// Main entry point
async function main(): Promise<void> {
  try {
    const config = parseArgs();
    const server = new ZeroBounceMCPServer(config);
    await server.run();
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

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
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { ZeroBounceClient } from './zerobounce-client.js';
import { getAllTools, getToolRegistry } from './tools/index.js';
import { SERVER_INSTRUCTIONS } from './tools/catalog.js';
import { createErrorResponse } from './tools/types.js';
import { redactResultText, withSecrets } from './security/redact.js';
import { getPrompt, listPrompts } from './prompts.js';

/**
 * Returned by every tool call made without a key (stdio started with none). The
 * server still starts and lists its tools, so clients and directories can see
 * what it offers before the user has set a key.
 */
export const MISSING_API_KEY_MESSAGE =
  'ZeroBounce API key is required. Set the ZEROBOUNCE_API_KEY environment variable or pass ' +
  '--api-key, then restart the server.';

export interface ServerConfig {
  /** Empty when stdio started without a key: tools are listed, and every call returns an error. */
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
          prompts: {},
        },
        instructions: SERVER_INSTRUCTIONS,
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
        // The name is the caller's text: it goes through the same final pass as
        // every other result, with the key in this call's secrets.
        const secrets = this.client.secretsForCall(args || {});
        return {
          content: [
            {
              type: 'text',
              text: redactResultText(`Error: Unknown tool: ${name}`, secrets),
            },
          ],
          isError: true,
        };
      }

      // Without the main key, only the Warmup tools (which use their own key) can run.
      if (!this.config.apiKeyConfigured && !(name.startsWith('warmup_') && this.client.hasWarmup)) {
        return {
          content: [{ type: 'text', text: `Error: ${MISSING_API_KEY_MESSAGE}` }],
          isError: true,
        };
      }

      // One final pass over everything the model is shown, success or error,
      // with every secret of the call: the API key, the Warmup key, and any
      // username/password or token in the arguments.
      const secrets = this.client.secretsForCall(args || {});
      return withSecrets(secrets, async () => {
        let result;
        try {
          result = await handler(this.client, args || {});
        } catch (error) {
          result = createErrorResponse(error);
        }
        return {
          ...result,
          content: result.content.map((item) =>
            item.type === 'text' ? { ...item, text: redactResultText(item.text, secrets) } : item
          ),
        };
      });
    });

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: listPrompts(),
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        return getPrompt(name, args ?? {});
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new McpError(
          ErrorCode.InvalidParams,
          redactResultText(message, this.client.secretsForCall(args ?? {}))
        );
      }
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

      throw new Error(redactResultText(`Unknown resource: ${uri}`, this.client.secretsForCall()));
    });
  }

  async connect(transport: Transport): Promise<void> {
    await this.server.connect(transport);
  }

  async close(): Promise<void> {
    await this.server.close();
  }
}

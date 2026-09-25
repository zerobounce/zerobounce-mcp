/**
 * Register existing ZeroBounce tool handlers with an mcpfy MCPServer.
 */

import { MCPServer, error, text } from 'mcpfy-sdk/server';
import { z } from 'zod';
import type { ZeroBounceClient } from '../zerobounce-client.js';
import { getAllTools } from '../tools/index.js';

const toolInputSchema = z.record(z.string(), z.unknown());

export function registerZeroBounceTools(
  server: MCPServer,
  client: ZeroBounceClient
): void {
  for (const tool of getAllTools()) {
    const { name, description } = tool.definition;

    server.tool(
      {
        name,
        description: description ?? name,
        schema: toolInputSchema,
      },
      async (args: Record<string, unknown>) => {
        const result = await tool.handler(client, args);
        const message = result.content[0]?.text ?? '';

        if (result.isError) {
          return error(message);
        }

        return text(message);
      }
    );
  }

  server.resource(
    {
      name: 'zerobounce-config',
      uri: 'zerobounce://config',
      title: 'ZeroBounce Configuration',
      description: 'Current ZeroBounce API configuration',
    },
    async () =>
      text(
        JSON.stringify(
          {
            baseUrl: 'https://api.zerobounce.net/v2',
            apiKeyConfigured: true,
          },
          null,
          2
        )
      )
  );
}

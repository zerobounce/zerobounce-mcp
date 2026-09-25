/**
 * ZeroBounce MCP Server — HTTP entrypoint for MCPfy Deploy
 */

import { MCPServer } from 'mcpfy-sdk/server';
import { ZeroBounceClient } from './zerobounce-client.js';
import { registerZeroBounceTools } from './mcpfy/register-tools.js';

function parseApiKey(): string {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--api-key' || arg === '-k') {
      if (nextArg) {
        return nextArg;
      }
      throw new Error('--api-key requires a value');
    }

    if (arg.startsWith('--api-key=')) {
      return arg.slice('--api-key='.length);
    }
  }

  const apiKey = process.env.ZEROBOUNCE_API_KEY?.trim() ?? '';
  if (!apiKey) {
    throw new Error(
      'ZeroBounce API key is required. Provide it via the --api-key flag or the ZEROBOUNCE_API_KEY environment variable.'
    );
  }

  return apiKey;
}

function parsePort(): number {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--port' || arg === '-p') {
      if (!nextArg) {
        throw new Error('--port requires a value');
      }
      return parsePortValue(nextArg);
    }

    if (arg.startsWith('--port=')) {
      return parsePortValue(arg.slice('--port='.length));
    }
  }

  if (process.env.PORT) {
    return parsePortValue(process.env.PORT);
  }

  return 3000;
}

function parsePortValue(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${value}`);
  }
  return port;
}

/** mcpfy-sdk wraps the HTTP transport when MCPFY_API_KEY is set (skipped on MCPfy gateway). */
function logPulseStatus(): void {
  if (process.env.MCPFY_GATEWAY) {
    return;
  }

  if (process.env.MCPFY_API_KEY?.trim()) {
    console.error('MCPfy Pulse telemetry enabled');
  }
}

async function main(): Promise<void> {
  const apiKey = parseApiKey();
  const port = parsePort();
  const client = new ZeroBounceClient({ apiKey });

  const server = new MCPServer({
    name: 'zerobounce-mcp',
    version: '0.1.10',
    description:
      'Model Context Protocol server for ZeroBounce email validation, verification, and intelligence.',
  });

  registerZeroBounceTools(server, client);

  logPulseStatus();
  await server.listen({ transport: 'http', port });
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${message}`);
  process.exit(1);
});

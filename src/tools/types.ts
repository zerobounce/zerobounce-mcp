/**
 * Common types and interfaces for tools
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { formatErrorMessage } from '../errors.js';

export interface ToolHandler {
  definition: Tool;
  /**
   * ZeroBounce SDK methods this tool calls that older SDK releases lack. The tool is
   * only advertised when the installed SDK provides all of them.
   */
  sdkMethods?: string[];
  /**
   * `ZeroBounceWarmup` methods this tool calls. The tool is only advertised when
   * the installed SDK ships the Warmup client and provides all of them.
   */
  warmupMethods?: string[];
  /**
   * Whether the tool needs a configured Warmup API key. Warmup uses a separate
   * key from the validation API, so these tools stay hidden rather than being
   * advertised and then failing on every call.
   */
  requiresWarmupKey?: boolean;
  handler: (
    client: ZeroBounceClient,
    args: Record<string, unknown>
  ) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }>;
}

export function createSuccessResponse(data: unknown): {
  content: Array<{ type: 'text'; text: string }>;
} {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/** A response whose payload is already text, such as a CSV download. */
export function createTextResponse(text: string): {
  content: Array<{ type: 'text'; text: string }>;
} {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
  };
}

export function createErrorResponse(error: unknown): {
  content: Array<{ type: 'text'; text: string }>;
  isError: boolean;
} {
  const errorMessage = formatErrorMessage(error);
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${errorMessage}`,
      },
    ],
    isError: true,
  };
}

export function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !value) {
    throw new Error(`${fieldName} is required and must be a non-empty string`);
  }
  return value;
}

export function requireArray<T>(value: unknown, fieldName: string): T[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${fieldName} is required and must be a non-empty array`);
  }
  return value as T[];
}

/**
 * A required integer. MCP clients routinely send numbers as strings, so coerce
 * first and leave the range checks to the SDK, which carries the real limits.
 */
export function requireNumber(value: unknown, fieldName: string): number {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${fieldName} is required and must be a number`);
  }
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`${fieldName} is required and must be a number`);
  }
  return num;
}

export function requireBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} is required and must be true or false`);
  }
  return value;
}

export function optionalObject(
  value: unknown,
  fieldName: string
): Record<string, unknown> | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${fieldName} must be an object`);
  }
  return value as Record<string, unknown>;
}

export function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

export function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const num = typeof value === 'number' ? value : Number(value);
  return isNaN(num) ? undefined : num;
}

export function optionalBoolean(value: unknown): boolean | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return undefined;
}

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

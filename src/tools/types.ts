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

/** A required, non-empty array whose items are all non-empty strings. */
export function requireStringArray(value: unknown, fieldName: string): string[] {
  const items = requireArray<unknown>(value, fieldName);
  if (!items.every((item) => typeof item === 'string' && item !== '')) {
    throw new Error(`${fieldName} must contain only non-empty strings`);
  }
  return items as string[];
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

/**
 * An optional string. An empty string counts as not set; anything else that is
 * set but is not a string (a number, a boolean, an object) is an error rather
 * than being dropped, as for optionalNumber and optionalBoolean.
 */
export function optionalString(value: unknown, fieldName: string): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  return value;
}

/**
 * An optional number. MCP clients routinely send numbers as strings, so a
 * numeric string is accepted; anything else that is set (a non-numeric string
 * such as "abc", a boolean, an object) is an error rather than being dropped.
 * An empty string counts as not set.
 */
export function optionalNumber(value: unknown, fieldName: string): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const num =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value.trim())
        : NaN;
  if (!Number.isFinite(num)) {
    throw new Error(`${fieldName} must be a number`);
  }
  return num;
}

/**
 * An optional boolean, parsed strictly: true / false, the strings "true" /
 * "false" in any case, or 1 / 0. Anything else is an error rather than being
 * dropped, so `"false"` is never ignored and `"yes"` is never guessed at.
 */
export function optionalBoolean(value: unknown, fieldName: string): boolean | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 1 || value === 0) {
    return value === 1;
  }
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase();
    if (text === 'true' || text === 'false') {
      return text === 'true';
    }
  }
  throw new Error(`${fieldName} must be true or false`);
}

/** Highest 0-based column index: the SDK's 1-based indexes stop at 1000. */
export const MAX_COLUMN_INDEX = 999;

/**
 * An optional 0-based CSV column index: a whole number from 0 to 999. A
 * fraction, a negative number, or a huge value is refused here rather than
 * being shifted to a column the caller did not mean.
 */
export function optionalColumn(value: unknown, fieldName: string): number | undefined {
  const num = optionalNumber(value, fieldName);
  if (num === undefined) return undefined;
  if (!Number.isSafeInteger(num) || num < 0 || num > MAX_COLUMN_INDEX) {
    throw new Error(`${fieldName} must be a whole number from 0 to ${MAX_COLUMN_INDEX} (0-based column index)`);
  }
  return num;
}

/** The longest email address (RFC 5321 path limit is 254; 320 is the loose address bound). */
export const MAX_EMAIL_LENGTH = 320;

/** An email address of at most {@link MAX_EMAIL_LENGTH} characters. */
export function assertEmailLength(email: string, fieldName: string): void {
  if (email.length > MAX_EMAIL_LENGTH) {
    throw new Error(`${fieldName} must be at most ${MAX_EMAIL_LENGTH} characters`);
  }
}

/** A real calendar date written YYYY-MM-DD. */
export function requireIsoDate(value: unknown, fieldName: string): string {
  const text = requireString(value, fieldName);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const date = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : undefined;
  if (
    !match ||
    !date ||
    date.getUTCFullYear() !== Number(match[1]) ||
    date.getUTCMonth() !== Number(match[2]) - 1 ||
    date.getUTCDate() !== Number(match[3])
  ) {
    throw new Error(`${fieldName} must be a real date in YYYY-MM-DD format`);
  }
  return text;
}

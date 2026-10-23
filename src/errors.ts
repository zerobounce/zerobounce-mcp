/**
 * Error message helpers shared by the client and tool responses.
 */

/** Longest error message returned to MCP clients; API error bodies can be megabytes. */
export const MAX_ERROR_MESSAGE_LENGTH = 1000;

export function looksLikeHtml(text: string): boolean {
  return /<(?:!doctype\s+html|html|head|body)\b/i.test(text.slice(0, 2000));
}

/**
 * Turns an SDK or API error into one short line. The SDK wraps errors repeatedly
 * ("Error: [Error]: api_key is invalid") and passes non-JSON error bodies through
 * verbatim, which for blocked requests is a full HTML page.
 */
export function formatErrorMessage(error: unknown): string {
  let message = (error instanceof Error ? error.message : String(error)).trim();
  message = message.replace(/^(?:(?:Error|\[Error\]):\s*)+/i, '');

  if (looksLikeHtml(message)) {
    const title = message.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
    return `ZeroBounce returned an HTML error page${title ? ` ("${title}")` : ''} instead of an API response. Check the API key and request parameters.`;
  }

  if (message.length > MAX_ERROR_MESSAGE_LENGTH) {
    return `${message.slice(0, MAX_ERROR_MESSAGE_LENGTH)}… (truncated)`;
  }
  return message || 'Unknown error';
}

/**
 * Error message helpers shared by the client and tool responses.
 */

import { currentSecrets, redactResultText } from './security/redact.js';

/** Longest error message returned to MCP clients; API error bodies can be megabytes. */
export const MAX_ERROR_MESSAGE_LENGTH = 1000;

const HTML_TAG = /<(?:!doctype\s+html|html|head|body)\b/i;

/** Spaces, tabs, CR, LF, VT, FF, a leading BOM, and U+00A0. The tag is sought after these. */
function skipLeadingHtmlPadding(text: string): string {
  let index = 0;
  if (text.charCodeAt(0) === 0xfeff) index = 1;
  while (index < text.length) {
    const code = text.charCodeAt(index);
    if (
      code === 0x20 ||
      code === 0x09 ||
      code === 0x0a ||
      code === 0x0d ||
      code === 0x0b ||
      code === 0x0c ||
      code === 0xa0
    ) {
      index += 1;
      continue;
    }
    break;
  }
  return text.slice(index);
}

/** The HTML sniff reads this many characters after the padding. */
export const HTML_PROBE_CHARS = 2000;

/**
 * Whether a body is an HTML page. A body that starts with `{` or `[` after its
 * padding is JSON and never HTML, whatever a string inside it says (lesson 142).
 */
export function looksLikeHtml(text: string): boolean {
  const body = skipLeadingHtmlPadding(text);
  if (body.startsWith('{') || body.startsWith('[')) {
    return false;
  }
  return HTML_TAG.test(body.slice(0, HTML_PROBE_CHARS));
}

/**
 * Whether a file download is not a file but an HTML (or other markup) page: it
 * starts with `<` after its padding, which a CSV never does. The same rule as
 * the SDK's 5.0.0 looksLikeHtmlDownload.
 */
export function looksLikeHtmlDownload(text: string): boolean {
  return skipLeadingHtmlPadding(text).startsWith('<');
}

const HTML_TITLE_WINDOW = 65536;
const HTML_TITLE_MAX = 1000;

/** The text of the page's <title>, or '' when there is none or it is over 1000 characters. */
function htmlTitle(page: string): string {
  const title = page.slice(0, HTML_TITLE_WINDOW).match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  const text = title?.replace(/\s+/g, ' ').trim() ?? '';
  return text.length > HTML_TITLE_MAX ? '' : text;
}

/** What a thrown value says: an Error's message, a string, else a capped one-line description (never "[object Object]"). */
function describeThrown(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error !== null && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
    try {
      const json = JSON.stringify(error);
      if (json && json !== '{}') return json.slice(0, MAX_ERROR_MESSAGE_LENGTH + 1);
    } catch {
      // Circular or throwing toJSON: fall through to the fixed text.
    }
    return 'Unknown error';
  }
  if (typeof error === 'symbol' || typeof error === 'function') return 'Unknown error';
  return String(error);
}

/**
 * Turns an SDK or API error into one short line. The SDK wraps errors repeatedly
 * ("Error: [Error]: api_key is invalid") and passes non-JSON error bodies through
 * verbatim, which for blocked requests is a full HTML page.
 */
export function formatErrorMessage(error: unknown, secrets: string[] = currentSecrets()): string {
  let message = describeThrown(error).trim();
  message = message.replace(/^(?:(?:Error|\[Error\]):\s*)+/i, '');
  // Mask before anything is read out of the text: a title is taken from the
  // masked page, and a cut for length never leaves the start of a secret.
  message = redactResultText(message, secrets);

  // The message is the SDK's extraction, not the body: a real HTML page is
  // already its fixed text, so only a message that itself starts with `<` is
  // a page here (a tag further in is text, as in a JSON error string).
  if (looksLikeHtmlDownload(message)) {
    const title = htmlTitle(message);
    return `ZeroBounce returned an HTML error page${title ? ` ("${title}")` : ''} instead of an API response. Check the API key and request parameters.`;
  }

  if (message.length > MAX_ERROR_MESSAGE_LENGTH) {
    // Cut at a character boundary: never between the two halves of a surrogate pair.
    let end = MAX_ERROR_MESSAGE_LENGTH;
    const last = message.charCodeAt(end - 1);
    if (last >= 0xd800 && last <= 0xdbff) {
      end -= 1;
    }
    return `${message.slice(0, end)}… (truncated)`;
  }
  return message || 'Unknown error';
}

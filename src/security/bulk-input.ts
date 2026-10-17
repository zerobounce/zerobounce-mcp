import { isIP } from 'node:net';

/** Maximum UTF-8 byte length for bulk MCP fileContent (CSV upload). */
export const MAX_BULK_FILE_CONTENT_BYTES = 32 * 1024 * 1024;

function isPrivateOrLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return true;
  }

  const ipVersion = isIP(host);
  if (ipVersion === 4) {
    const parts = host.split('.').map((p) => Number(p));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
      return true;
    }
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0) {
      return true;
    }
    if (a === 169 && b === 254) {
      return true;
    }
    if (a === 172 && b >= 16 && b <= 31) {
      return true;
    }
    if (a === 192 && b === 168) {
      return true;
    }
    return false;
  }

  if (ipVersion === 6) {
    if (host === '::1') {
      return true;
    }
    if (host.startsWith('fe80:') || host.startsWith('fe80%')) {
      return true;
    }
    const first = host.split(':')[0];
    if (first.length >= 2 && (first.startsWith('fc') || first.startsWith('fd'))) {
      return true;
    }
    return false;
  }

  return false;
}

/** Validates optional bulk callback URLs (HTTPS, no private/link-local targets). */
export function validateBulkReturnUrl(returnUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(returnUrl);
  } catch {
    throw new Error('returnUrl must be a valid URL');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('returnUrl must use HTTPS');
  }

  const hostname = parsed.hostname;
  if (!hostname) {
    throw new Error('returnUrl must include a hostname');
  }

  if (isPrivateOrLocalHost(hostname)) {
    throw new Error('returnUrl must not target private, link-local, or loopback addresses');
  }

  if (isIP(hostname) === 0 && !hostname.includes('.')) {
    throw new Error('returnUrl hostname must be a fully qualified domain name');
  }
}

export function assertBulkFileContentWithinLimit(
  fileContent: string,
  fieldName = 'fileContent'
): void {
  const bytes = Buffer.byteLength(fileContent, 'utf8');
  if (bytes > MAX_BULK_FILE_CONTENT_BYTES) {
    throw new Error(
      `${fieldName} exceeds maximum size of ${MAX_BULK_FILE_CONTENT_BYTES} bytes`
    );
  }
}

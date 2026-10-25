import { isIP } from 'node:net';

/** Maximum UTF-8 byte length for bulk MCP fileContent (CSV upload). */
export const MAX_BULK_FILE_CONTENT_BYTES = 32 * 1024 * 1024;

/**
 * HTTP must be able to deliver a fileContent of {@link MAX_BULK_FILE_CONTENT_BYTES}.
 * JSON encoding can double a string of quotes, and the JSON-RPC envelope adds a
 * little more, so the transport limit is twice the file cap plus 64 KiB.
 */
export const HTTP_MAX_REQUEST_BODY_BYTES = MAX_BULK_FILE_CONTENT_BYTES * 2 + 64 * 1024;

/** `URL.hostname` keeps the brackets on an IPv6 literal (`[::1]`). */
function normalizeHost(hostname: string): string {
  const host = hostname.trim().toLowerCase();
  if (host.startsWith('[') && host.endsWith(']') && host.length >= 2) {
    return host.slice(1, -1);
  }
  return host;
}

function isPrivateIpv4(host: string): boolean {
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

/** `::ffff:7f00:1` and `::ffff:127.0.0.1` are the same IPv4 address. */
function ipv4FromMapped(host: string): string | undefined {
  const dotted = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(host);
  if (dotted?.[1]) {
    return dotted[1];
  }
  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(host);
  if (!hex?.[1] || !hex[2]) {
    return undefined;
  }
  const hi = Number.parseInt(hex[1], 16);
  const lo = Number.parseInt(hex[2], 16);
  return `${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`;
}

function isPrivateIpv6(host: string): boolean {
  const bare = (host.split('%')[0] ?? host).toLowerCase();
  if (bare === '::' || bare === '::0' || bare === '0:0:0:0:0:0:0:0') {
    return true;
  }
  if (bare === '::1' || bare === '0:0:0:0:0:0:0:1') {
    return true;
  }

  const mapped = ipv4FromMapped(bare);
  if (mapped) {
    return isPrivateIpv4(mapped);
  }

  const first = bare.split(':')[0] ?? '';
  if (!first) {
    return false;
  }
  const value = Number.parseInt(first, 16);
  if (!Number.isFinite(value)) {
    return false;
  }
  // fe80::/10 (link-local) and fc00::/7 (unique local).
  if (value >= 0xfe80 && value <= 0xfebf) {
    return true;
  }
  if (value >= 0xfc00 && value <= 0xfdff) {
    return true;
  }
  return false;
}

function isPrivateOrLocalHost(hostname: string): boolean {
  const host = normalizeHost(hostname);
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return true;
  }

  const ipVersion = isIP(host);
  if (ipVersion === 4) {
    return isPrivateIpv4(host);
  }
  if (ipVersion === 6) {
    return isPrivateIpv6(host);
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

  const hostname = normalizeHost(parsed.hostname);
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

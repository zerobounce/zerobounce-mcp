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
  let host = hostname.trim().toLowerCase();
  if (host.startsWith('[') && host.endsWith(']') && host.length >= 2) {
    host = host.slice(1, -1);
  }
  // `localhost.` and `localhost` are the same name.
  return host.replace(/\.+$/, '');
}

/** IPv4 special-purpose blocks (RFC 6890 and its updates, plus multicast and reserved). */
const IPV4_BLOCKS: Array<[string, number]> = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4], // reserved, and 255.255.255.255 (limited broadcast)
];

function ipv4ToInt(host: string): number | undefined {
  const parts = host.split('.');
  if (parts.length !== 4) return undefined;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return undefined;
    const n = Number(part);
    if (n > 255) return undefined;
    value = value * 256 + n;
  }
  return value;
}

function isSpecialIpv4Int(value: number): boolean {
  return IPV4_BLOCKS.some(([base, bits]) => {
    const baseInt = ipv4ToInt(base) as number;
    const size = 2 ** (32 - bits);
    return Math.floor(value / size) === Math.floor(baseInt / size);
  });
}

function isPrivateIpv4(host: string): boolean {
  const value = ipv4ToInt(host);
  // Anything that is not a plain dotted quad is refused rather than guessed at.
  return value === undefined ? true : isSpecialIpv4Int(value);
}

/** Parses an IPv6 literal (no brackets, no zone) to eight 16-bit groups. */
function parseIpv6(host: string): number[] | undefined {
  let text = host;
  const lastColon = text.lastIndexOf(':');
  if (text.includes('.')) {
    const v4 = ipv4ToInt(text.slice(lastColon + 1));
    if (v4 === undefined) return undefined;
    text =
      text.slice(0, lastColon + 1) +
      Math.floor(v4 / 65536).toString(16) +
      ':' +
      (v4 % 65536).toString(16);
  }
  const halves = text.split('::');
  if (halves.length > 2) return undefined;
  const toGroups = (part: string): number[] | undefined => {
    if (part === '') return [];
    const out: number[] = [];
    for (const g of part.split(':')) {
      if (!/^[0-9a-f]{1,4}$/i.test(g)) return undefined;
      out.push(Number.parseInt(g, 16));
    }
    return out;
  };
  const head = toGroups(halves[0] ?? '');
  const tail = halves.length === 2 ? toGroups(halves[1] ?? '') : [];
  if (!head || !tail) return undefined;
  if (halves.length === 1) return head.length === 8 ? head : undefined;
  const fill = 8 - head.length - tail.length;
  if (fill < 1) return undefined;
  return [...head, ...new Array<number>(fill).fill(0), ...tail];
}

function groupsToIpv4(hi: number, lo: number): string {
  return `${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`;
}

function isPrivateIpv6(host: string): boolean {
  const bare = (host.split('%')[0] ?? host).toLowerCase();
  const groups = parseIpv6(bare);
  if (!groups) return true; // not parseable: refuse
  const [a, b, c, d, e, f, g, h] = groups as [
    number, number, number, number, number, number, number, number,
  ];
  const firstFiveZero = a === 0 && b === 0 && c === 0 && d === 0 && e === 0;
  // ::/96 (unspecified, loopback, IPv4-compatible) and ::ffff:0:0/96 (IPv4-mapped).
  if (firstFiveZero && (f === 0 || f === 0xffff)) {
    return f === 0 ? true : isPrivateIpv4(groupsToIpv4(g, h));
  }
  // ::ffff:0:0:0/96 IPv4-translated (SIIT): judged by the embedded IPv4 address.
  if (a === 0 && b === 0 && c === 0 && d === 0 && e === 0xffff && f === 0) {
    return isPrivateIpv4(groupsToIpv4(g, h));
  }
  // 64:ff9b::/96 NAT64 well-known prefix: judged by the embedded IPv4 address.
  if (a === 0x64 && b === 0xff9b && c === 0 && d === 0 && e === 0 && f === 0) {
    return isPrivateIpv4(groupsToIpv4(g, h));
  }
  // 64:ff9b:1::/48 local-use NAT64.
  if (a === 0x64 && b === 0xff9b && c === 1) return true;
  // 2002::/16 6to4: judged by the embedded IPv4 address.
  if (a === 0x2002) return isPrivateIpv4(groupsToIpv4(b, c));
  if (a === 0x100 && b === 0 && c === 0 && d === 0) return true; // 100::/64 discard
  if (a === 0x2001 && b < 0x200) return true; // 2001::/23 IETF protocol assignments, Teredo
  if (a === 0x2001 && b === 0xdb8) return true; // documentation
  if (a === 0x3fff && b < 0x1000) return true; // 3fff::/20 documentation
  if (a === 0x5f00) return true; // 5f00::/16 SRv6 SIDs
  if (a >= 0xfc00 && a <= 0xfdff) return true; // fc00::/7 unique local
  if (a >= 0xfe80 && a <= 0xfebf) return true; // fe80::/10 link-local
  if (a >= 0xfec0 && a <= 0xfeff) return true; // fec0::/10 site-local (deprecated)
  if (a >= 0xff00) return true; // ff00::/8 multicast
  return false;
}

/** Names that resolve to loopback, a private address, or a cloud metadata service. */
const BLOCKED_NAME_SUFFIXES = [
  'localhost',
  'local',
  'localdomain',
  'internal',
  'lan',
  'home.arpa',
  'nip.io',
  'sslip.io',
  'xip.io',
  'traefik.me',
  'localtest.me',
  'lvh.me',
];
const BLOCKED_NAMES = new Set(['metadata', 'instance-data', 'metadata.google.internal']);

function isPrivateOrLocalHost(hostname: string): boolean {
  const host = normalizeHost(hostname);
  if (BLOCKED_NAMES.has(host)) return true;
  if (BLOCKED_NAME_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) {
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

/** Controls, whitespace, format and invisible characters, and backslashes, which WHATWG parsing would strip or rewrite. */
const UNSAFE_URL_CHARACTER = /[\p{Cc}\p{Cf}\p{Z}\s\\\p{Default_Ignorable_Code_Point}]/u;

/**
 * Validates a caller-supplied callback URL and returns the normalised href to
 * forward. HTTPS only, no userinfo, default port (or an explicit :443), no
 * private, link-local, loopback, or other special-purpose targets.
 * Used for bulk `returnUrl` and for the Inbox Placement Tester's `webhookUrl`, which
 * ZeroBounce posts finished results to; `fieldName` only names the field in errors.
 *
 * The check is on the literal host or IP only. DNS is not resolved: the callback
 * is made by ZeroBounce, not by this server, so a resolution here would be
 * racy (rebinding) and would not describe what ZeroBounce connects to.
 */
export function validateBulkReturnUrl(returnUrl: string, fieldName = 'returnUrl'): string {
  // The WHATWG parser drops TAB/CR/LF and trims controls, so the raw string is checked first.
  if (UNSAFE_URL_CHARACTER.test(returnUrl)) {
    throw new Error(
      `${fieldName} must not contain control, whitespace, or invisible characters, or backslashes`
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(returnUrl);
  } catch {
    throw new Error(`${fieldName} must be a valid URL`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`${fieldName} must use HTTPS`);
  }
  if (parsed.username || parsed.password) {
    throw new Error(`${fieldName} must not contain a username or password`);
  }
  // An explicit :443 is normalised away by the parser; any other port stays.
  if (parsed.port !== '') {
    throw new Error(`${fieldName} must use the default HTTPS port (443)`);
  }

  const hostname = normalizeHost(parsed.hostname);
  if (!hostname) {
    throw new Error(`${fieldName} must include a hostname`);
  }

  if (isPrivateOrLocalHost(hostname)) {
    throw new Error(`${fieldName} must not target private, link-local, or loopback addresses`);
  }

  if (isIP(hostname) === 0 && !hostname.includes('.')) {
    throw new Error(`${fieldName} hostname must be a fully qualified domain name`);
  }

  // Forward the normalised form: lower-case host, no trailing dot.
  if (!parsed.hostname.startsWith('[')) parsed.hostname = hostname;
  return parsed.href;
}

/** A file name goes into a multipart header: no CR, LF, NUL, or other control character. */
export function assertSafeFileName(fileName: string, fieldName = 'fileName'): void {
  if (/[\p{Cc}\u2028\u2029]/u.test(fileName)) {
    throw new Error(`${fieldName} must not contain control characters (such as CR, LF, or NUL)`);
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

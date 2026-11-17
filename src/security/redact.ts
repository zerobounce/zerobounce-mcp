import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Secret masking. Copied from @zerobounce/zero-bounce-sdk 5.0.0 src/utils.js
 * (secretForms ... redactSecrets and every helper they need); keep in step with
 * that file when the bundled SDK is bumped. Only type annotations, the exports
 * at the bottom (redactResultText, collectSecrets) and `export` keywords differ.
 */

const jsonEscaped = (text: string) => JSON.stringify(text).slice(1, -1);
/**
 * The same with "/" written as "\/", as PHP's json_encode and others write it.
 * jsonEscaped has already escaped every backslash, so turning each "/" into
 * "\/" here is a complete JSON escape, not a partial one.
 */
const jsonEscapedSlash = (text: string) => jsonEscaped(text).split("/").join("\\/");
/** URL-encoded with spaces as %20. */
const urlEncoded = (text: string) => encodeURIComponent(text);
/** Form-encoded as URLSearchParams writes it: spaces as "+", "'" as %27. */
const formEncoded = (text: string) => new URLSearchParams({ s: text }).toString().slice(2);

/** The quoting steps a secret can go through before a body echoes it, up to depth 2. */
const QUOTINGS = [jsonEscaped, jsonEscapedSlash];
/** How the quoted copy can then be encoded: as is, URL-encoded, form-encoded. */
const ENCODINGS = [(text: string) => text, urlEncoded, formEncoded];

/**
 * Every form a secret can take in a message, composed from the encoders above:
 * the raw secret and each one- or two-step JSON quoting of it (with or without
 * "/" as "\/"; a body or proxy quoting a JSON request body, and a JSON copy of
 * that quote), each as is, URL-encoded and form-encoded (a server that echoes
 * a URL-encoded request body). Plus escape() of the raw secret. Longest first,
 * so no form leaves part of a longer one behind.
 */
function secretForms(secret: string) {
  const raw = String(secret);
  const quoted = [raw];
  for (const once of QUOTINGS) {
    const first = once(raw);
    quoted.push(first);
    for (const twice of QUOTINGS) quoted.push(twice(first));
  }
  const forms = [escape(raw)];
  for (const text of quoted) {
    for (const encode of ENCODINGS) forms.push(encode(text));
  }
  return [...new Set(forms.filter(Boolean))].sort((a, b) => b.length - a.length);
}

/** What a message says instead when a decoded view of it still holds a secret. */
export const CREDENTIAL_OMITTED_MESSAGE =
  "ZeroBounce: the response text was omitted because it contained a credential.";

/** The UTF-8 sequence length a lead byte announces, or 0 for a byte no sequence starts with. */
function utf8SequenceLength(byte: number) {
  if (byte < 0x80) return 1;
  if (byte >= 0xc2 && byte <= 0xdf) return 2;
  if (byte >= 0xe0 && byte <= 0xef) return 3;
  if (byte >= 0xf0 && byte <= 0xf4) return 4;
  return 0;
}

/**
 * A run of %XX that is not valid UTF-8 as a whole, decoded one UTF-8 sequence
 * at a time: each valid sequence becomes its character and each byte that
 * starts none stays as its %XX. A stray %FF in front of a percent-encoded
 * secret therefore still leaves the secret readable in this view, whatever
 * its characters (a Latin-1 reading of the run would turn "ä" into "Ã¤").
 */
function percentRunDecoded(run: string) {
  const bytes = run.match(/%[0-9A-Fa-f]{2}/g) ?? [];
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const length = utf8SequenceLength(parseInt(bytes[i].slice(1), 16));
    if (length) {
      try {
        out += decodeURIComponent(bytes.slice(i, i + length).join(""));
        i += length;
        continue;
      } catch {
        // Not a complete, valid sequence: keep this byte as it is.
      }
    }
    out += bytes[i];
    i += 1;
  }
  return out;
}

/** %XX sequences decoded as UTF-8; a byte that is not part of valid UTF-8 stays as its %XX. */
function percentDecoded(text: string) {
  return text.replace(/(?:%[0-9A-Fa-f]{2})+/g, (run: string) => {
    try {
      return decodeURIComponent(run);
    } catch {
      return percentRunDecoded(run);
    }
  });
}

/** Every %XX as the Latin-1 character of its byte: the reading of a body that echoed a Latin-1 key ("%E9" for "é"). */
function percentLatin1(text: string) {
  return text.replace(/%([0-9A-Fa-f]{2})/g, (_: string, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Runs of characters U+0080 to U+00FF read as bytes: each valid UTF-8 sequence
 * becomes its character. `\xC3\xA9` and `\303\251` are the two bytes of "é",
 * which jsonUnescaped alone leaves as "Ã©"; a byte that starts no valid
 * sequence stays as it is, so this is a second view next to that one.
 */
function latin1RunsAsUtf8(text: string) {
  return text.replace(/[\u0080-\u00ff]+/g, (run: string) => {
    let out = "";
    let i = 0;
    while (i < run.length) {
      const length = utf8SequenceLength(run.charCodeAt(i));
      if (length > 1 && i + length <= run.length) {
        let escaped = "";
        for (let k = 0; k < length; k += 1) escaped += `%${run.charCodeAt(i + k).toString(16).padStart(2, "0")}`;
        try {
          out += decodeURIComponent(escaped);
          i += length;
          continue;
        } catch {
          // Not a valid sequence: keep this byte as it is.
        }
      }
      out += run[i];
      i += 1;
    }
    return out;
  });
}

const JSON_UNESCAPES: Record<string, string> = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", "'": "'" };

function hexDigit(char: string) {
  const d = parseInt(char, 16);
  return Number.isNaN(d) ? -1 : d;
}

function codePointText(code: number) {
  if (code < 0 || code > 0x10ffff) return "\uFFFD";
  return String.fromCodePoint(code);
}

/** JSON and other backslash escapes, including `\u{27}`, `\047`, `\U{27}` and `\x27`. */
function jsonUnescaped(text: string) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] !== "\\" || i + 1 >= text.length) {
      out += text[i];
      i += 1;
      continue;
    }
    const next = text[i + 1];
    if (next in JSON_UNESCAPES) {
      out += JSON_UNESCAPES[next];
      i += 2;
      continue;
    }
    if ((next === "u" || next === "U") && text[i + 2] === "{") {
      let j = i + 3;
      let digits = "";
      while (j < text.length && digits.length < 8 && hexDigit(text[j]) >= 0) {
        digits += text[j];
        j += 1;
      }
      if (digits && text[j] === "}") {
        out += codePointText(parseInt(digits, 16));
        i = j + 1;
        continue;
      }
    }
    if (next === "U" && /^[0-9A-Fa-f]{8}$/.test(text.slice(i + 2, i + 10)) && parseInt(text.slice(i + 2, i + 10), 16) <= 0x10ffff) {
      out += codePointText(parseInt(text.slice(i + 2, i + 10), 16));
      i += 10;
      continue;
    }
    if (next === "u" || next === "U") {
      const hex = text.slice(i + 2, i + 6);
      if (/^[0-9A-Fa-f]{4}$/.test(hex)) {
        let code = parseInt(hex, 16);
        if (code >= 0xd800 && code <= 0xdbff && text[i + 6] === "\\" && (text[i + 7] === "u" || text[i + 7] === "U")) {
          const low = text.slice(i + 8, i + 12);
          if (/^[0-9A-Fa-f]{4}$/.test(low)) {
            const lowCode = parseInt(low, 16);
            if (lowCode >= 0xdc00 && lowCode <= 0xdfff) {
              code = 0x10000 + ((code - 0xd800) << 10) + (lowCode - 0xdc00);
              out += codePointText(code);
              i += 12;
              continue;
            }
          }
        }
        out += codePointText(code);
        i += 6;
        continue;
      }
    }
    if (next === "x") {
      if (text[i + 2] === "{") {
        let j = i + 3;
        let digits = "";
        while (j < text.length && digits.length < 6 && hexDigit(text[j]) >= 0) {
          digits += text[j];
          j += 1;
        }
        if (digits && text[j] === "}") {
          out += codePointText(parseInt(digits, 16));
          i = j + 1;
          continue;
        }
      }
      if (hexDigit(text[i + 2]) >= 0 && hexDigit(text[i + 3]) >= 0) {
        out += String.fromCharCode(hexDigit(text[i + 2]) * 16 + hexDigit(text[i + 3]));
        i += 4;
        continue;
      }
    }
    if (next >= "0" && next <= "7") {
      let value = next.charCodeAt(0) - 48;
      let len = 2;
      if (next <= "3" && text[i + 2] >= "0" && text[i + 2] <= "7") {
        value = value * 8 + (text[i + 2].charCodeAt(0) - 48);
        len = 3;
        if (text[i + 3] >= "0" && text[i + 3] <= "7") {
          value = value * 8 + (text[i + 3].charCodeAt(0) - 48);
          len = 4;
        }
      } else if (text[i + 2] >= "0" && text[i + 2] <= "7") {
        value = value * 8 + (text[i + 2].charCodeAt(0) - 48);
        len = 3;
      }
      out += String.fromCharCode(value);
      i += len;
      continue;
    }
    out += text[i];
    i += 1;
  }
  return out;
}

function htmlEntity(name: string) {
  switch (name.toLowerCase()) {
    case "amp":
      return "&";
    case "lt":
      return "<";
    case "gt":
      return ">";
    case "quot":
      return '"';
    case "apos":
      return "'";
    case "nbsp":
      return "\u00a0";
    default:
      return null;
  }
}

/** Named and numeric HTML entities (`&#39`, `&APOS;`, …). `%u0027` is not decoded. */
function htmlUnescaped(text: string) {
  if (!text.includes("&")) return text;
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] !== "&") {
      out += text[i];
      i += 1;
      continue;
    }
    if (text[i + 1] === "#") {
      let radix = 10;
      let at = i + 2;
      if (text[at] === "x" || text[at] === "X") {
        radix = 16;
        at += 1;
      }
      let digits = "";
      while (at < text.length && (radix === 10 ? text[at] >= "0" && text[at] <= "9" : hexDigit(text[at]) >= 0)) {
        digits += text[at];
        at += 1;
      }
      if (digits) {
        let end = at;
        if (text[at] === ";") end = at + 1;
        out += codePointText(parseInt(digits, radix));
        i = end;
        continue;
      }
    }
  const nameMatch = text.slice(i + 1).match(/^[A-Za-z][A-Za-z0-9]*/);
    if (nameMatch) {
      const name = nameMatch[0];
      const decoded = htmlEntity(name);
      if (decoded != null) {
        const semi = text[i + 1 + name.length] === ";";
        out += decoded;
        i += 1 + name.length + (semi ? 1 : 0);
        continue;
      }
    }
    out += "&";
    i += 1;
  }
  return out;
}

/** `\xHH` byte escapes outside JSON's decoder. */
function hexByteEscapesDecoded(text: string) {
  if (!text.includes("\\x") && !text.includes("\\X")) return text;
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (
      text[i] === "\\" &&
      (text[i + 1] === "x" || text[i + 1] === "X") &&
      hexDigit(text[i + 2]) >= 0 &&
      hexDigit(text[i + 3]) >= 0
    ) {
      out += String.fromCharCode(hexDigit(text[i + 2]) * 16 + hexDigit(text[i + 3]));
      i += 4;
    } else {
      out += text[i];
      i += 1;
    }
  }
  return out;
}

/** Backslash-quote and HTML entities not covered by `jsonUnescaped`. */
function quoteDecoded(text: string) {
  return htmlUnescaped(hexByteEscapesDecoded(text.replace(/\\'/g, "'")));
}

/** Full case fold of one scalar via default Unicode mappings (no locale). */
function foldedScalars(scalar: string) {
  let current = [scalar];
  for (let round = 0; round < 3; round += 1) {
    const next = [];
    for (const item of current) {
      for (const upper of item.toUpperCase()) {
        for (const lower of upper.toLowerCase()) {
          next.push(lower);
        }
      }
    }
    if (next.join("") === current.join("")) break;
    current = next;
  }
  return current;
}

function foldedCharacter(character: string) {
  const scalars = [...character];
  const plain = scalars.every((s) => {
    const value = s.codePointAt(0) as number;
    return value >= 0x4e00 && value <= 0x9fff;
  });
  const out = plain ? scalars : [...character.normalize("NFD")];
  let folded = [];
  for (const scalar of out) {
    folded.push(...foldedScalars(scalar));
  }
  if (!plain) {
    folded = [...folded.join("").normalize("NFD")];
  }
  const droppable = folded.map(
    (scalar, index) => scalar.codePointAt(0) === 0x307 && index > 0 && folded[index - 1] === "i"
  );
  return { folded, droppable };
}

/** Folded text with byte offsets into the original string for masking. */
function buildFoldedText(text: string) {
  // eslint-disable-next-line no-control-regex -- vendored: ASCII fast path
  if (/^[\x00-\x7F]*$/.test(text)) {
    const scalars = [...text].map((c) => c.toLowerCase());
    const starts = scalars.map((_, index) => index);
    const ends = starts.map((start) => start + 1);
    return { scalars, starts, ends, droppable: scalars.map(() => false) };
  }
  const scalars = [];
  const starts = [];
  const ends = [];
  const droppable = [];
  let offset = 0;
  for (const character of text) {
    const width = [...character].length;
    const { folded, droppable: drops } = foldedCharacter(character);
    for (let index = 0; index < folded.length; index += 1) {
      scalars.push(folded[index]);
      starts.push(offset);
      ends.push(offset + width);
      droppable.push(drops[index]);
    }
    offset += width;
  }
  return { scalars, starts, ends, droppable };
}

function foldedSpelling(text: string) {
  const view = buildFoldedText(text);
  return view.scalars.filter((_, index) => !view.droppable[index]).join("");
}

function markScalar(scalar: string) {
  return /\p{M}/u.test(scalar);
}

interface FoldedView {
  scalars: string[];
  starts: number[];
  ends: number[];
  droppable: boolean[];
}

function secretOccurrences(needle: string[], haystack: FoldedView) {
  const text = haystack.scalars;
  if (!needle.length || text.length < needle.length) return [];
  let baseIndex = needle.length - 1;
  while (baseIndex >= 0 && markScalar(needle[baseIndex])) baseIndex -= 1;
  const found = [];
  for (let start = 0; start < text.length; start += 1) {
    if (text[start] !== needle[0]) continue;
    let matches = true;
    let position = start + 1;
    let offset = 1;
    while (offset <= baseIndex) {
      while (position < text.length && haystack.droppable[position] && text[position] !== needle[offset]) {
        position += 1;
      }
      if (position >= text.length || text[position] !== needle[offset]) {
        matches = false;
        break;
      }
      position += 1;
      offset += 1;
    }
    let last = position - 1;
    if (matches && baseIndex < needle.length - 1) {
      const span = haystack.starts[last];
      let next = last + 1;
      for (let mi = baseIndex + 1; mi < needle.length; mi += 1) {
        const mark = needle[mi];
        let seen = false;
        while (next < text.length && haystack.starts[next] === span) {
          const hit = !haystack.droppable[next] && text[next] === mark;
          next += 1;
          if (hit) {
            seen = true;
            last = next - 1;
            break;
          }
        }
        if (!seen) {
          matches = false;
          break;
        }
      }
    }
    if (matches) found.push([haystack.starts[start], haystack.ends[last]]);
  }
  return found;
}

/** NFD, full Unicode case fold, then drop U+0307 after `i` (lesson 111). */
function simpleFoldSpelling(text: string) {
  let folded = [];
  for (const scalar of [...String(text).normalize("NFD")]) {
    folded.push(...foldedScalars(scalar));
  }
  folded = [...folded.join("").normalize("NFD")];
  return folded
    .filter((scalar, index) => !(scalar.codePointAt(0) === 0x307 && index > 0 && folded[index - 1] === "i"))
    .join("");
}

function revealsInFoldedText(text: string, secrets: string[]) {
  const hay = simpleFoldSpelling(text);
  return secrets.filter(Boolean).some((secret) => {
    const needle = simpleFoldSpelling(String(secret));
    return needle.length > 0 && hay.includes(needle);
  });
}

function maskFolded(text: string, secrets: string[]) {
  const forms = [];
  for (const secret of secrets) {
    if (!secret) continue;
    forms.push(String(secret), ...secretForms(String(secret)));
  }
  const needles = [...new Set(forms.map((form) => foldedSpelling(form)).filter(Boolean))].map((spelling) => [...spelling]);
  if (!needles.length || !text) return text;
  const view = buildFoldedText(text);
  const ranges = [];
  for (const needle of needles) {
    for (const [start, end] of secretOccurrences(needle, view)) {
      const span = text.slice(start, end);
      if (span.includes("%") || span.includes("\\") || span.includes("&")) continue;
      ranges.push([start, end]);
    }
  }
  if (!ranges.length) return text;
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] < last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  let out = "";
  let index = 0;
  let next = 0;
  for (const character of text) {
    const width = character.length;
    if (next < merged.length && index === merged[next][0]) out += "***";
    if (next < merged.length && index >= merged[next][0] && index < merged[next][1]) {
      index += width;
      if (index === merged[next][1]) next += 1;
      continue;
    }
    out += character;
    index += width;
  }
  return out;
}

/**
 * The decoders a body's encodings are undone with: URL (%XX), form ("+" as a
 * space, then %XX, so a form-encoded layer takes one step), JSON, quotes and HTML.
 */
const DECODERS = [
  percentDecoded,
  (text: string) => percentDecoded(text.split("+").join(" ")),
  percentLatin1,
  (text: string) => percentLatin1(text.split("+").join(" ")),
  jsonUnescaped,
  (text: string) => latin1RunsAsUtf8(jsonUnescaped(text)),
  quoteDecoded,
];
/** The SDK's own request encoding plus three echo layers (standard.md §3). */
const DECODE_LAYERS = 4;

/** The text and every view of it reached by up to four decodings, in any order. */
function decodedViews(text: string) {
  const views = new Set([text]);
  let layer = [text];
  for (let depth = 0; depth < DECODE_LAYERS; depth += 1) {
    const next = [];
    for (const view of layer) {
      for (const decode of DECODERS) {
        const decoded = decode(view);
        if (!views.has(decoded)) {
          views.add(decoded);
          next.push(decoded);
        }
      }
    }
    layer = next;
  }
  return views;
}

/** Whether any decoded view of the text still contains one of the secrets. */
export function holdsSecret(text: unknown, secrets: unknown[] = []) {
  const present = secrets.filter(Boolean).map(String);
  if (!present.length) return false;
  for (const view of decodedViews(String(text))) {
    if (present.some((secret) => view.includes(secret))) return true;
    if (revealsInFoldedText(view, present)) return true;
  }
  return false;
}

/**
 * The most text redaction works on. Masking decodes and folds the text
 * (seconds per megabyte of non-ASCII text), and no message the SDK builds is
 * near this long, so longer text is replaced, whole, by a fixed message.
 */
export const MAX_REDACTED_LENGTH = 65536;
export const TEXT_TOO_LONG_MESSAGE = "ZeroBounce: the text was omitted because it is too long to show.";

/** The UTF-8 length of the text, counting a lone surrogate as 3 (U+FFFD). */
function utf8Length(text: string) {
  let total = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code < 0x80) total += 1;
    else if (code < 0x800) total += 2;
    else if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length && (text.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      total += 4;
      i += 1;
    } else total += 3;
  }
  return total;
}

/**
 * Replace every form a secret could take in a message with ***. Then decode
 * what is left (URL, "+", JSON, up to four layers in any order): a spelling
 * the list above misses still decodes to the secret, and the whole text is
 * dropped for a fixed message rather than returned.
 */
export function redactSecrets(text: unknown, secrets: unknown[] = []): string {
  let value = String(text);
  if (value.length > MAX_REDACTED_LENGTH / 3 && utf8Length(value) > MAX_REDACTED_LENGTH) {
    return TEXT_TOO_LONG_MESSAGE;
  }
  for (const secret of secrets) {
    if (!secret) continue;
    for (const form of secretForms(String(secret))) {
      value = value.split(form).join("***");
    }
  }
  value = maskFolded(value, secrets.map(String));
  value = value.replace(/([?&](?:api_key|API-Key)=)[^&\s"']+/gi, "$1***");
  return holdsSecret(value, secrets as string[]) ? CREDENTIAL_OMITTED_MESSAGE : value;
}


// ---------------------------------------------------------------------------
// Added for the MCP server (not in the SDK): the secrets of the current tool
// call, and the final pass over a whole tool result.
// ---------------------------------------------------------------------------

const callSecrets = new AsyncLocalStorage<string[]>();

/** Runs `fn` with the secrets of one tool call, for `currentSecrets()` and the error helpers. */
export function withSecrets<T>(secrets: string[], fn: () => T): T {
  return callSecrets.run(secrets.filter((s) => typeof s === "string" && s !== ""), fn);
}

/** The secrets of the tool call running now (empty outside one). */
export function currentSecrets(): string[] {
  return callSecrets.getStore() ?? [];
}

const SECRET_ARG_NAME = /pass(?:word|phrase)?|secret|token|api[_-]?key|username|credential|^user$/i;

/**
 * Secrets a caller put in a tool's arguments (an SMTP username and password, a
 * key or token in any field named like one), to be masked in that call's results.
 */
export function collectArgSecrets(args: unknown, depth = 0): string[] {
  const found: string[] = [];
  if (!args || typeof args !== "object" || depth > 3) return found;
  for (const [name, value] of Object.entries(args as Record<string, unknown>)) {
    if (typeof value === "string") {
      if (value !== "" && SECRET_ARG_NAME.test(name)) found.push(value);
    } else if (value && typeof value === "object") {
      found.push(...collectArgSecrets(value, depth + 1));
    }
  }
  return found;
}

/**
 * Secrets at least this long are masked wherever they appear, in every spelling.
 * A shorter one (a short SMTP username) would cut letters out of the server's
 * and the SDK's own fixed words, so in a whole result it is masked only as a
 * whole token: no letter or digit next to it. Text taken from a response body is
 * masked with every secret, however short, where it is taken (redactSecrets).
 */
export const WHOLE_TEXT_MIN_SECRET_LENGTH = 8;

/** A window the decoding passes handle (redactSecrets refuses over 64 KiB of UTF-8). */
const WINDOW_CHARS = 16384;

const isWordChar = (ch: string | undefined) => ch !== undefined && /[\p{L}\p{N}\p{M}]/u.test(ch);

/** One escape of the kinds the decoders undo, at the end of a text ... */
const ESCAPE_AT_END =
  /(?:%[0-9a-f]{2}|\\(?:[nrtbf"'/\\]|x[0-9a-f]{2}|[uU]\{[0-9a-f]{1,8}\}|u[0-9a-f]{4}|[0-7]{1,3})|&(?:#x[0-9a-f]+|#[0-9]+|[a-z]+);?)$/i;
/** ... and at the start of one. */
const ESCAPE_AT_START =
  /^(?:%[0-9a-f]{2}|\\(?:[nrtbf"'/\\]|x[0-9a-f]{2}|[uU]\{[0-9a-f]{1,8}\}|u[0-9a-f]{4}|[0-7]{1,3})|&(?:#x[0-9a-f]+|#[0-9]+|[a-z]+);?)/i;

/** The character one escape stands for ("%3D" is "=", "\\n" a line break), or the text itself. */
function escapeChars(escape: string): string {
  return htmlUnescaped(jsonUnescaped(percentLatin1(escape)));
}

/**
 * Whether the text before/after a short secret is a token boundary: no letter,
 * digit or combining mark next to it, an escape (%3D, \\n, &quot;) counting as
 * the character it stands for. Any other character is a boundary.
 */
function boundaryBefore(text: string, at: number): boolean {
  if (at === 0) return true;
  const prefix = text.slice(Math.max(0, at - 16), at);
  const escape = ESCAPE_AT_END.exec(prefix)?.[0];
  const ch = escape ? [...escapeChars(escape)].pop() : [...prefix].pop();
  return !isWordChar(ch);
}

function boundaryAfter(text: string, end: number): boolean {
  if (end >= text.length) return true;
  const suffix = text.slice(end, end + 16);
  const escape = ESCAPE_AT_START.exec(suffix)?.[0];
  const ch = escape ? [...escapeChars(escape)][0] : [...suffix][0];
  return !isWordChar(ch);
}

/** Start indexes of the secret in the text, ignoring case where lower-casing keeps the length. */
function occurrences(text: string, secret: string): number[] {
  const lower = text.toLowerCase();
  const exact = lower.length !== text.length;
  const hay = exact ? text : lower;
  const needle = exact ? secret : secret.toLowerCase();
  const found: number[] = [];
  if (!needle) return found;
  for (let at = hay.indexOf(needle); at >= 0; at = hay.indexOf(needle, at + 1)) found.push(at);
  return found;
}

/** The short secret as a whole token (any case, any non-alphanumeric boundary) replaced with ***. */
function maskWholeTokens(text: string, secret: string): string {
  if (!text || !secret) return text;
  let out = "";
  let from = 0;
  for (const at of occurrences(text, secret)) {
    if (at < from) continue;
    const end = at + secret.length;
    if (boundaryBefore(text, at) && boundaryAfter(text, end)) {
      out += text.slice(from, at) + "***";
      from = end;
    }
  }
  return out + text.slice(from);
}

/** Whether a decoded view of the text still holds the short secret as a whole token. */
function decodedTokenRemains(text: string, secret: string): boolean {
  for (const view of decodedViews(text)) {
    if (view === text) continue;
    for (const at of occurrences(view, secret)) {
      const plainBefore = at === 0 || !isWordChar([...view.slice(Math.max(0, at - 2), at)].pop());
      const plainAfter = !isWordChar([...view.slice(at + secret.length, at + secret.length + 2)][0]);
      if (plainBefore && plainAfter) return true;
    }
  }
  return false;
}

/** Splits long text into pieces of about `size` characters at a line break where there is one. */
function windows(text: string, size: number): string[] {
  const pieces: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + size);
    if (end < text.length) {
      const lineBreak = text.lastIndexOf("\n", end - 1);
      if (lineBreak > start + size / 2) end = lineBreak + 1;
      else if ((text.charCodeAt(end - 1) & 0xfc00) === 0xd800) end -= 1;
    }
    pieces.push(text.slice(start, end));
    start = end;
  }
  return pieces;
}

/** The longest spelling of a secret: 16 characters per character (\\U{1F600} escapes, %25XX twice) plus slack. */
const spellingSpan = (length: number) => 16 * length + 64;

/**
 * Applies `mask` to long text in windows, then once more over each seam (the
 * last `overlap` characters of one window with the first `overlap` of the next),
 * so a spelling split by a window boundary is masked whole. Windows are at
 * least 4 x overlap long. Linear in the length of the text.
 */
function maskInWindows(text: string, overlap: number, mask: (piece: string) => string): string {
  const size = Math.max(WINDOW_CHARS, 4 * overlap);
  if (text.length <= size) return mask(text);
  const pieces = windows(text, size).map(mask);
  const parts: string[] = [];
  let current = pieces[0];
  for (let i = 1; i < pieces.length; i += 1) {
    const next = pieces[i];
    let tail = Math.min(overlap, current.length);
    if (tail < current.length && (current.charCodeAt(current.length - tail) & 0xfc00) === 0xdc00) tail += 1;
    let head = Math.min(overlap, next.length);
    if (head < next.length && (next.charCodeAt(head - 1) & 0xfc00) === 0xd800) head -= 1;
    parts.push(current.slice(0, current.length - tail));
    current = mask(current.slice(current.length - tail) + next.slice(0, head)) + next.slice(head);
  }
  parts.push(current);
  return parts.join("");
}

/**
 * The final pass over a tool result's text, success or error: every form of every
 * secret of the call replaced with ***, for text of any length (long text is
 * masked in overlapping windows after one pass over the whole of it for the
 * plain spellings). A secret shorter than WHOLE_TEXT_MIN_SECRET_LENGTH is masked
 * as a whole token only (any case, any non-alphanumeric boundary, an escape such
 * as %3D or \\n counting as its character); one that a decoded view of the text
 * still shows as a whole token replaces the text by a fixed message.
 */
export function redactResultText(text: string, secrets: string[]): string {
  const present = [...new Set(secrets.filter((s) => typeof s === "string" && s !== ""))];
  if (!present.length || !text) return text;
  const long = present.filter((s) => s.length >= WHOLE_TEXT_MIN_SECRET_LENGTH);
  const short = present.filter((s) => s.length < WHOLE_TEXT_MIN_SECRET_LENGTH);
  let out = text;
  if (long.length) {
    if (out.length <= WINDOW_CHARS) {
      out = redactSecrets(out, long);
    } else {
      for (const secret of long) {
        for (const form of secretForms(secret)) out = out.split(form).join("***");
      }
      const overlap = spellingSpan(Math.max(...long.map((s) => s.length)));
      out = maskInWindows(out, overlap, (piece) => redactSecrets(piece, long));
    }
  }
  if (short.length) {
    const maskShort = (piece: string) => {
      let masked = piece;
      for (const secret of short) masked = maskWholeTokens(masked, secret);
      return short.some((secret) => decodedTokenRemains(masked, secret)) ? CREDENTIAL_OMITTED_MESSAGE : masked;
    };
    out = maskInWindows(out, spellingSpan(WHOLE_TEXT_MIN_SECRET_LENGTH), maskShort);
  }
  return out;
}

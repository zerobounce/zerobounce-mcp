#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@zerobounce/zero-bounce-sdk/dist/zeroBounceSDK.js
var require_zeroBounceSDK = __commonJS({
  "node_modules/@zerobounce/zero-bounce-sdk/dist/zeroBounceSDK.js"(exports, module) {
    !(function(e, t) {
      "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.ZeroBounceSDK = t() : e.ZeroBounceSDK = t();
    })(exports, () => (() => {
      "use strict";
      const e = { d: (t2, n2) => {
        if (Array.isArray(n2)) for (var r2 = 0; r2 < n2.length; ) {
          var i2 = n2[r2++], s2 = n2[r2++];
          e.o(t2, i2) ? 0 === s2 && r2++ : 0 === s2 ? Object.defineProperty(t2, i2, { enumerable: true, value: n2[r2++] }) : Object.defineProperty(t2, i2, { enumerable: true, get: s2 });
        }
        else for (var i2 in n2) e.o(n2, i2) && !e.o(t2, i2) && Object.defineProperty(t2, i2, { enumerable: true, get: n2[i2] });
      }, o: (e2, t2) => Object.prototype.hasOwnProperty.call(e2, t2) };
      let t = {};
      e.d(t, { default: () => st });
      const n = { GetCreditsResponse: { Credits: "integerString" }, EmailValidationResult: { address: "string", status: "string", sub_status: "string", free_email: "boolean", did_you_mean: "string", account: "string", domain: "string", domain_age_days: "string", active_in_days: "string", active_first_seen: "string", smtp_provider: "string", catchall_domain: "boolean", mx_found: ["string", "boolean"], mx_record: "string", firstname: "string", lastname: "string", gender: "string", country: "string", region: "string", city: "string", zipcode: "string", processed_at: "string", domain_website_exists: "string", domain_registrant_company_name: "string", message: "string", Message: "string" }, ValidateBatchResponse: { email_batch: "EmailValidationResult[]", errors: "array" }, ApiUsageResponse: { total: "number", status_valid: "number", status_invalid: "number", status_catch_all: "number", status_do_not_mail: "number", status_spamtrap: "number", status_unknown: "number", sub_status_toxic: "number", sub_status_disposable: "number", sub_status_role_based: "number", sub_status_possible_trap: "number", sub_status_global_suppression: "number", sub_status_timeout_exceeded: "number", sub_status_mail_server_temporary_error: "number", sub_status_mail_server_did_not_respond: "number", sub_status_greylisted: "number", sub_status_antispam_system: "number", sub_status_does_not_accept_mail: "number", sub_status_exception_occurred: "number", sub_status_failed_syntax_check: "number", sub_status_mailbox_not_found: "number", sub_status_unroutable_ip_address: "number", sub_status_possible_typo: "number", sub_status_no_dns_entries: "number", sub_status_role_based_catch_all: "number", sub_status_mailbox_quota_exceeded: "number", sub_status_forcible_disconnect: "number", sub_status_failed_smtp_connection: "number", sub_status_accept_all: "number", sub_status_mx_forward: "number", sub_status_alternate: "number", sub_status_allowed: "number", sub_status_blocked: "number", sub_status_gold: "number", sub_status_role_based_accept_all: "number", start_date: "string", end_date: "string" }, EmailActivityResponse: { found: "boolean", active_in_days: "string" }, EmailScoringResult: { email: "string", score: "integer" }, EmailScoringError: { error: "string" }, BulkSendFileSuccessResponse: { success: "boolean", message: "string", file_name: "string", file_id: "string" }, BulkSendFileErrorResponse: { success: ["boolean", "string"], message: ["string", "string[]"] }, ValidationFileStatusResponse: { success: "boolean", file_id: "string", file_name: "string", upload_date: "string", file_status: "string", file_phase_2_status: "string", complete_percentage: "string", error_reason: "string", return_url: "string", message: "string" }, ScoringFileStatusResponse: { success: "boolean", file_id: "string", file_name: "string", upload_date: "string", file_status: "string", complete_percentage: "string", return_url: "string", message: "string" }, BulkFileDeletedResponse: { success: "boolean", message: "string", file_name: "string", file_id: "string" }, EmailFinderResponse: { email: "string", email_confidence: "string", domain: "string", company_name: "string", did_you_mean: "string", failure_reason: "string" }, DomainFormatResponse: { domain: "string", company_name: "string", format: "string", confidence: "string", did_you_mean: "string", failure_reason: "string", other_domain_formats: "array" }, ListEvaluatorSubmitResponse: { file_id: "string", message: "string", success: "boolean" }, ListEvaluatorResultResponse: { file_status: "string", success: "boolean", message: "string" }, FilterListItem: { rule: "string", target: "string", value: "string" }, FilterMessageResponse: { Message: "string", Error: "string" }, S3ListFileEntry: { name: "string", size: "number", last_modified: "string" }, S3BulkJobResponse: { success: "boolean", message: "string", file_id: "string", export_path: "string" }, InboxPlacementProvider: { id: "number", name: "string", location: "string", seedCount: "number", seedIds: "number[]" }, InboxPlacementProviderGroup: { items: "InboxPlacementProvider[]" }, InboxPlacementProvidersResponse: { emailProviders: "InboxPlacementProviderGroup", gatewayProviders: "InboxPlacementProviderGroup" }, InboxPlacementTestCreated: { id: "string", identifier: "string", testType: "string", emailAddressList: "string[]" }, InboxPlacementCounts: { inboxCount: "number", spamCount: "number", otherCount: "number", notDeliveredCount: "number", pendingCount: "number", percentages: "any" }, InboxPlacementTestResult: { inboxCount: "number", spamCount: "number", otherCount: "number", notDeliveredCount: "number", pendingCount: "number", percentages: "any", id: "string", testName: "string", testType: "string", identifier: "string", status: "string", counts: "InboxPlacementCounts", results: "any", seeds: "array" }, InboxPlacementTestDeleted: { id: "string", status: "string" }, InboxPlacementWebhookResponse: { webhookUrl: "string" } }, r = { GetCreditsResponse: ["Credits"], EmailValidationResult: ["address", "status"] }, i = "ZeroBounce returned a response field of an unexpected type for this call", s = (e2) => null !== e2 && "object" == typeof e2 && !Array.isArray(e2);
      function a(e2) {
        return null == e2.address && null == e2.status && ["Message", "message"].some((t2) => "string" == typeof e2[t2] && "" !== e2[t2].trim());
      }
      function o(e2, t2, i2) {
        for (const n2 of t2) {
          if ("any" === n2) return null;
          if ("string" === n2 && "string" == typeof e2) return null;
          if ("integerString" === n2 && "string" == typeof e2 && /^-?[0-9]+$/.test(e2)) return null;
          if ("integerString" === n2 && Number.isSafeInteger(e2)) return null;
          if ("number" === n2 && "number" == typeof e2) return null;
          if ("integer" === n2 && Number.isSafeInteger(e2)) return null;
          if ("boolean" === n2 && "boolean" == typeof e2) return null;
          if ("object" === n2 && s(e2)) return null;
          if ("array" === n2 && Array.isArray(e2)) return null;
        }
        if (Array.isArray(e2)) {
          const n2 = t2.filter((e3) => e3.endsWith("[]")).map((e3) => e3.slice(0, -2));
          if (!n2.length) return i2;
          for (let t3 = 0; t3 < e2.length; t3 += 1) {
            const r2 = o(e2[t3], n2, `${i2}[${t3}]`);
            if (null !== r2) return r2;
          }
          return null;
        }
        const l2 = (function(e3) {
          return e3.filter((e4) => Object.prototype.hasOwnProperty.call(n, e4));
        })(t2);
        if (!s(e2) || !l2.length) return i2;
        const u2 = i2 ? `${i2}.` : "", c2 = new Set(l2.flatMap((e3) => r[e3] || []));
        if ("" !== i2 || !l2.includes("EmailValidationResult") || !a(e2)) {
          for (const t3 of c2) if (null == e2[t3]) return `${u2}${t3}`;
        }
        const d2 = {};
        for (const e3 of l2) for (const [t3, r2] of Object.entries(n[e3])) d2[t3] = [...d2[t3] || [], ...[].concat(r2)];
        for (const [t3, n2] of Object.entries(d2)) {
          if (!Object.prototype.hasOwnProperty.call(e2, t3) || null === e2[t3]) continue;
          const r2 = o(e2[t3], n2, `${u2}${t3}`);
          if (null !== r2) return r2;
        }
        return null;
      }
      const l = ["BulkSendFileSuccessResponse", "BulkFileDeletedResponse", "ValidationFileStatusResponse", "ScoringFileStatusResponse"], u = "https://bulkapi.zerobounce.net/v2", c = "https://bulkapi.zerobounce.net", d = { Accept: "*/*", "Accept-Encoding": "gzip, deflate, br", Connection: "keep-alive" };
      class f extends Error {
        constructor(e2, t2 = 0) {
          super(e2), this.name = "ZBApiError", this.statusCode = t2;
        }
      }
      function _(e2, t2 = 0) {
        return new f(e2, t2);
      }
      function m(e2) {
        if ("\\" === e2) return true;
        const t2 = e2.codePointAt(0);
        return t2 <= 32 || t2 >= 127 && t2 <= 159 || t2 >= 55296 && t2 <= 57343 || 65533 === t2 || !!S(t2) || /[\p{White_Space}\p{Default_Ignorable_Code_Point}\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Zs}\p{Co}\p{Cn}]/u.test(e2);
      }
      const p = /* @__PURE__ */ new Set(["127.0.0.1", "localhost", "[::1]"]);
      function h(e2, t2 = "apiBaseURL") {
        return (function(e3, t3, n2) {
          const r2 = () => new Error(`ZeroBounce: ${t3} must be an https:// URL`), i2 = () => new Error(`ZeroBounce: ${t3} must be an https:// URL (plain http:// only to 127.0.0.1, localhost or [::1]) with a host, without user information, a query string or a fragment ("@", "?" or "#"), a backslash, whitespace, control or invisible characters, a lone surrogate, a non-ASCII character or a "%" in the host, or an encoded slash or a dot segment in the path`);
          if ("string" != typeof e3) throw r2();
          const s2 = e3.toLowerCase(), a2 = s2.startsWith("https://"), o2 = s2.startsWith("http://");
          if (!a2 && !o2) throw r2();
          const l2 = e3.slice(a2 ? 8 : 7), u2 = l2.search(/[/?#\\]/), c2 = u2 < 0 ? l2 : l2.slice(0, u2);
          if (c2.includes("@")) throw new Error(`ZeroBounce: ${t3} must not contain a username or password.`);
          if (n2 && (e3.includes("?") || e3.includes("#"))) throw new Error(`ZeroBounce: ${t3} must not contain a query string or a fragment ("?" or "#").`);
          for (const t4 of e3) if (m(t4)) throw i2();
          const d2 = (function(e4) {
            let t4 = e4;
            if (t4.startsWith("[")) {
              const e5 = t4.indexOf("]");
              if (e5 < 0) return null;
              const n4 = t4.slice(e5 + 1);
              return t4 = t4.slice(0, e5 + 1), /^\[[0-9A-Fa-f:.]+\]$/.test(t4) ? n4 && !/^:[0-9]+$/.test(n4) ? null : t4.toLowerCase() : null;
            }
            const n3 = t4.lastIndexOf(":");
            if (n3 >= 0) {
              if (!/^[0-9]*$/.test(t4.slice(n3 + 1))) return null;
              t4 = t4.slice(0, n3);
            }
            return !t4 || t4.includes(":") || t4.includes("%") || !/^[\x21-\x7e]+$/.test(t4) ? null : t4.toLowerCase();
          })(c2);
          if (null == d2) throw i2();
          if (o2 && !p.has(d2)) throw r2();
          if (n2) for (const e4 of l2.slice(c2.length).split("/")) {
            let t4 = e4;
            try {
              t4 = decodeURIComponent(e4);
            } catch {
            }
            const n3 = e4.toLowerCase();
            if ("." === t4 || ".." === t4 || t4.includes("/") || t4.includes("\\")) throw i2();
            if (n3.includes("%2f") || n3.includes("%5c") || n3.includes("%00")) throw i2();
          }
          let f2;
          try {
            f2 = new URL(e3);
          } catch {
            throw r2();
          }
          if (f2.username || f2.password) throw new Error(`ZeroBounce: ${t3} must not contain a username or password.`);
          const _2 = f2.hostname.toLowerCase();
          if (_2 !== d2 && `[${_2}]` !== d2 && _2 !== d2.replace(/^\[|\]$/g, "")) throw i2();
          return e3;
        })(e2, t2, "request URL" !== t2);
      }
      function g(e2) {
        let t2 = e2.length;
        for (; t2 > 0 && 47 === e2.charCodeAt(t2 - 1); ) t2 -= 1;
        return e2.slice(0, t2);
      }
      function y(e2, t2) {
        return g(h(e2, t2));
      }
      function b(e2, t2) {
        if ("boolean" == typeof e2) return e2;
        if (1 === e2 || 0 === e2) return 1 === e2;
        if ("string" == typeof e2) {
          const t3 = e2.trim().toLowerCase();
          if ("true" === t3 || "false" === t3) return "true" === t3;
        }
        throw new Error(`ZeroBounce: ${t2} parameter is invalid. Must be true or false.`);
      }
      function S(e2) {
        return e2 >= 173 && e2 <= 173 || e2 >= 847 && e2 <= 847 || e2 >= 1536 && e2 <= 1541 || 2192 === e2 || 2193 === e2 || 1564 === e2 || 1757 === e2 || 1807 === e2 || 2274 === e2 || 4447 === e2 || 4448 === e2 || 6068 === e2 || 6069 === e2 || e2 >= 6155 && e2 <= 6159 || e2 >= 8203 && e2 <= 8207 || e2 >= 8234 && e2 <= 8238 || e2 >= 8288 && e2 <= 8293 || e2 >= 8294 && e2 <= 8303 || 10240 === e2 || 12644 === e2 || e2 >= 65024 && e2 <= 65039 || 65279 === e2 || 65440 === e2 || e2 >= 65520 && e2 <= 65528 || e2 >= 65529 && e2 <= 65531 || 69821 === e2 || 69837 === e2 || e2 >= 78896 && e2 <= 78911 || e2 >= 113824 && e2 <= 113827 || e2 >= 119155 && e2 <= 119162 || e2 >= 917504 && e2 <= 921599;
      }
      function w(e2, t2 = "api key") {
        if ("string" != typeof e2 || !e2.trim()) throw new Error(`ZeroBounce: ${t2} parameter is missing.`);
        if (e2 !== e2.trim() || [...e2].some((e3) => {
          const t3 = e3.codePointAt(0);
          return t3 <= 31 || t3 >= 127 && t3 <= 159 || t3 >= 55296 && t3 <= 57343 || !(" " === e3 || !/\s/u.test(e3)) || !!S(t3);
        })) throw new Error(`ZeroBounce: ${t2} has surrounding whitespace or control characters.`);
        if ([...e2].every((e3) => (function(e4) {
          const t3 = String.fromCodePoint(e4);
          return /\p{M}/u.test(t3);
        })(e3.codePointAt(0)))) throw new Error(`ZeroBounce: ${t2} has surrounding whitespace or control characters.`);
        return e2;
      }
      const R = (e2) => JSON.stringify(e2).slice(1, -1), v = [R, (e2) => R(e2).split("/").join("\\/")], E = [(e2) => e2, (e2) => encodeURIComponent(e2), (e2) => new URLSearchParams({ s: e2 }).toString().slice(2)];
      function L(e2) {
        const t2 = String(e2), n2 = [t2];
        for (const e3 of v) {
          const r3 = e3(t2);
          n2.push(r3);
          for (const e4 of v) n2.push(e4(r3));
        }
        const r2 = [escape(t2)];
        for (const e3 of n2) for (const t3 of E) r2.push(t3(e3));
        return [...new Set(r2.filter(Boolean))].sort((e3, t3) => t3.length - e3.length);
      }
      function U(e2) {
        return e2 < 128 ? 1 : e2 >= 194 && e2 <= 223 ? 2 : e2 >= 224 && e2 <= 239 ? 3 : e2 >= 240 && e2 <= 244 ? 4 : 0;
      }
      function T(e2) {
        return e2.replace(/(?:%[0-9A-Fa-f]{2})+/g, (e3) => {
          try {
            return decodeURIComponent(e3);
          } catch {
            return (function(e4) {
              const t2 = e4.match(/%[0-9A-Fa-f]{2}/g);
              let n2 = "", r2 = 0;
              for (; r2 < t2.length; ) {
                const e5 = U(parseInt(t2[r2].slice(1), 16));
                if (e5) try {
                  n2 += decodeURIComponent(t2.slice(r2, r2 + e5).join("")), r2 += e5;
                  continue;
                } catch {
                }
                n2 += t2[r2], r2 += 1;
              }
              return n2;
            })(e3);
          }
        });
      }
      function A(e2) {
        return e2.replace(/%([0-9A-Fa-f]{2})/g, (e3, t2) => String.fromCharCode(parseInt(t2, 16)));
      }
      const B = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "	", "'": "'" };
      function k(e2) {
        const t2 = parseInt(e2, 16);
        return Number.isNaN(t2) ? -1 : t2;
      }
      function F(e2) {
        return e2 < 0 || e2 > 1114111 ? "\uFFFD" : String.fromCodePoint(e2);
      }
      function P(e2) {
        let t2 = "", n2 = 0;
        for (; n2 < e2.length; ) {
          if ("\\" !== e2[n2] || n2 + 1 >= e2.length) {
            t2 += e2[n2], n2 += 1;
            continue;
          }
          const r2 = e2[n2 + 1];
          if (r2 in B) t2 += B[r2], n2 += 2;
          else {
            if (("u" === r2 || "U" === r2) && "{" === e2[n2 + 2]) {
              let r3 = n2 + 3, i2 = "";
              for (; r3 < e2.length && i2.length < 8 && k(e2[r3]) >= 0; ) i2 += e2[r3], r3 += 1;
              if (i2 && "}" === e2[r3]) {
                t2 += F(parseInt(i2, 16)), n2 = r3 + 1;
                continue;
              }
            }
            if ("U" === r2 && /^[0-9A-Fa-f]{8}$/.test(e2.slice(n2 + 2, n2 + 10)) && parseInt(e2.slice(n2 + 2, n2 + 10), 16) <= 1114111) t2 += F(parseInt(e2.slice(n2 + 2, n2 + 10), 16)), n2 += 10;
            else {
              if ("u" === r2 || "U" === r2) {
                const r3 = e2.slice(n2 + 2, n2 + 6);
                if (/^[0-9A-Fa-f]{4}$/.test(r3)) {
                  let i2 = parseInt(r3, 16);
                  if (i2 >= 55296 && i2 <= 56319 && "\\" === e2[n2 + 6] && ("u" === e2[n2 + 7] || "U" === e2[n2 + 7])) {
                    const r4 = e2.slice(n2 + 8, n2 + 12);
                    if (/^[0-9A-Fa-f]{4}$/.test(r4)) {
                      const e3 = parseInt(r4, 16);
                      if (e3 >= 56320 && e3 <= 57343) {
                        i2 = 65536 + (i2 - 55296 << 10) + (e3 - 56320), t2 += F(i2), n2 += 12;
                        continue;
                      }
                    }
                  }
                  t2 += F(i2), n2 += 6;
                  continue;
                }
              }
              if ("x" === r2) {
                if ("{" === e2[n2 + 2]) {
                  let r3 = n2 + 3, i2 = "";
                  for (; r3 < e2.length && i2.length < 6 && k(e2[r3]) >= 0; ) i2 += e2[r3], r3 += 1;
                  if (i2 && "}" === e2[r3]) {
                    t2 += F(parseInt(i2, 16)), n2 = r3 + 1;
                    continue;
                  }
                }
                if (k(e2[n2 + 2]) >= 0 && k(e2[n2 + 3]) >= 0) {
                  t2 += String.fromCharCode(16 * k(e2[n2 + 2]) + k(e2[n2 + 3])), n2 += 4;
                  continue;
                }
              }
              if (r2 >= "0" && r2 <= "7") {
                let i2 = r2.charCodeAt(0) - 48, s2 = 2;
                r2 <= "3" && e2[n2 + 2] >= "0" && e2[n2 + 2] <= "7" ? (i2 = 8 * i2 + (e2[n2 + 2].charCodeAt(0) - 48), s2 = 3, e2[n2 + 3] >= "0" && e2[n2 + 3] <= "7" && (i2 = 8 * i2 + (e2[n2 + 3].charCodeAt(0) - 48), s2 = 4)) : e2[n2 + 2] >= "0" && e2[n2 + 2] <= "7" && (i2 = 8 * i2 + (e2[n2 + 2].charCodeAt(0) - 48), s2 = 3), t2 += String.fromCharCode(i2), n2 += s2;
                continue;
              }
              t2 += e2[n2], n2 += 1;
            }
          }
        }
        return t2;
      }
      function O(e2) {
        switch (e2.toLowerCase()) {
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
            return "\xA0";
          default:
            return null;
        }
      }
      function j(e2) {
        let t2 = [e2];
        for (let e3 = 0; e3 < 3; e3 += 1) {
          const e4 = [];
          for (const n2 of t2) for (const t3 of n2.toUpperCase()) for (const n3 of t3.toLowerCase()) e4.push(n3);
          if (e4.join("") === t2.join("")) break;
          t2 = e4;
        }
        return t2;
      }
      function I(e2) {
        const t2 = [...e2], n2 = t2.every((e3) => {
          const t3 = e3.codePointAt(0);
          return t3 >= 19968 && t3 <= 40959;
        });
        let r2 = n2 ? t2 : [...e2.normalize("NFD")], i2 = [];
        for (const e3 of r2) i2.push(...j(e3));
        n2 || (i2 = [...i2.join("").normalize("NFD")]);
        const s2 = i2.map((e3, t3) => 775 === e3.codePointAt(0) && t3 > 0 && "i" === i2[t3 - 1]);
        return { folded: i2, droppable: s2 };
      }
      function C(e2) {
        if (/^[\x00-\x7F]*$/.test(e2)) {
          const t3 = [...e2].map((e3) => e3.toLowerCase()), n3 = t3.map((e3, t4) => t4), r3 = n3.map((e3) => e3 + 1);
          return { scalars: t3, starts: n3, ends: r3, droppable: t3.map(() => false) };
        }
        const t2 = [], n2 = [], r2 = [], i2 = [];
        let s2 = 0;
        for (const a2 of e2) {
          const e3 = [...a2].length, { folded: o2, droppable: l2 } = I(a2);
          for (let a3 = 0; a3 < o2.length; a3 += 1) t2.push(o2[a3]), n2.push(s2), r2.push(s2 + e3), i2.push(l2[a3]);
          s2 += e3;
        }
        return { scalars: t2, starts: n2, ends: r2, droppable: i2 };
      }
      function x(e2) {
        return /\p{M}/u.test(e2);
      }
      function D(e2, t2) {
        const n2 = t2.scalars;
        if (!e2.length || n2.length < e2.length) return [];
        let r2 = e2.length - 1;
        for (; r2 >= 0 && x(e2[r2]); ) r2 -= 1;
        const i2 = [];
        for (let s2 = 0; s2 < n2.length; s2 += 1) {
          if (n2[s2] !== e2[0]) continue;
          let a2 = true, o2 = s2 + 1, l2 = 1;
          for (; l2 <= r2; ) {
            for (; o2 < n2.length && t2.droppable[o2] && n2[o2] !== e2[l2]; ) o2 += 1;
            if (o2 >= n2.length || n2[o2] !== e2[l2]) {
              a2 = false;
              break;
            }
            o2 += 1, l2 += 1;
          }
          let u2 = o2 - 1;
          if (a2 && r2 < e2.length - 1) {
            const i3 = t2.starts[u2];
            let s3 = u2 + 1;
            for (let o3 = r2 + 1; o3 < e2.length; o3 += 1) {
              const r3 = e2[o3];
              let l3 = false;
              for (; s3 < n2.length && t2.starts[s3] === i3; ) {
                const e3 = !t2.droppable[s3] && n2[s3] === r3;
                if (s3 += 1, e3) {
                  l3 = true, u2 = s3 - 1;
                  break;
                }
              }
              if (!l3) {
                a2 = false;
                break;
              }
            }
          }
          a2 && i2.push([t2.starts[s2], t2.ends[u2]]);
        }
        return i2;
      }
      function $(e2) {
        let t2 = [];
        for (const n2 of [...String(e2).normalize("NFD")]) t2.push(...j(n2));
        return t2 = [...t2.join("").normalize("NFD")], t2.filter((e3, n2) => !(775 === e3.codePointAt(0) && n2 > 0 && "i" === t2[n2 - 1])).join("");
      }
      function z(e2, t2) {
        const n2 = $(e2);
        return t2.filter(Boolean).some((e3) => {
          const t3 = $(String(e3));
          return t3.length > 0 && n2.includes(t3);
        });
      }
      const N = [T, (e2) => T(e2.split("+").join(" ")), A, (e2) => A(e2.split("+").join(" ")), P, (e2) => (function(e3) {
        return e3.replace(/[\u0080-\u00ff]+/g, (e4) => {
          let t2 = "", n2 = 0;
          for (; n2 < e4.length; ) {
            const r2 = U(e4.charCodeAt(n2));
            if (r2 > 1 && n2 + r2 <= e4.length) {
              let i2 = "";
              for (let t3 = 0; t3 < r2; t3 += 1) i2 += `%${e4.charCodeAt(n2 + t3).toString(16).padStart(2, "0")}`;
              try {
                t2 += decodeURIComponent(i2), n2 += r2;
                continue;
              } catch {
              }
            }
            t2 += e4[n2], n2 += 1;
          }
          return t2;
        });
      })(P(e2)), function(e2) {
        return (function(e3) {
          if (!e3.includes("&")) return e3;
          let t2 = "", n2 = 0;
          for (; n2 < e3.length; ) {
            if ("&" !== e3[n2]) {
              t2 += e3[n2], n2 += 1;
              continue;
            }
            if ("#" === e3[n2 + 1]) {
              let r3 = 10, i2 = n2 + 2;
              "x" !== e3[i2] && "X" !== e3[i2] || (r3 = 16, i2 += 1);
              let s2 = "";
              for (; i2 < e3.length && (10 === r3 ? e3[i2] >= "0" && e3[i2] <= "9" : k(e3[i2]) >= 0); ) s2 += e3[i2], i2 += 1;
              if (s2) {
                let a2 = i2;
                ";" === e3[i2] && (a2 = i2 + 1), t2 += F(parseInt(s2, r3)), n2 = a2;
                continue;
              }
            }
            const r2 = e3.slice(n2 + 1).match(/^[A-Za-z][A-Za-z0-9]*/);
            if (r2) {
              const i2 = r2[0], s2 = O(i2);
              if (null != s2) {
                const r3 = ";" === e3[n2 + 1 + i2.length];
                t2 += s2, n2 += 1 + i2.length + (r3 ? 1 : 0);
                continue;
              }
            }
            t2 += "&", n2 += 1;
          }
          return t2;
        })((function(e3) {
          if (!e3.includes("\\x") && !e3.includes("\\X")) return e3;
          let t2 = "", n2 = 0;
          for (; n2 < e3.length; ) "\\" === e3[n2] && ("x" === e3[n2 + 1] || "X" === e3[n2 + 1]) && k(e3[n2 + 2]) >= 0 && k(e3[n2 + 3]) >= 0 ? (t2 += String.fromCharCode(16 * k(e3[n2 + 2]) + k(e3[n2 + 3])), n2 += 4) : (t2 += e3[n2], n2 += 1);
          return t2;
        })(e2.replace(/\\'/g, "'")));
      }];
      function M(e2, t2 = []) {
        let n2 = String(e2);
        if (n2.length > 65536 / 3 && (function(e3) {
          let t3 = 0;
          for (let n3 = 0; n3 < e3.length; n3 += 1) {
            const r2 = e3.charCodeAt(n3);
            r2 < 128 ? t3 += 1 : r2 < 2048 ? t3 += 2 : r2 >= 55296 && r2 <= 56319 && n3 + 1 < e3.length && 56320 == (64512 & e3.charCodeAt(n3 + 1)) ? (t3 += 4, n3 += 1) : t3 += 3;
          }
          return t3;
        })(n2) > 65536) return "ZeroBounce: the text was omitted because it is too long to show.";
        for (const e3 of t2) if (e3) for (const t3 of L(e3)) n2 = n2.split(t3).join("***");
        return n2 = (function(e3, t3) {
          const n3 = [];
          for (const e4 of t3) e4 && n3.push(String(e4), ...L(String(e4)));
          const r2 = [...new Set(n3.map((e4) => (function(e5) {
            const t4 = C(e5);
            return t4.scalars.filter((e6, n4) => !t4.droppable[n4]).join("");
          })(e4)).filter(Boolean))].map((e4) => [...e4]);
          if (!r2.length || !e3) return e3;
          const i2 = C(e3), s2 = [];
          for (const t4 of r2) for (const [n4, r3] of D(t4, i2)) {
            const t5 = e3.slice(n4, r3);
            t5.includes("%") || t5.includes("\\") || t5.includes("&") || s2.push([n4, r3]);
          }
          if (!s2.length) return e3;
          s2.sort((e4, t4) => e4[0] - t4[0] || t4[1] - e4[1]);
          const a2 = [];
          for (const e4 of s2) {
            const t4 = a2[a2.length - 1];
            t4 && e4[0] < t4[1] ? t4[1] = Math.max(t4[1], e4[1]) : a2.push([...e4]);
          }
          let o2 = "", l2 = 0, u2 = 0;
          for (const t4 of e3) {
            const e4 = t4.length;
            u2 < a2.length && l2 === a2[u2][0] && (o2 += "***"), u2 < a2.length && l2 >= a2[u2][0] && l2 < a2[u2][1] ? (l2 += e4, l2 === a2[u2][1] && (u2 += 1)) : (o2 += t4, l2 += e4);
          }
          return o2;
        })(n2, t2), n2 = n2.replace(/([?&](?:api_key|API-Key)=)[^&\s"']+/gi, "$1***"), (function(e3, t3 = []) {
          const n3 = t3.filter(Boolean).map(String);
          if (!n3.length) return false;
          for (const t4 of (function(e4) {
            const t5 = /* @__PURE__ */ new Set([e4]);
            let n4 = [e4];
            for (let e5 = 0; e5 < 4; e5 += 1) {
              const e6 = [];
              for (const r2 of n4) for (const n5 of N) {
                const i2 = n5(r2);
                t5.has(i2) || (t5.add(i2), e6.push(i2));
              }
              n4 = e6;
            }
            return t5;
          })(String(e3))) {
            if (n3.some((e4) => t4.includes(e4))) return true;
            if (z(t4, n3)) return true;
          }
          return false;
        })(n2, t2) ? "ZeroBounce: the response text was omitted because it contained a credential." : n2;
      }
      function Z(e2) {
        if ((function(e3, t2 = 512) {
          let n2 = 0, r2 = false;
          for (let i2 = 0; i2 < e3.length; i2 += 1) {
            const s2 = e3[i2];
            if (r2) "\\" === s2 ? i2 += 1 : '"' === s2 && (r2 = false);
            else if ('"' === s2) r2 = true;
            else if ("[" === s2 || "{" === s2) {
              if (n2 += 1, n2 > t2) return true;
            } else "]" !== s2 && "}" !== s2 || (n2 -= 1);
          }
          return false;
        })(String(e2))) throw new f("ZeroBounce returned a response nested too deeply to read.", null);
        return JSON.parse(e2);
      }
      function q() {
        if ("undefined" != typeof AbortSignal && "function" == typeof AbortSignal.timeout) return AbortSignal.timeout(12e4);
      }
      function K() {
        return "undefined" != typeof window && "undefined" != typeof document && "function" == typeof document.createElement;
      }
      function G(e2) {
        return e2 && "number" == typeof e2.status ? e2.status : 200;
      }
      function W(e2) {
        return e2 && e2.headers && "function" == typeof e2.headers.get ? String(e2.headers.get("content-type") || "").toLowerCase() : "";
      }
      function J(e2) {
        const t2 = String(e2 || "").split(";")[0].trim().toLowerCase();
        return "application/json" === t2 || t2.endsWith("+json");
      }
      function V(e2) {
        const t2 = String(e2).trim();
        return t2.startsWith("{") || t2.startsWith("[");
      }
      const H = /* @__PURE__ */ new Set(["file_status", "file_id", "file_name", "upload_date", "file_phase_2_status", "complete_percentage", "error_reason", "return_url"]);
      function Y(e2, t2 = false) {
        const n2 = String(e2);
        let r2 = 0;
        for (65279 === n2.charCodeAt(0) && (r2 = 1); r2 < n2.length; ) {
          const e3 = n2.charCodeAt(r2);
          if (32 !== e3 && 9 !== e3 && 10 !== e3 && 13 !== e3 && 11 !== e3 && 12 !== e3) {
            if (160 !== e3) break;
            r2 += 1;
          } else r2 += 1;
        }
        return t2 ? n2.slice(r2) : n2.slice(r2, r2 + 2e3);
      }
      const X = 2e3, Q = ["<!doctype html", "<html", "<head", "<body"];
      function ee(e2) {
        const t2 = String(e2), n2 = t2.length - Y(t2, true).length, r2 = t2[n2];
        if ("{" === r2 || "[" === r2) return false;
        const i2 = t2.slice(n2, n2 + X + 1).toLowerCase(), s2 = i2.slice(0, X), a2 = i2.length > X ? i2[2e3] : void 0;
        return Q.some((e3) => (function(e4, t3, n3) {
          let r3 = 0;
          for (; ; ) {
            const i3 = e4.indexOf(t3, r3);
            if (i3 < 0) return false;
            const s3 = i3 + t3.length, a3 = s3 < e4.length ? e4[s3] : n3;
            if (void 0 === a3) return true;
            if (">" === a3 || "/" === a3 || " " === a3 || "	" === a3 || "\n" === a3 || "\r" === a3 || "\v" === a3 || "\f" === a3) return true;
            r3 = i3 + 1;
          }
        })(s2, e3, a2));
      }
      function te(e2) {
        const t2 = String(e2);
        return "<" === t2[t2.length - Y(t2, true).length];
      }
      function ne(e2, t2, n2) {
        const r2 = String(e2);
        if (!r2.trim() || ee(r2) || V(r2)) return null;
        const i2 = r2.length - Y(r2, true).length;
        return n2 >= 400 && "<" !== r2[i2] ? null : String(t2).includes("text/html") ? "ZeroBounce returned an HTML page (text/html) instead of a file." : "ZeroBounce returned an HTML page instead of a file.";
      }
      function re(e2) {
        if ("boolean" == typeof e2) return true;
        if (0 === e2 || 1 === e2) return true;
        if ("string" == typeof e2) {
          const t2 = e2.trim().toLowerCase();
          if ("true" === t2 || "false" === t2 || "0" === t2 || "1" === t2) return true;
        }
        return false;
      }
      function ie(e2) {
        if (false === e2 || 0 === e2) return true;
        if ("string" == typeof e2) {
          const t2 = e2.trim().toLowerCase();
          if ("false" === t2 || "0" === t2) return true;
        }
        return false;
      }
      function se(e2) {
        const t2 = String(e2);
        let n2 = 0;
        const r2 = t2.length, i2 = (e3) => " " === e3 || "	" === e3 || "\n" === e3 || "\r" === e3;
        for (; n2 < r2 && (i2(t2[n2]) || 65279 === t2.charCodeAt(n2)); ) n2 += 1;
        if ("{" !== t2[n2]) return "absent";
        let s2 = "absent", a2 = 0;
        const o2 = (e3) => {
          let n3 = e3 + 1;
          for (; n3 < r2; ) if ("\\" === t2[n3]) n3 += 2;
          else {
            if ('"' === t2[n3]) return n3;
            n3 += 1;
          }
          return r2;
        }, l2 = (e3, t3) => {
          const n3 = e3.trim().toLowerCase();
          if ("true" === n3 || t3 && "1" === n3) return "true";
          if ("false" === n3 || t3 && "0" === n3) return "false";
          if (!t3 && /^-?(0|[1-9][0-9]*)(\.[0-9]+)?(e[+-]?[0-9]+)?$/.test(n3)) {
            const e4 = Number(n3);
            if (Number.isFinite(e4) && 1 === e4) return "true";
            if (Number.isFinite(e4) && 0 === e4) return "false";
          }
          return "notflag";
        };
        for (; n2 < r2; ) {
          const e3 = t2[n2];
          if ("{" === e3 || "[" === e3) a2 += 1;
          else if ("}" === e3 || "]" === e3) a2 -= 1;
          else if ('"' === e3) {
            const e4 = o2(n2);
            let u2 = e4 + 1;
            for (; u2 < r2 && i2(t2[u2]); ) u2 += 1;
            if (1 === a2 && ":" === t2[u2]) {
              let a3;
              try {
                a3 = JSON.parse(t2.slice(n2, e4 + 1));
              } catch {
                a3 = "";
              }
              if ("success" === a3) {
                for (u2 += 1; u2 < r2 && i2(t2[u2]); ) u2 += 1;
                let e5;
                if ('"' === t2[u2]) {
                  const n3 = o2(u2);
                  let r3;
                  try {
                    r3 = JSON.parse(t2.slice(u2, n3 + 1));
                  } catch {
                    r3 = "\0";
                  }
                  e5 = l2(r3, true);
                } else {
                  let n3 = u2;
                  for (; n3 < r2 && !i2(t2[n3]) && "," !== t2[n3] && "}" !== t2[n3] && "]" !== t2[n3]; ) n3 += 1;
                  const s3 = t2.slice(u2, n3);
                  e5 = /^[{\[]/.test(s3) ? "notflag" : l2(s3, false);
                }
                if ("false" === e5) return "false";
                "true" !== e5 && "absent" !== s2 || (s2 = e5);
              }
            }
            n2 = e4;
          }
          n2 += 1;
        }
        return s2;
      }
      function ae(e2, t2, n2) {
        const r2 = t2.length;
        for (let i2 = e2.indexOf("<", n2); i2 >= 0; i2 = e2.indexOf("<", i2 + 1)) {
          if (i2 + r2 > e2.length) return -1;
          let n3 = true;
          for (let s2 = 1; s2 < r2; s2 += 1) {
            let r3 = e2.charCodeAt(i2 + s2);
            if (r3 >= 65 && r3 <= 90 && (r3 += 32), r3 !== t2.charCodeAt(s2)) {
              n3 = false;
              break;
            }
          }
          if (n3) return i2;
        }
        return -1;
      }
      function oe(e2) {
        let t2 = String(e2).trim();
        for (; ; ) if (t2.startsWith("Error:")) t2 = t2.slice(6).trim();
        else {
          if (!t2.startsWith("[Error]:")) return t2;
          t2 = t2.slice(8).trim();
        }
      }
      function le(e2) {
        return /invalid api key|api_key is invalid|ran out of credits|out of credits/i.test(e2);
      }
      function ue(e2, t2 = "absent") {
        if (!e2 || "object" != typeof e2 || Array.isArray(e2)) return null;
        if (Array.isArray(e2.errors)) {
          for (const t3 of e2.errors) if (t3 && "all" === String(t3.email_address || "").toLowerCase()) return oe(("string" == typeof t3.error ? t3.error.trim() : "") || "Invalid API Key or your account ran out of credits");
        }
        const n2 = "absent" === t2 || "notflag" === t2;
        for (const t3 of ["error", "error_message", "Error"]) {
          const r2 = e2[t3];
          if ("string" == typeof r2 && r2.trim() && (n2 || "error_message" !== t3 && le(r2))) return oe(r2.trim()) || r2.trim();
        }
        return null;
      }
      const ce = /* @__PURE__ */ new Set(["error", "message", "error_message", "Message", "Error", "detail"]);
      function de(e2, t2 = null, r2 = "absent") {
        const i2 = (function(e3, t3) {
          if (!e3 || "object" != typeof e3 || Array.isArray(e3)) return null;
          if (!Object.prototype.hasOwnProperty.call(e3, "success")) return e3;
          if ("notflag" !== t3) return null;
          const { success: n2, ...r3 } = e3;
          return r3;
        })(e2, r2);
        if (!i2) return false;
        const s2 = Object.keys(i2);
        return 0 === s2.length || !!s2.every((e3) => ce.has(e3)) || (function(e3, t3) {
          const r3 = (function(e4) {
            const t4 = /* @__PURE__ */ new Set();
            for (const r4 of [].concat(e4 ?? [])) {
              const e5 = n[r4];
              if (e5) for (const n2 of Object.keys(e5)) t4.add(n2);
            }
            return t4;
          })(t3);
          if (!r3.size) return false;
          const i3 = Object.keys(e3);
          return !!i3.some((e4) => ce.has(e4)) && i3.every((t4) => ce.has(t4) || r3.has(t4) && null == e3[t4]);
        })(i2, t2);
      }
      function fe(e2, t2) {
        const n2 = String(e2).trim();
        if (!n2) return `Empty response from ZeroBounce (HTTP ${t2})`;
        if (ee(e2)) {
          const t3 = (function(e3) {
            const t4 = String(e3).slice(0, 65536);
            let n3 = 0;
            for (; ; ) {
              const e4 = ae(t4, "<title", n3);
              if (e4 < 0) return "";
              const r2 = t4[e4 + 6];
              if (">" === r2 || "/" === r2 || " " === r2 || "	" === r2 || "\n" === r2 || "\r" === r2 || "\f" === r2 || "\v" === r2) {
                const n4 = t4.indexOf(">", e4);
                if (n4 < 0) return "";
                const r3 = ae(t4, "</title", n4);
                if (r3 < 0) return "";
                if (r3 - n4 - 1 > 1e3) return "";
                const i2 = t4.slice(n4 + 1, r3).replace(/\s+/g, " ").trim();
                return i2.length > 1e3 ? "" : i2;
              }
              n3 = e4 + 1;
            }
          })(e2);
          return t3 ? `ZeroBounce returned an HTML error page ("${t3}") instead of an API response.` : "ZeroBounce returned an HTML error page instead of an API response.";
        }
        if (n2.startsWith("{") || n2.startsWith("[")) try {
          const e3 = JSON.parse(n2), t3 = (function(e4) {
            return !e4 || "object" != typeof e4 || Array.isArray(e4) || "string" != typeof e4.title ? null : (e4.title.includes("Access denied") || e4.title.includes("1020")) && true === e4.cloudflare_error ? e4.title : null;
          })(e3);
          if (t3) return t3;
          const r2 = ue(e3, se(n2));
          if (r2) return r2;
          const i2 = (function(e4) {
            if (Array.isArray(e4)) {
              const t4 = e4.find((e5) => "string" == typeof e5 && e5.trim());
              return t4 ? t4.trim() : null;
            }
            if (!e4 || "object" != typeof e4) return null;
            for (const t4 of ["error", "message", "error_message", "Message", "Error", "detail"]) {
              const n3 = e4[t4];
              if ("string" == typeof n3 && n3.trim()) return n3.trim();
              if (Array.isArray(n3) && n3.length) {
                const e5 = n3.filter((e6) => "string" == typeof e6 && e6.trim());
                if (e5.length) return e5.join("\n");
                const t5 = n3[0];
                if (t5 && "object" == typeof t5 && t5.msg) {
                  const e6 = Array.isArray(t5.loc) ? t5.loc.slice(1).join(".") : "";
                  return e6 ? `${e6}: ${t5.msg}` : String(t5.msg);
                }
              }
            }
            return null;
          })(e3);
          return i2 ? oe(i2) : "ZeroBounce returned an unexpected response.";
        } catch {
          return "ZeroBounce returned a response that is not valid JSON.";
        }
        return n2.length > 1e3 ? "ZeroBounce returned a response that is not valid JSON." : oe(n2) || `Empty response from ZeroBounce (HTTP ${t2})`;
      }
      const _e = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), Symbol.toStringTag).get;
      function me(e2, t2 = null, n2 = "file") {
        const r2 = "undefined" != typeof Blob && e2 instanceof Blob, i2 = ArrayBuffer.isView(e2) && "Uint8Array" === _e.call(e2);
        if (!r2 && !i2) throw _(`ZeroBounce: ${n2} must be a Blob, a File, a Buffer or a Uint8Array (a file path, a stream or any other value is not accepted).`, 0);
        let s2 = t2;
        null == s2 && r2 && "string" == typeof e2.name && (s2 = e2.name), null == s2 && i2 && (s2 = "file.csv");
        const a2 = i2 ? new Blob([e2]) : e2;
        return null == s2 ? [a2] : [a2, String(s2)];
      }
      const pe = /[\r\n\0]/;
      function he(e2, t2 = []) {
        let n2 = M(`${e2 && e2.name ? e2.name : "Error"}: ${e2 && e2.message ? e2.message : String(e2)}`, t2);
        const r2 = e2 && "object" == typeof e2 ? e2.cause : null;
        if (r2 && "object" == typeof r2) {
          const e3 = "string" == typeof r2.code ? r2.code : "", i2 = "string" == typeof r2.message ? r2.message : "", s2 = [e3, i2 && i2 !== e3 ? i2 : ""].filter(Boolean).join(": ");
          if (s2) {
            const r3 = M(s2, t2);
            r3.length <= 300 ? n2 += ` (${r3})` : n2 += ` (${e3 && e3.length <= 40 ? `${M(e3, t2)}: ` : ""}${ge})`;
          }
        }
        return _(n2, 0);
      }
      const ge = "details omitted: too long", ye = ["api-eu.zerobounce.net", "api-us.zerobounce.net"];
      function be(e2) {
        try {
          return new URL(String(e2)).hostname.toLowerCase();
        } catch {
          return "";
        }
      }
      async function Se(e2) {
        return e2 && "function" == typeof e2.arrayBuffer && "undefined" != typeof TextDecoder ? new TextDecoder("utf-8", { ignoreBOM: true }).decode(await e2.arrayBuffer()) : we(e2);
      }
      async function we(e2) {
        if (e2 && "function" == typeof e2.text) return await e2.text();
        if (e2 && "function" == typeof e2.json) {
          const t2 = await e2.json();
          return "string" == typeof t2 ? t2 : JSON.stringify(t2);
        }
        return "";
      }
      function Re({ params: e2, body: t2, jsonBody: n2, bearerToken: r2 }) {
        const i2 = [r2];
        if (e2 && "object" == typeof e2 && i2.push(e2.api_key), n2 && "object" == typeof n2 && i2.push(n2.api_key), t2 && "object" == typeof t2 && "function" == typeof t2.get) try {
          i2.push(t2.get("api_key"));
        } catch {
        }
        return i2.filter((e3) => "string" == typeof e3 && e3);
      }
      function ve(e2) {
        const t2 = G(e2);
        if (e2 && "opaqueredirect" === e2.type) throw _("ZeroBounce returned a redirect, which this client does not follow.", 0);
        if (t2 >= 300 && t2 < 400) throw _("ZeroBounce returned a redirect, which this client does not follow.", t2);
      }
      async function Ee({ requestType: e2, body: t2 = null, jsonBody: n2 = null, params: r2 = null, path: m2, batch: p2 = false, bulkBase: g2 = "v2", bulkURLs: y2 = null, returnText: b2 = false, scoring: S2 = false, apiBaseURL: w2, baseURL: R2 = null, bearerToken: v2 = null, extraHeaders: E2 = null, secrets: L2 = [], regionalWarningState: U2 = null, messageOnlyExempt: T2 = false, messageFirst: A2 = false, requireFileStatusKnownField: B2 = false, emptyIsSuccess: k2 = false, shape: F2 = "object", fields: P2 = null }) {
        const O2 = (function({ batch: e3, bulkBase: t3, bulkURLs: n3, apiBaseURL: r3, baseURL: i2, path: s2, params: a2 }) {
          const o2 = null != i2 ? i2 : e3 ? (function(e4, t4) {
            const n4 = t4 || { v2: u, root: c };
            return "root" === e4 ? n4.root : n4.v2;
          })(t3, n3) : r3;
          return `${o2}${s2}${null != a2 && Object.keys(a2).length > 0 ? `?${new URLSearchParams(a2)}` : ""}`;
        })({ batch: p2, bulkBase: g2, bulkURLs: y2, apiBaseURL: w2, baseURL: R2, path: m2, params: r2 });
        h(O2, "request URL"), (function(e3) {
          if (e3 && "object" == typeof e3 && "function" == typeof e3.entries && "undefined" != typeof FormData && e3 instanceof FormData) {
            for (const [t3, n3] of e3.entries()) if ("string" == typeof n3) {
              if (pe.test(n3)) throw _(`ZeroBounce: the form field "${String(t3).slice(0, 40)}" must not contain a line break or a NUL character.`, 0);
            } else if (n3 && "string" == typeof n3.name && pe.test(n3.name)) throw _("ZeroBounce: the file name must not contain a line break or a NUL character.", 0);
          }
        })(t2), L2 = [...L2, ...Re({ params: r2, body: t2, jsonBody: n2, bearerToken: v2 })], (function(e3, t3, n3) {
          if (!n3 || n3.warned) return;
          if (!ye.includes(be(t3))) return;
          if ("bulkapi.zerobounce.net" !== be(e3)) return;
          n3.warned = true;
          const r3 = "undefined" != typeof console && console.warn ? console.warn : null;
          r3 && r3("ZeroBounce: a regional base URL is set, but this request goes to bulkapi.zerobounce.net. ZeroBounce documents no regional bulk host.");
        })(O2, w2, U2);
        const j2 = { ...d };
        let I2, C2;
        null != n2 && (j2["Content-Type"] = "application/json"), v2 && (j2.Authorization = `Bearer ${v2}`), E2 && Object.assign(j2, E2);
        try {
          I2 = await fetch(O2, { method: e2, headers: j2, body: null != n2 ? JSON.stringify(n2) : t2, signal: q(), redirect: "manual" });
        } catch (e3) {
          throw he(e3, L2);
        }
        ve(I2);
        try {
          C2 = b2 ? await we(I2) : await Se(I2);
        } catch (e3) {
          throw he(e3, L2);
        }
        if (b2) try {
          return (function(e3, t3, n3, r3 = "download") {
            const i2 = G(t3), s2 = W(t3), a2 = te(e3) || s2.includes("text/html");
            if (a2 || i2 >= 400) throw _((a2 ? ne(e3, s2, i2) : null) || fe(e3, i2), i2);
            if (!String(e3).trim()) throw _(`Empty response from ZeroBounce (HTTP ${i2})`, i2);
            if (J(s2) || V(e3)) throw _(fe(e3, i2), i2);
            if (!K()) return e3;
            const o2 = String(r3);
            return (function(e4, t4) {
              if (!K()) throw new Error("saveFile is only available in browser environments");
              if (window.navigator.msSaveOrOpenBlob) return window.navigator.msSaveOrOpenBlob(e4, t4), t4;
              {
                const n4 = document.createElement("a");
                document.body.appendChild(n4);
                const r4 = window.URL.createObjectURL(e4);
                return n4.href = r4, n4.download = t4, n4.click(), setTimeout(() => {
                  window.URL.revokeObjectURL(r4), document.body.removeChild(n4);
                }, 0), t4;
              }
            })(new Blob([e3], { type: "text/csv" }), `result-${o2}${n3 ? "-scoring" : ""}.csv`);
          })(C2, I2, S2, r2 && null != r2.file_id ? r2.file_id : "download");
        } catch (e3) {
          if (e3 instanceof f) throw _(M(e3.message, L2), e3.statusCode);
          throw e3;
        }
        const x2 = G(I2);
        if (k2 && x2 >= 200 && x2 < 300 && "" === String(C2)) return {};
        const D2 = W(I2);
        if (ee(C2) || D2.includes("text/html") || x2 >= 400 || !String(C2).trim()) throw _(M(fe(C2, x2), L2), x2);
        let $2;
        try {
          $2 = Z(C2);
        } catch (e3) {
          if (e3 instanceof f) throw _(e3.message, x2);
          throw _(M(fe(C2, x2), L2), x2);
        }
        const z2 = se(C2), N2 = ue($2, z2);
        if (N2) throw _(M(N2, L2), x2);
        const Y2 = null != P2 && [].concat(P2).includes("EmailValidationResult") && null !== $2 && "object" == typeof $2 && !Array.isArray($2) && a($2);
        if ("false" === z2) throw _(M(fe(C2, x2), L2), x2);
        if (!(function(e3, t3) {
          const n3 = Array.isArray(e3);
          return "json" === t3 || ("array" === t3 ? n3 : "objectOrArray" === t3 && n3 || null !== e3 && "object" == typeof e3 && !n3);
        })($2, F2)) throw _("ZeroBounce returned JSON of an unexpected shape for this call.", x2);
        const X2 = null !== $2 && "object" == typeof $2 && Object.keys($2).some((e3) => ce.has(e3)), Q2 = () => null != P2 && !Y2 && de($2, P2, z2);
        if ("notflag" === z2 && X2 && !T2 && Q2()) throw _(M(fe(C2, x2), L2), x2);
        if (A2 && X2 && Q2()) throw _(M(fe(C2, x2), L2), x2);
        if (null != P2) {
          $2 = (function(e4) {
            if (!e4 || "object" != typeof e4 || Array.isArray(e4)) return e4;
            if (!Object.prototype.hasOwnProperty.call(e4, "success")) return e4;
            const t3 = e4.success;
            return true === t3 || !re(t3) || ie(t3) ? e4 : { ...e4, success: true };
          })($2), $2 = (function(e4, t3) {
            return s(e4) && Array.isArray(e4.message) && e4.message.every((e5) => "string" == typeof e5) && [].concat(t3 ?? []).some((e5) => l.includes(e5)) ? (e4.message = e4.message.join("\n"), e4) : e4;
          })($2, P2);
          const e3 = (function(e4, t3) {
            return o(e4, [].concat(t3), "");
          })($2, P2);
          if (null !== e3) throw _(e3 ? `${i} (${e3}).` : `${i}.`, x2);
        }
        if (!T2 && Q2()) throw _(M(fe(C2, x2), L2), x2);
        if (B2 && $2 && "object" == typeof $2 && !Array.isArray($2) && !(function(e3) {
          if (!e3 || "object" != typeof e3 || Array.isArray(e3)) return false;
          if (Object.prototype.hasOwnProperty.call(e3, "success")) {
            const t3 = e3.success;
            if (re(t3) && !ie(t3)) return true;
          }
          for (const t3 of H) {
            if (!Object.prototype.hasOwnProperty.call(e3, t3)) continue;
            const n3 = e3[t3];
            if (null != n3 && ("string" != typeof n3 || "" !== n3.trim())) return true;
          }
          return false;
        })($2)) throw _(M(fe(C2, x2), L2), x2);
        return $2;
      }
      function Le() {
        throw new Error("ZeroBounce: Call init function first with a valid api key.");
      }
      function Ue(e2, t2 = "") {
        throw new Error(`ZeroBounce: ${e2} parameter is missing.${t2 ? ` ${t2}` : ""}`);
      }
      function Te(e2, t2 = "") {
        throw new Error(`ZeroBounce: ${e2} parameter is invalid.${t2 ? ` ${t2}` : ""}`);
      }
      const Ae = Object.freeze({ NONE: "", VALID: "valid", INVALID: "invalid", CATCH_ALL: "catch-all", UNKNOWN: "unknown", SPAMTRAP: "spamtrap", ABUSE: "abuse", DO_NOT_MAIL: "do_not_mail" }), Be = Object.freeze({ NONE: "", ANTISPAM_SYSTEM: "antispam_system", GREYLISTED: "greylisted", MAIL_SERVER_TEMPORARY_ERROR: "mail_server_temporary_error", FORCIBLE_DISCONNECT: "forcible_disconnect", MAIL_SERVER_DID_NOT_RESPOND: "mail_server_did_not_respond", TIMEOUT_EXCEEDED: "timeout_exceeded", FAILED_SMTP_CONNECTION: "failed_smtp_connection", MAILBOX_QUOTA_EXCEEDED: "mailbox_quota_exceeded", EXCEPTION_OCCURRED: "exception_occurred", POSSIBLE_TRAP: "possible_trap", ROLE_BASED: "role_based", GLOBAL_SUPPRESSION: "global_suppression", MAILBOX_NOT_FOUND: "mailbox_not_found", NO_DNS_ENTRIES: "no_dns_entries", FAILED_SYNTAX_CHECK: "failed_syntax_check", POSSIBLE_TYPO: "possible_typo", UNROUTABLE_IP_ADDRESS: "unroutable_ip_address", LEADING_PERIOD_REMOVED: "leading_period_removed", DOES_NOT_ACCEPT_MAIL: "does_not_accept_mail", ALIAS_ADDRESS: "alias_address", ROLE_BASED_CATCH_ALL: "role_based_catch_all", DISPOSABLE: "disposable", TOXIC: "toxic", ALTERNATE: "alternate", MX_FORWARD: "mx_forward", BLOCKED: "blocked", ALLOWED: "allowed", ACCEPT_ALL: "accept_all", ROLE_BASED_ACCEPT_ALL: "role_based_accept_all", GOLD: "gold", AI_AGENT_MAILBOX: "ai_agent_mailbox" }), ke = Object.freeze({ PHASE_1: "phase_1", PHASE_2: "phase_2", COMBINED: "combined" });
      function Fe(e2) {
        return null == e2 || "string" == typeof e2 && "" === e2.trim();
      }
      function Pe(e2) {
        return e2 ? "true" : "false";
      }
      function Oe(e2, t2, n2) {
        return Pe(null == e2 && void 0 !== n2 ? n2 : b(e2, t2));
      }
      function je(e2) {
        return e2 || null;
      }
      function Ie(e2) {
        return e2 instanceof Date && !Number.isNaN(e2.getTime()) ? e2.toISOString().slice(0, 10) : e2;
      }
      const Ce = ["EmailScoringResult", "EmailScoringError"], xe = ["BulkSendFileSuccessResponse", "BulkSendFileErrorResponse"], De = ["FilterListItem[]", "FilterMessageResponse"], $e = ["allow", "block"], ze = ["email", "domain", "mx", "tld"];
      function Ne(e2) {
        return "number" == typeof e2 ? Number.isInteger(e2) ? e2 : null : "string" == typeof e2 && /^[0-9]{1,9}$/.test(e2) ? Number(e2) : null;
      }
      class Me {
        static ApiURL = Object.freeze({ DEFAULT_API_URL: "https://api.zerobounce.net/v2", USA_API_URL: "https://api-us.zerobounce.net/v2", EU_API_URL: "https://api-eu.zerobounce.net/v2" });
        static ZBValidateStatus = Ae;
        static ZBValidateSubStatus = Be;
        static ZBDownloadType = ke;
        static ListEvaluatorURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/v2/listevaluator" });
        static InboxPlacementURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/api/ipt" });
        static EmailFinderURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/email-finder" });
        static DomainSearchURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/domain-search" });
        #e = null;
        constructor() {
          this._initialized = false, this._api_base_url = Me.ApiURL.DEFAULT_API_URL, this._list_evaluator_base_url = Me.ListEvaluatorURL.DEFAULT_URL, this._inbox_placement_base_url = Me.InboxPlacementURL.DEFAULT_URL, this._email_finder_base_url = Me.EmailFinderURL.DEFAULT_URL, this._domain_search_base_url = Me.DomainSearchURL.DEFAULT_URL, this._bulk_urls = { v2: u, root: c }, this._regional_warning = { warned: false };
        }
        [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")](e2, t2, n2) {
          return `ZeroBounceSDK ${n2({ ...this, api_key: null == this.#e ? null : "***" }, t2)}`;
        }
        init(e2, t2 = Me.ApiURL.DEFAULT_API_URL, n2 = null) {
          if (null == e2 || "" === String(e2).trim()) throw new Error("ZeroBounce: Api key parameter is missing. Please provide a valid API key.");
          w(e2, "Api key");
          const r2 = y(t2, "apiBaseURL"), { listEvaluatorBaseURL: i2, inboxPlacementBaseURL: s2, emailFinderBaseURL: a2, domainSearchBaseURL: o2, bulkBaseURL: l2, bulkRootBaseURL: d2 } = n2 || {}, f2 = y(i2 ?? Me.ListEvaluatorURL.DEFAULT_URL, "listEvaluatorBaseURL"), _2 = y(s2 ?? Me.InboxPlacementURL.DEFAULT_URL, "inboxPlacementBaseURL"), m2 = y(a2 ?? Me.EmailFinderURL.DEFAULT_URL, "emailFinderBaseURL"), p2 = y(o2 ?? Me.DomainSearchURL.DEFAULT_URL, "domainSearchBaseURL"), h2 = y(l2 ?? u, "bulkBaseURL"), g2 = y(d2 ?? c, "bulkRootBaseURL");
          this.#e = e2, this._bulk_urls = { v2: h2, root: g2 }, this._api_base_url = r2, this._list_evaluator_base_url = f2, this._inbox_placement_base_url = _2, this._email_finder_base_url = m2, this._domain_search_base_url = p2, this._regional_warning = { warned: false }, this._initialized = true;
        }
        async getCredits() {
          if (!this._initialized) return void Le();
          const e2 = { api_key: this.#e }, t2 = await Ee({ requestType: "GET", params: e2, path: "/getcredits", apiBaseURL: this._api_base_url, fields: "GetCreditsResponse", messageFirst: true });
          return "number" == typeof t2.Credits && (t2.Credits = String(t2.Credits)), t2;
        }
        async validateEmail(e2, t2 = null) {
          if (!this._initialized) return void Le();
          if (Fe(e2)) return void Ue("Email");
          let n2, r2, i2, s2, a2, o2, l2;
          if ("string" == typeof t2 ? n2 = t2 : t2 && "object" == typeof t2 && (n2 = t2.ip_address, r2 = t2.timeout, i2 = t2.activityData, s2 = t2.verifyPlus, a2 = t2.domainInfo, o2 = t2.greylistProcessing, l2 = t2.callbackUrl), null != r2 && (r2 = Ne(r2), null == r2 || r2 < 3 || r2 > 60)) return void Te("timeout", "Must be a whole number between 3 and 60 seconds.");
          const u2 = {};
          if (null != i2 && (u2.activity_data = Oe(i2, "activityData")), null != s2 && (u2.verify_plus = Oe(s2, "verifyPlus")), null != a2 && (u2.domain_info = Oe(a2, "domainInfo")), null != o2 && (u2.greylist_processing = Oe(o2, "greylistProcessing")), null != l2 && "true" !== u2.greylist_processing) return void Te("callbackUrl", "Requires greylistProcessing: true.");
          if (null != l2 && "" === String(l2).trim()) return void Ue("callbackUrl");
          const c2 = { api_key: this.#e, email: e2 };
          return null != n2 && (c2.ip_address = n2), null != r2 && (c2.timeout = r2), Object.assign(c2, u2), null != l2 && (c2.callback_url = l2), (d2 = t2 && "object" == typeof t2 && "POST" === t2.method ? await Ee({ requestType: "POST", path: "/validate", fields: "EmailValidationResult", body: new URLSearchParams(c2), params: {}, apiBaseURL: this._api_base_url }) : await Ee({ requestType: "GET", params: c2, path: "/validate", apiBaseURL: this._api_base_url, fields: "EmailValidationResult" })) && "object" == typeof d2 && !Array.isArray(d2) && void 0 === d2.message && "string" == typeof d2.Message && (d2.message = d2.Message), d2;
          var d2;
        }
        async getApiUsage(e2, t2) {
          if (this._initialized) if (Fe(e2)) Ue("Start date", "Format: YYYY-MM-DD");
          else {
            if (!Fe(t2)) return Ee({ requestType: "GET", params: { api_key: this.#e, start_date: Ie(e2), end_date: Ie(t2) }, path: "/getapiusage", fields: "ApiUsageResponse", apiBaseURL: this._api_base_url });
            Ue("End date", "Format: YYYY-MM-DD");
          }
          else Le();
        }
        async validateBatch(e2, t2 = null) {
          if (!this._initialized) return void Le();
          if (null == e2) return void Ue("Email list");
          let n2, r2, i2;
          if (t2 && "object" == typeof t2 && (n2 = t2.timeout, r2 = t2.activityData, i2 = t2.verifyPlus), null != n2 && (n2 = Ne(n2), null == n2 || n2 < 10 || n2 > 120)) return void Te("timeout", "Must be a whole number between 10 and 120 seconds.");
          const s2 = { api_key: this.#e, email_batch: e2 };
          return null != n2 && (s2.timeout = String(n2)), null != r2 && (s2.activity_data = b(r2, "activityData")), null != i2 && (s2.verify_plus = b(i2, "verifyPlus")), Ee({ requestType: "POST", path: "/validatebatch", fields: "ValidateBatchResponse", jsonBody: s2, apiBaseURL: this._api_base_url });
        }
        async getEmailActivity(e2) {
          if (this._initialized) {
            if (!Fe(e2)) return Ee({ requestType: "GET", params: { api_key: this.#e, email: e2 }, path: "/activity", fields: "EmailActivityResponse", apiBaseURL: this._api_base_url });
            Ue("Email");
          } else Le();
        }
        async scoreEmail(e2, t2 = null) {
          if (!this._initialized) return void Le();
          if (Fe(e2)) return void Ue("Email");
          const n2 = { api_key: this.#e, email: e2 };
          return Ee(t2 && "object" == typeof t2 && "POST" === t2.method ? { requestType: "POST", path: "/scoring", fields: Ce, body: new URLSearchParams(n2), params: {}, apiBaseURL: this._api_base_url } : { requestType: "GET", params: n2, path: "/scoring", fields: Ce, apiBaseURL: this._api_base_url });
        }
        async sendFile({ file: e2, email_address_column: t2, first_name_column: n2 = false, return_url: r2 = false, last_name_column: i2 = false, gender_column: s2 = false, ip_address_column: a2 = false, has_header_row: o2 = false, remove_duplicate: l2 = false, allowPhase2: u2 = null }) {
          if (!this._initialized) return void Le();
          if (!e2) return void Ue("file");
          if (Fe(t2)) return void Ue("email_address_column");
          const c2 = new FormData();
          return r2 && c2.append("return_url", r2), n2 && c2.append("first_name_column", n2), i2 && c2.append("last_name_column", i2), s2 && c2.append("gender_column", s2), a2 && c2.append("ip_address_column", a2), c2.append("email_address_column", t2), c2.append("file", ...me(e2)), c2.append("has_header_row", Oe(o2, "has_header_row", false)), c2.append("remove_duplicate", Oe(l2, "remove_duplicate", false)), c2.append("api_key", this.#e), null != u2 && c2.append("allow_phase_2", Oe(u2, "allowPhase2")), Ee({ requestType: "POST", path: "/sendfile", fields: xe, body: c2, batch: true, bulkURLs: this._bulk_urls, apiBaseURL: this._api_base_url });
        }
        async sendFileStream(e2, t2, { email_address_column: n2, first_name_column: r2 = false, return_url: i2 = false, last_name_column: s2 = false, gender_column: a2 = false, ip_address_column: o2 = false, has_header_row: l2 = false, remove_duplicate: u2 = false, allowPhase2: c2 = null } = {}) {
          if (!this._initialized) return void Le();
          if (!e2) return void Ue("fileStreamOrBlob");
          if (Fe(t2)) return void Ue("fileName");
          if (Fe(n2)) return void Ue("email_address_column");
          const d2 = new FormData();
          return i2 && d2.append("return_url", i2), r2 && d2.append("first_name_column", r2), s2 && d2.append("last_name_column", s2), a2 && d2.append("gender_column", a2), o2 && d2.append("ip_address_column", o2), d2.append("email_address_column", n2), d2.append("file", ...me(e2, t2, "fileStreamOrBlob")), d2.append("has_header_row", Oe(l2, "has_header_row", false)), d2.append("remove_duplicate", Oe(u2, "remove_duplicate", false)), d2.append("api_key", this.#e), null != c2 && d2.append("allow_phase_2", Oe(c2, "allowPhase2")), Ee({ requestType: "POST", path: "/sendfile", fields: xe, body: d2, batch: true, bulkURLs: this._bulk_urls, apiBaseURL: this._api_base_url });
        }
        async sendScoringFile({ file: e2, email_address_column: t2, return_url: n2 = false, has_header_row: r2 = false, remove_duplicate: i2 = false }) {
          if (!this._initialized) return void Le();
          if (!e2) return void Ue("file: File");
          if (Fe(t2)) return void Ue("email_address_column: number");
          const s2 = new FormData();
          return n2 && s2.append("return_url", n2), s2.append("file", ...me(e2)), s2.append("email_address_column", t2), s2.append("has_header_row", Oe(r2, "has_header_row", false)), s2.append("api_key", this.#e), s2.append("remove_duplicate", Oe(i2, "remove_duplicate", false)), Ee({ requestType: "POST", path: "/scoring/sendfile", fields: xe, body: s2, batch: true, bulkURLs: this._bulk_urls, apiBaseURL: this._api_base_url });
        }
        async sendScoringFileStream(e2, t2, { email_address_column: n2, return_url: r2 = false, has_header_row: i2 = false, remove_duplicate: s2 = false } = {}) {
          if (!this._initialized) return void Le();
          if (!e2) return void Ue("fileStreamOrBlob");
          if (Fe(t2)) return void Ue("fileName");
          if (Fe(n2)) return void Ue("email_address_column");
          const a2 = new FormData();
          return r2 && a2.append("return_url", r2), a2.append("file", ...me(e2, t2, "fileStreamOrBlob")), a2.append("email_address_column", n2), a2.append("has_header_row", Oe(i2, "has_header_row", false)), a2.append("api_key", this.#e), a2.append("remove_duplicate", Oe(s2, "remove_duplicate", false)), Ee({ requestType: "POST", path: "/scoring/sendfile", fields: xe, body: a2, batch: true, bulkURLs: this._bulk_urls, apiBaseURL: this._api_base_url });
        }
        async _getStatusUtil(e2, t2, { bulkRoot: n2 = false, baseURL: r2 = null, fields: i2 = "ValidationFileStatusResponse" } = {}) {
          if (this._initialized) {
            if (!Fe(e2)) return Ee({ requestType: "GET", params: { api_key: this.#e, file_id: e2 }, path: t2, batch: true, bulkURLs: this._bulk_urls, bulkBase: n2 ? "root" : "v2", apiBaseURL: this._api_base_url, baseURL: r2, fields: i2, requireFileStatusKnownField: true });
            Ue("File id");
          } else Le();
        }
        async _sendBulkRootFormPost(e2, t2) {
          const n2 = { api_key: this.#e, ...t2 };
          return Ee({ requestType: "POST", path: e2, fields: "S3BulkJobResponse", body: new URLSearchParams(n2), params: {}, batch: true, bulkURLs: this._bulk_urls, bulkBase: "root", apiBaseURL: this._api_base_url });
        }
        async getFileStatus(e2) {
          return this._getStatusUtil(e2, "/filestatus");
        }
        async getScoringFileStatus(e2) {
          return this._getStatusUtil(e2, "/scoring/filestatus", { fields: "ScoringFileStatusResponse" });
        }
        async _getFileUtil(e2, t2, n2 = false, r2 = null, { bulkRoot: i2 = false, baseURL: s2 = null } = {}) {
          if (!this._initialized) return void Le();
          if (Fe(e2)) return void Ue("File id");
          const a2 = { api_key: this.#e, file_id: e2 };
          return null != r2 && "object" == typeof r2 && (null != r2.downloadType && (a2.download_type = r2.downloadType), n2 || null == r2.activityData || (a2.activity_data = Oe(r2.activityData, "activityData"))), Ee({ requestType: "GET", params: a2, path: t2, batch: true, bulkURLs: this._bulk_urls, bulkBase: i2 ? "root" : "v2", returnText: true, scoring: n2, apiBaseURL: this._api_base_url, baseURL: s2 });
        }
        async getFile(e2, t2 = null) {
          return this._getFileUtil(e2, "/getfile", false, t2);
        }
        async getScoringFile(e2, t2 = null) {
          return this._getFileUtil(e2, "/scoring/getfile", true, t2);
        }
        async _deleteFileUtil(e2, t2, n2 = false, { bulkRoot: r2 = false, baseURL: i2 = null } = {}) {
          if (this._initialized) {
            if (!Fe(e2)) return Ee({ requestType: "GET", params: { api_key: this.#e, file_id: e2 }, path: t2, batch: true, bulkURLs: this._bulk_urls, bulkBase: r2 ? "root" : "v2", scoring: n2, apiBaseURL: this._api_base_url, baseURL: i2, fields: "BulkFileDeletedResponse" });
            Ue("File id");
          } else Le();
        }
        async _sendBulkRootMultipartFile(e2, { file: t2, fileName: n2 = null, fields: r2 = {}, baseURL: i2 = null }) {
          const s2 = new FormData();
          for (const [e3, t3] of Object.entries(r2)) null != t3 && s2.append(e3, "boolean" == typeof t3 ? Pe(t3) : t3);
          return s2.append("file", ...me(t2, n2)), s2.append("api_key", this.#e), Ee({ requestType: "POST", path: e2, fields: xe, body: s2, batch: true, bulkURLs: this._bulk_urls, bulkBase: "root", apiBaseURL: this._api_base_url, baseURL: i2 });
        }
        async deleteFile(e2) {
          return this._deleteFileUtil(e2, "/deletefile");
        }
        async deleteScoringFile(e2) {
          return this._deleteFileUtil(e2, "/scoring/deletefile", true);
        }
        async sendEmailFinderFile({ file: e2, domain_column: t2, first_name_column: n2 = false, last_name_column: r2 = false, middle_name_column: i2 = false, full_name_column: s2 = false, has_header_row: a2 = false }) {
          if (this._initialized) if (e2) if (Fe(t2)) Ue("domain_column");
          else {
            if (n2 || s2) return this._sendBulkRootMultipartFile("/sendfile", { file: e2, baseURL: this._email_finder_base_url, fields: { domain_column: t2, first_name_column: je(n2), last_name_column: je(r2), middle_name_column: je(i2), full_name_column: je(s2), has_header_row: Oe(a2, "has_header_row", false) } });
            Ue("first_name_column", "Send first_name_column or full_name_column.");
          }
          else Ue("file");
          else Le();
        }
        async sendEmailFinderFileStream(e2, t2, { domain_column: n2, first_name_column: r2 = false, last_name_column: i2 = false, middle_name_column: s2 = false, full_name_column: a2 = false, has_header_row: o2 = false } = {}) {
          if (this._initialized) if (e2) if (Fe(t2)) Ue("fileName");
          else if (Fe(n2)) Ue("domain_column");
          else {
            if (r2 || a2) return this._sendBulkRootMultipartFile("/sendfile", { file: e2, fileName: t2, baseURL: this._email_finder_base_url, fields: { domain_column: n2, first_name_column: je(r2), last_name_column: je(i2), middle_name_column: je(s2), full_name_column: je(a2), has_header_row: Oe(o2, "has_header_row", false) } });
            Ue("first_name_column", "Send first_name_column or full_name_column.");
          }
          else Ue("fileStreamOrBlob");
          else Le();
        }
        async getEmailFinderFileStatus(e2) {
          return this._getStatusUtil(e2, "/filestatus", { bulkRoot: true, baseURL: this._email_finder_base_url });
        }
        async getEmailFinderFile(e2) {
          return this._getFileUtil(e2, "/getfile", false, null, { bulkRoot: true, baseURL: this._email_finder_base_url });
        }
        async deleteEmailFinderFile(e2) {
          return this._deleteFileUtil(e2, "/deletefile", false, { bulkRoot: true, baseURL: this._email_finder_base_url });
        }
        async sendDomainSearchFile({ file: e2, domain_column: t2, has_header_row: n2 = false }) {
          if (this._initialized) if (e2) {
            if (!Fe(t2)) return this._sendBulkRootMultipartFile("/sendfile", { file: e2, baseURL: this._domain_search_base_url, fields: { domain_column: t2, has_header_row: Oe(n2, "has_header_row", false) } });
            Ue("domain_column");
          } else Ue("file");
          else Le();
        }
        async sendDomainSearchFileStream(e2, t2, { domain_column: n2, has_header_row: r2 = false } = {}) {
          if (this._initialized) if (e2) if (Fe(t2)) Ue("fileName");
          else {
            if (!Fe(n2)) return this._sendBulkRootMultipartFile("/sendfile", { file: e2, fileName: t2, baseURL: this._domain_search_base_url, fields: { domain_column: n2, has_header_row: Oe(r2, "has_header_row", false) } });
            Ue("domain_column");
          }
          else Ue("fileStreamOrBlob");
          else Le();
        }
        async getDomainSearchFileStatus(e2) {
          return this._getStatusUtil(e2, "/filestatus", { bulkRoot: true, baseURL: this._domain_search_base_url });
        }
        async getDomainSearchFile(e2) {
          return this._getFileUtil(e2, "/getfile", false, null, { bulkRoot: true, baseURL: this._domain_search_base_url });
        }
        async deleteDomainSearchFile(e2) {
          return this._deleteFileUtil(e2, "/deletefile", false, { bulkRoot: true, baseURL: this._domain_search_base_url });
        }
        async sendListEvaluatorFile({ file: e2, email_address_column: t2 }) {
          if (!this._initialized) return void Le();
          if (!e2) return void Ue("file");
          if (Fe(t2)) return void Ue("email_address_column");
          const n2 = new FormData();
          return n2.append("file", ...me(e2)), n2.append("email_address_column", t2), n2.append("api_key", this.#e), Ee({ requestType: "POST", path: "/", fields: "ListEvaluatorSubmitResponse", body: n2, apiBaseURL: this._list_evaluator_base_url });
        }
        async sendListEvaluatorFileStream(e2, t2, { email_address_column: n2 } = {}) {
          if (!this._initialized) return void Le();
          if (!e2) return void Ue("fileStreamOrBlob");
          if (Fe(t2)) return void Ue("fileName");
          if (Fe(n2)) return void Ue("email_address_column");
          const r2 = new FormData();
          return r2.append("file", ...me(e2, t2, "fileStreamOrBlob")), r2.append("email_address_column", n2), r2.append("api_key", this.#e), Ee({ requestType: "POST", path: "/", fields: "ListEvaluatorSubmitResponse", body: r2, apiBaseURL: this._list_evaluator_base_url });
        }
        async getListEvaluatorResult(e2) {
          if (this._initialized) {
            if (!Fe(e2)) return Ee({ requestType: "GET", params: { api_key: this.#e }, path: `/${encodeURIComponent(e2)}/`, fields: "ListEvaluatorResultResponse", apiBaseURL: this._list_evaluator_base_url, messageOnlyExempt: true });
            Ue("File id");
          } else Le();
        }
        async sendEvaluatedFile(e2) {
          if (!this._initialized) return void Le();
          const t2 = "object" == typeof e2 && null !== e2 ? e2.file_id : e2;
          if (Fe(t2)) return void Ue("File id");
          const n2 = new FormData();
          return n2.append("api_key", this.#e), n2.append("file_id", String(t2)), Ee({ requestType: "POST", path: "/send-evaluated-file/", fields: "ListEvaluatorSubmitResponse", body: n2, batch: true, bulkURLs: this._bulk_urls, secrets: [this.#e], apiBaseURL: this._api_base_url, regionalWarningState: this._regional_warning });
        }
        async addFilter({ rule: e2, target: t2, value: n2 }) {
          if (!this._initialized) return void Le();
          if (Fe(e2)) return void Ue("rule");
          if (!$e.includes(e2)) return void Te("rule", `Must be one of ${$e.join(", ")}.`);
          if (Fe(t2)) return void Ue("target");
          if (!ze.includes(t2)) return void Te("target", `Must be one of ${ze.join(", ")}.`);
          if (Fe(n2)) return void Ue("value");
          const r2 = { api_key: this.#e, rule: e2, target: t2, value: n2 };
          return Ee({ requestType: "POST", path: "/filters/add", fields: "FilterMessageResponse", body: new URLSearchParams(r2), params: {}, apiBaseURL: this._api_base_url, messageOnlyExempt: true });
        }
        async listFilters(e2 = null) {
          if (!this._initialized) return void Le();
          const t2 = { api_key: this.#e };
          return Ee(e2 && "object" == typeof e2 && "POST" === e2.method ? { requestType: "POST", path: "/filters/list", fields: De, body: new URLSearchParams(t2), params: {}, apiBaseURL: this._api_base_url, shape: "objectOrArray", messageOnlyExempt: true } : { requestType: "GET", params: t2, path: "/filters/list", fields: De, apiBaseURL: this._api_base_url, shape: "objectOrArray", messageOnlyExempt: true });
        }
        async deleteFilter({ rule: e2, target: t2, value: n2 }) {
          if (!this._initialized) return void Le();
          if (Fe(e2)) return void Ue("rule");
          if (!$e.includes(e2)) return void Te("rule", `Must be one of ${$e.join(", ")}.`);
          if (Fe(t2)) return void Ue("target");
          if (!ze.includes(t2)) return void Te("target", `Must be one of ${ze.join(", ")}.`);
          if (Fe(n2)) return void Ue("value");
          const r2 = { api_key: this.#e, rule: e2, target: t2, value: n2 };
          return Ee({ requestType: "POST", path: "/filters/delete", fields: "FilterMessageResponse", body: new URLSearchParams(r2), params: {}, apiBaseURL: this._api_base_url, messageOnlyExempt: true });
        }
        async listS3files({ bucket: e2 = null, search: t2 = null } = {}) {
          if (!this._initialized) return void Le();
          const n2 = { api_key: this.#e };
          return null != e2 && (n2.bucket = e2), null != t2 && (n2.search = t2), Ee({ requestType: "GET", params: n2, path: "/listS3files", fields: "S3ListFileEntry[]", batch: true, bulkURLs: this._bulk_urls, bulkBase: "root", apiBaseURL: this._api_base_url, shape: "array" });
        }
        async validateS3file(e2) {
          return this._bulkRootFileJob("/validateS3file", e2 || {});
        }
        async scoreS3file(e2) {
          return this._bulkRootFileJob("/scoreS3file", e2 || {});
        }
        async exportS3file({ file_id: e2, export_bucket: t2 = null } = {}) {
          if (!this._initialized) return void Le();
          if (Fe(e2)) return void Ue("file_id");
          if (null != t2 && "" === String(t2).trim()) return void Ue("export_bucket");
          const n2 = { file_id: e2 };
          return null != t2 && (n2.export_bucket = t2), this._sendBulkRootFormPost("/exportS3file", n2);
        }
        async _bulkRootFileJob(e2, { file_name: t2, has_header_row: n2, remove_duplicates: r2, return_url: i2 }) {
          if (!this._initialized) return void Le();
          if (Fe(t2) || "" === String(t2).trim()) return void Ue("file_name");
          if (null == n2) return void Ue("has_header_row");
          if (Fe(i2) || "" === String(i2).trim()) return void Ue("return_url", "The API rejects a job without it.");
          const s2 = { file_name: t2, has_header_row: Oe(n2, "has_header_row"), return_url: i2 };
          return null != r2 && (s2.remove_duplicates = Oe(r2, "remove_duplicates")), this._sendBulkRootFormPost(e2, s2);
        }
        async emailFinderS3file(e2) {
          return this._bulkRootFileJob("/emailFinderS3file", e2 || {});
        }
        async domainSearchS3file(e2) {
          return this._bulkRootFileJob("/domainSearchS3file", e2 || {});
        }
        async validateSFTPfile(e2) {
          return this._bulkRootFileJob("/validateSFTPfile", e2 || {});
        }
        async scoreSFTPfile(e2) {
          return this._bulkRootFileJob("/scoreSFTPfile", e2 || {});
        }
        async emailFinderSFTPfile(e2) {
          return this._bulkRootFileJob("/emailFinderSFTPfile", e2 || {});
        }
        async domainSearchSFTPfile(e2) {
          return this._bulkRootFileJob("/domainSearchSFTPfile", e2 || {});
        }
        async exportSFTPfile({ file_id: e2, export_path: t2 = null } = {}) {
          if (!this._initialized) return void Le();
          if (Fe(e2)) return void Ue("file_id");
          if (null != t2 && "" === String(t2).trim()) return void Ue("export_path");
          const n2 = { file_id: e2 };
          return null != t2 && (n2.export_path = t2), this._sendBulkRootFormPost("/exportSFTPfile", n2);
        }
        _iptRequest(e2, t2, { params: n2 = null, jsonBody: r2 = null, emptyIsSuccess: i2 = false, shape: s2 = "object", fields: a2 = null } = {}) {
          return Ee({ requestType: e2, path: t2, params: n2, jsonBody: r2, emptyIsSuccess: i2, shape: s2, fields: a2, bearerToken: this.#e, secrets: [this.#e], apiBaseURL: this._api_base_url, baseURL: this._inbox_placement_base_url, regionalWarningState: this._regional_warning, messageOnlyExempt: true });
        }
        async getInboxPlacementProviders() {
          if (this._initialized) return this._iptRequest("GET", "/providers", { fields: "InboxPlacementProvidersResponse" });
          Le();
        }
        async getInboxPlacementTestTypes() {
          if (this._initialized) return this._iptRequest("GET", "/test-types", { shape: "json" });
          Le();
        }
        async createInboxPlacementTest({ name: e2, testType: t2 = null, senderEmail: n2 = null, providerIds: r2 = null, seedIds: i2 = null, providers: s2 = null, webhookUrl: a2 = null } = {}) {
          if (!this._initialized) return void Le();
          if (Fe(e2)) return void Ue("name");
          if (String(e2).length > 64) return void Te("name", "Must be at most 64 characters.");
          if (null != t2 && ![1, 2, 3].includes(t2)) return void Te("testType", "Must be 1, 2 or 3.");
          if (1 === t2 && Fe(n2)) return void Ue("senderEmail", "Required when testType is 1.");
          for (const e3 of s2 || []) {
            if (!e3 || "object" != typeof e3 || null == e3.id) return void Te("providers", "Each entry needs an id.");
            if (null != e3.maxSeeds && e3.maxSeeds < 1) return void Te("providers", "maxSeeds must be at least 1.");
          }
          const o2 = { name: e2 };
          return null != t2 && (o2.testType = t2), null != n2 && (o2.senderEmail = n2), null != r2 && (o2.providerIds = r2), null != i2 && (o2.seedIds = i2), null != s2 && (o2.providers = s2), null != a2 && (o2.webhookUrl = a2), this._iptRequest("POST", "/test", { jsonBody: o2, fields: "InboxPlacementTestCreated" });
        }
        async getInboxPlacementTest(e2) {
          if (this._initialized) {
            if (!Fe(e2)) return this._iptRequest("GET", `/test/${encodeURIComponent(String(e2).trim())}`, { fields: "InboxPlacementTestResult" });
            Ue("testId");
          } else Le();
        }
        async listInboxPlacementTests({ status: e2 = null, createdAfter: t2 = null, createdBefore: n2 = null, page: r2 = null, pageSize: i2 = null } = {}) {
          if (!this._initialized) return void Le();
          if (null != e2 && !["running", "finished"].includes(e2)) return void Te("status", "Must be running or finished.");
          if (null != r2 && r2 < 1) return void Te("page", "Must be at least 1.");
          if (null != i2 && (i2 < 1 || i2 > 100)) return void Te("pageSize", "Must be between 1 and 100.");
          const s2 = {};
          return null != e2 && (s2.status = e2), null != t2 && (s2.createdAfter = t2), null != n2 && (s2.createdBefore = n2), null != r2 && (s2.page = r2), null != i2 && (s2.page_size = i2), this._iptRequest("GET", "/tests", { params: s2, shape: "json" });
        }
        async deleteInboxPlacementTest(e2) {
          if (this._initialized) {
            if (!Fe(e2)) return this._iptRequest("DELETE", `/test/${encodeURIComponent(String(e2).trim())}`, { emptyIsSuccess: true, fields: "InboxPlacementTestDeleted" });
            Ue("testId");
          } else Le();
        }
        async getInboxPlacementWebhook() {
          if (this._initialized) return this._iptRequest("GET", "/webhook", { fields: "InboxPlacementWebhookResponse" });
          Le();
        }
        async setInboxPlacementWebhook(e2) {
          if (this._initialized) {
            if (!Fe(e2)) return this._iptRequest("PUT", "/webhook", { jsonBody: { webhookUrl: e2 }, shape: "json" });
            Ue("webhookUrl");
          } else Le();
        }
        async findEmailByDomain({ domain: e2, first_name: t2, middle_name: n2 = null, last_name: r2 = null }) {
          return this._findEmail({ domain: e2, first_name: t2, middle_name: n2, last_name: r2 });
        }
        async findEmailByCompanyName({ company_name: e2, first_name: t2, middle_name: n2 = null, last_name: r2 = null }) {
          return this._findEmail({ company_name: e2, first_name: t2, middle_name: n2, last_name: r2 });
        }
        async _findEmail({ domain: e2 = null, company_name: t2 = null, first_name: n2 = null, middle_name: r2 = null, last_name: i2 = null }) {
          if (!this._initialized) return void Le();
          if (Fe(e2) && Fe(t2)) return Ue("domain"), void Ue("company_name");
          const s2 = { api_key: this.#e };
          return Fe(n2) || (s2.first_name = n2), Fe(r2) || (s2.middle_name = r2), Fe(i2) || (s2.last_name = i2), null != e2 ? s2.domain = e2 : null != t2 && (s2.company_name = t2), Ee({ requestType: "GET", params: s2, path: "/guessformat", fields: "EmailFinderResponse", apiBaseURL: this._api_base_url });
        }
        async findEmailFormatByDomain({ domain: e2 }) {
          return this._findEmailFormat({ domain: e2 });
        }
        async findEmailFormatByCompanyName({ company_name: e2 }) {
          return this._findEmailFormat({ company_name: e2 });
        }
        async _findEmailFormat({ domain: e2 = null, company_name: t2 = null }) {
          if (!this._initialized) return void Le();
          if (Fe(e2) && Fe(t2)) return Ue("domain"), void Ue("company_name");
          const n2 = { api_key: this.#e };
          return null != e2 ? n2.domain = e2 : null != t2 && (n2.company_name = t2), Ee({ requestType: "GET", params: n2, path: "/guessformat", fields: "DomainFormatResponse", apiBaseURL: this._api_base_url });
        }
        async guessFormat({ domain: e2, first_name: t2 = null, middle_name: n2 = null, last_name: r2 = null }) {
          if (console.warn("guessFormat() is deprecated. Use findEmail for Email Finder API, or findEmailFormat for Domain Search API."), !this._initialized) return void Le();
          if (Fe(e2)) return void Ue("domain");
          const i2 = { api_key: this.#e, domain: e2 };
          return Fe(t2) || (i2.first_name = t2), Fe(n2) || (i2.middle_name = n2), Fe(r2) || (i2.last_name = r2), Ee({ requestType: "GET", params: i2, path: "/guessformat", fields: ["EmailFinderResponse", "DomainFormatResponse"], apiBaseURL: this._api_base_url });
        }
      }
      const Ze = "https://warmup-api.zerobounce.net", qe = ["self_managed", "zb_managed"], Ke = ["transactional", "newsletter", "marketing"], Ge = [0, 4], We = [0, 8], Je = /^[A-Za-z0-9.\-_@+]*$/, Ve = /^\d{4}-\d{2}-\d{2}$/;
      function He(e2) {
        return new Error(`ZeroBounce: ${e2}`);
      }
      function Ye(e2, t2) {
        if (null == e2 || !String(e2).trim()) throw He(`${t2} parameter is missing.`);
        return e2;
      }
      function Xe(e2, [t2, n2], r2) {
        if ("number" != typeof e2 || !Number.isInteger(e2) || e2 < t2 || e2 > n2) throw He(`${r2} parameter is invalid. Must be ${t2} to ${n2}.`);
        return e2;
      }
      function Qe(e2, t2) {
        if (e2 instanceof Date) return e2.toISOString().slice(0, 10);
        if ("string" != typeof e2 || !Ve.test(e2)) throw He(`${t2} parameter is invalid. Expected YYYY-MM-DD.`);
        return e2;
      }
      function et() {
        if ("undefined" != typeof AbortSignal && "function" == typeof AbortSignal.timeout) return AbortSignal.timeout(12e4);
      }
      class tt {
        static DEFAULT_BASE_URL = Ze;
        #e;
        constructor(e2, t2 = Ze) {
          w(e2, "Warmup api key");
          const n2 = h(t2 || Ze, "baseURL");
          this.#e = e2, this._root = `${g(n2)}/api/v1/warmup`;
        }
        [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")](e2, t2, n2) {
          return `ZeroBounceWarmup ${n2({ ...this, api_key: null == this.#e ? null : "***" }, t2)}`;
        }
        async _send(e2, t2, { params: n2 = null, jsonBody: r2 = null, secrets: i2 = [], csv: s2 = false } = {}) {
          const a2 = n2 && Object.keys(n2).length ? `?${new URLSearchParams(n2)}` : "", o2 = `${this._root}${t2}${a2}`;
          h(o2, "request URL");
          const l2 = [this.#e, ...i2], u2 = { "API-Key": this.#e, Accept: "application/json" };
          let c2;
          null != r2 && (u2["Content-Type"] = "application/json");
          try {
            c2 = await fetch(o2, { method: e2, headers: u2, body: null != r2 ? JSON.stringify(r2) : void 0, signal: et(), redirect: "manual" });
          } catch (e3) {
            throw he(e3, l2);
          }
          ve(c2);
          const d2 = G(c2);
          if (0 === d2) throw he(new TypeError("the response has no HTTP status"), []);
          let f2 = "";
          try {
            s2 ? "function" == typeof c2.text && (f2 = await c2.text()) : f2 = await Se(c2);
          } catch (e3) {
            throw he(e3, l2);
          }
          if (d2 > 299) throw _(it(f2, d2, l2), d2);
          return { status: d2, body: f2, response: c2 };
        }
        async _json(e2, t2, n2 = {}) {
          const { status: r2, body: i2, response: s2 } = await this._send(e2, t2, n2);
          if (204 === r2 || "" === String(i2)) return null;
          if (rt(s2).includes("text/html")) throw _(it(i2, r2, [this.#e, ...n2.secrets || []]), r2);
          try {
            return Z(i2);
          } catch (e3) {
            if (e3 instanceof f) throw _(e3.message, r2);
            throw _(it(i2, r2, [this.#e, ...n2.secrets || []]), r2);
          }
        }
        async _csv(e2, t2 = null) {
          const { status: n2, body: r2, response: i2 } = await this._send("GET", e2, { params: t2, csv: true }), s2 = rt(i2), a2 = s2.includes("text/html") || te(r2), o2 = a2 ? ne(r2, s2, n2) : null;
          if (o2) throw _(o2, n2);
          if (!String(r2).trim() || J(s2) || V(r2) || a2) throw _(it(r2, n2, [this.#e]), n2);
          return r2;
        }
        async listSendingAccounts() {
          return this._json("GET", "/sending-accounts");
        }
        async getSendingAccount(e2) {
          return this._json("GET", "/sending-account", { params: { from_address: Ye(e2, "from_address") } });
        }
        async addSendingAccount({ fromAddress: e2, onboardingModel: t2, engagementRuleId: n2 = null, ignoreConflict: r2 = null, emailContent: i2 = null, managedSending: s2 = null } = {}) {
          if (Ye(e2, "from_address"), !qe.includes(t2)) throw He("onboarding_model parameter is invalid. Must be self_managed or zb_managed.");
          const a2 = { from_address: e2, onboarding_model: t2 };
          if ("self_managed" === t2) {
            if (null == n2) throw He("engagement_rule_id parameter is missing. Required for self_managed.");
            if (a2.engagement_rule_id = Xe(n2, Ge, "engagement_rule_id"), null != i2 || null != s2) throw He("email_content and managed_sending are for zb_managed.");
          } else if (null != n2) throw He("engagement_rule_id is for self_managed.");
          if (null != r2 && (a2.ignore_conflict = b(r2, "ignore_conflict")), null != i2) {
            const e3 = { ...i2 }, t3 = e3.types_of_emails;
            if (null != t3 && (!Array.isArray(t3) || t3.some((e4) => !Ke.includes(e4)))) throw He("types_of_emails parameter is invalid. transactional, newsletter and/or marketing.");
            a2.email_content = e3;
          }
          if (null != s2) {
            const e3 = { ...s2 }, t3 = e3.timezone_offset;
            if (null != t3 && ("number" != typeof t3 || !Number.isFinite(t3) || t3 < -11 || t3 > 14)) throw He("timezone_offset parameter is invalid. Must be -11 to 14.");
            null != e3.weekdays_only && (e3.weekdays_only = b(e3.weekdays_only, "weekdays_only")), null != e3.warmup_start_date && (e3.warmup_start_date = Qe(e3.warmup_start_date, "warmup_start_date")), a2.managed_sending = e3;
          }
          return this._json("POST", "/sending-accounts", { jsonBody: a2 });
        }
        async updateSendingAccount({ fromAddress: e2, engagementRuleId: t2, statusId: n2, autoEnable: r2 } = {}) {
          if (Ye(e2, "from_address"), "boolean" != typeof r2) throw He("auto_enable parameter is missing. Must be true or false.");
          return this._json("PUT", "/sending-accounts", { jsonBody: { team_id: 1, from_address: e2, engagement_rule_id: Xe(t2, Ge, "engagement_rule_id"), status_id: Xe(n2, We, "status_id"), auto_enable: r2 } });
        }
        async deleteSendingAccount(e2) {
          return this._json("DELETE", "/sending-accounts", { params: { from_address: Ye(e2, "from_address") } });
        }
        async changeFromAddress(e2, t2) {
          return this._json("PUT", "/smtp-credentials", { jsonBody: { team_id: 1, old_from_address: Ye(e2, "old_from_address"), new_from_address: Ye(t2, "new_from_address") } });
        }
        async listFromAddresses({ searchFrom: e2 = null, offset: t2 = null, limit: n2 = null } = {}) {
          const r2 = {};
          if (null != e2) {
            if (!Je.test(e2)) throw He("search_from parameter is invalid. Letters, digits and . - _ @ + only.");
            r2.search_from = e2;
          }
          for (const [e3, i2] of [["offset", t2], ["limit", n2]]) if (null != i2) {
            if ("number" != typeof i2 || !Number.isInteger(i2) || i2 < 0) throw He(`${e3} parameter is invalid. Must be a non-negative integer.`);
            r2[e3] = String(i2);
          }
          return this._json("GET", "/from-addresses", { params: r2 });
        }
        async getEngagementRules() {
          return this._json("GET", "/engagement-rules");
        }
        async setEngagementRule(e2, t2) {
          return Ye(e2, "c_from"), this._json("PUT", "/engagement-rule", { params: { c_from: e2 }, jsonBody: { rule_id: Xe(t2, Ge, "rule_id") } });
        }
        async getCustomEngagement(e2) {
          return this._json("GET", `/custom-engagement/${(function(e3, t2) {
            const n2 = null == e3 ? "" : String(e3).trim();
            if (!n2) throw new Error(`ZeroBounce: ${t2} parameter is missing.`);
            if ("." === n2 || ".." === n2) throw new Error(`ZeroBounce: ${t2} parameter is invalid.`);
            return encodeURIComponent(n2);
          })(e2, "c_from")}`);
        }
        async createCustomEngagement({ cFrom: e2, replyPct: t2, importantPct: n2, clickPct: r2 } = {}) {
          return this._json("POST", "/custom-engagement", { jsonBody: nt(e2, t2, n2, r2) });
        }
        async updateCustomEngagement({ cFrom: e2, replyPct: t2, importantPct: n2, clickPct: r2 } = {}) {
          return this._json("PUT", "/custom-engagement", { jsonBody: nt(e2, t2, n2, r2) });
        }
        async deleteCustomEngagement(e2, t2) {
          return this._json("DELETE", "/custom-engagement", { jsonBody: { c_from: Ye(e2, "c_from"), engagement_rule_id: Xe(t2, [1, 4], "engagement_rule_id") } });
        }
        async getSeeds() {
          return this._json("GET", "/seeds");
        }
        async downloadSeeds() {
          return this._csv("/seeds/download");
        }
        async getSeedCount() {
          return this._json("GET", "/seed-count");
        }
        async getProgressToday() {
          return this._json("GET", "/progress-today");
        }
        async getSentToday() {
          return this._json("GET", "/sent-today");
        }
        async getEmailsPerDay() {
          return this._json("GET", "/emails-per-day");
        }
        async getStatistics(e2) {
          return this._json("GET", "/statistics", { params: { from_address: Ye(e2, "from_address") } });
        }
        async getStatisticsPerDay({ fromAddress: e2, startDate: t2, endDate: n2 } = {}) {
          Ye(e2, "from_address");
          const r2 = Qe(t2, "start_date"), i2 = Qe(n2, "end_date");
          if (r2 > i2) throw He("start_date parameter is invalid. It is later than end_date.");
          return this._json("GET", "/statistics-per-day", { params: { from_address: e2, start_date: r2, end_date: i2 } });
        }
        async getStatisticsDetailed(e2) {
          return this._json("GET", "/statistics-detailed", { params: { c_from: Ye(e2, "c_from") } });
        }
        async downloadStatistics(e2) {
          return this._csv("/statistics/download", { c_from: Ye(e2, "c_from") });
        }
        async getFromAddressStatistics(e2) {
          return this._json("GET", "/from-address-statistics", { params: { from_address: Ye(e2, "from_address") } });
        }
        async checkDomainDmarc(e2, t2 = null) {
          if (Ye(e2, "from_address"), !String(e2).includes("@")) throw He("from_address parameter is invalid. Pass an email address, e.g. sender@example.com.");
          const n2 = { from_address: e2 };
          return null != t2 && (n2.dkim_selector = Ye(t2, "dkim_selector")), this._json("GET", "/check-domain-dmarc", { params: n2 });
        }
        async testSmtpConfiguration({ fromAddress: e2, username: t2, password: n2, server: r2, port: i2 } = {}) {
          if ("number" != typeof i2 || !Number.isInteger(i2) || i2 < 1 || i2 > 65535) throw He("port parameter is invalid. Must be 1 to 65535.");
          const s2 = { from_address: Ye(e2, "from_address"), username: Ye(t2, "username"), password: Ye(n2, "password"), server: Ye(r2, "server"), port: i2 };
          return this._json("POST", "/test-smtp-configuration", { jsonBody: s2, secrets: [n2, t2] });
        }
      }
      function nt(e2, t2, n2, r2) {
        if (Ye(e2, "c_from"), Xe(t2, [5, 45], "reply_pct"), Xe(n2, [5, 40], "important_pct"), Xe(r2, [0, 70], "click_pct"), r2 > 1.75 * n2) throw He("click_pct parameter is invalid. At most important_pct x 1.75.");
        return { c_from: e2, reply_pct: t2, important_pct: n2, click_pct: r2 };
      }
      function rt(e2) {
        return e2 && e2.headers && "function" == typeof e2.headers.get ? String(e2.headers.get("content-type") || "").toLowerCase() : "";
      }
      function it(e2, t2, n2 = []) {
        const r2 = (e3) => M(e3, n2), i2 = String(e2 || "").trim();
        if (!i2) return `Empty response from ZeroBounce (HTTP ${t2})`;
        if (ee(e2)) return "ZeroBounce returned an HTML error page instead of an API response.";
        if (i2.startsWith("{") || i2.startsWith("[")) {
          let e3;
          try {
            e3 = JSON.parse(i2);
          } catch {
            return "ZeroBounce returned a response that is not valid JSON.";
          }
          if (Array.isArray(e3)) {
            const t3 = e3.find((e4) => "string" == typeof e4 && e4.trim());
            if (t3) return r2(t3.trim());
          } else if (e3 && "object" == typeof e3) for (const t3 of ["message", "error", "error_message", "detail"]) {
            const n3 = e3[t3];
            if ("string" == typeof n3 && n3.trim()) return r2(n3.trim());
            if (Array.isArray(n3) && n3.length) {
              const e4 = n3.filter((e5) => "string" == typeof e5 && e5.trim());
              if (e4.length) return r2(e4.join("\n"));
              const t4 = n3[0];
              if (t4 && "object" == typeof t4 && t4.msg) {
                const e5 = Array.isArray(t4.loc) ? t4.loc.slice(1).join(".") : "";
                return r2(e5 ? `${e5}: ${t4.msg}` : String(t4.msg));
              }
            }
          }
          return `ZeroBounce returned an error (HTTP ${t2}).`;
        }
        return i2.length > 1e3 ? "ZeroBounce returned a response that is not valid JSON." : r2(i2);
      }
      Me.Warmup = tt, Me.ZeroBounceWarmup = tt, Me.ZBApiError = f, Me.ZeroBounceSDK = Me, Me.default = Me;
      const st = Me;
      return t = t.default, t;
    })());
  }
});

// src/index.ts
import { createServer } from "node:http";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

// src/security/redact.ts
import { AsyncLocalStorage } from "node:async_hooks";
var jsonEscaped = (text) => JSON.stringify(text).slice(1, -1);
var jsonEscapedSlash = (text) => jsonEscaped(text).split("/").join("\\/");
var urlEncoded = (text) => encodeURIComponent(text);
var formEncoded = (text) => new URLSearchParams({ s: text }).toString().slice(2);
var QUOTINGS = [jsonEscaped, jsonEscapedSlash];
var ENCODINGS = [(text) => text, urlEncoded, formEncoded];
function secretForms(secret) {
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
var CREDENTIAL_OMITTED_MESSAGE = "ZeroBounce: the response text was omitted because it contained a credential.";
function utf8SequenceLength(byte) {
  if (byte < 128) return 1;
  if (byte >= 194 && byte <= 223) return 2;
  if (byte >= 224 && byte <= 239) return 3;
  if (byte >= 240 && byte <= 244) return 4;
  return 0;
}
function percentRunDecoded(run) {
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
      }
    }
    out += bytes[i];
    i += 1;
  }
  return out;
}
function percentDecoded(text) {
  return text.replace(/(?:%[0-9A-Fa-f]{2})+/g, (run) => {
    try {
      return decodeURIComponent(run);
    } catch {
      return percentRunDecoded(run);
    }
  });
}
function percentLatin1(text) {
  return text.replace(/%([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}
function latin1RunsAsUtf8(text) {
  return text.replace(/[\u0080-\u00ff]+/g, (run) => {
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
        }
      }
      out += run[i];
      i += 1;
    }
    return out;
  });
}
var JSON_UNESCAPES = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "	", "'": "'" };
function hexDigit(char) {
  const d = parseInt(char, 16);
  return Number.isNaN(d) ? -1 : d;
}
function codePointText(code) {
  if (code < 0 || code > 1114111) return "\uFFFD";
  return String.fromCodePoint(code);
}
function jsonUnescaped(text) {
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
    if (next === "U" && /^[0-9A-Fa-f]{8}$/.test(text.slice(i + 2, i + 10)) && parseInt(text.slice(i + 2, i + 10), 16) <= 1114111) {
      out += codePointText(parseInt(text.slice(i + 2, i + 10), 16));
      i += 10;
      continue;
    }
    if (next === "u" || next === "U") {
      const hex = text.slice(i + 2, i + 6);
      if (/^[0-9A-Fa-f]{4}$/.test(hex)) {
        let code = parseInt(hex, 16);
        if (code >= 55296 && code <= 56319 && text[i + 6] === "\\" && (text[i + 7] === "u" || text[i + 7] === "U")) {
          const low = text.slice(i + 8, i + 12);
          if (/^[0-9A-Fa-f]{4}$/.test(low)) {
            const lowCode = parseInt(low, 16);
            if (lowCode >= 56320 && lowCode <= 57343) {
              code = 65536 + (code - 55296 << 10) + (lowCode - 56320);
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
function htmlEntity(name) {
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
      return "\xA0";
    default:
      return null;
  }
}
function htmlUnescaped(text) {
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
function hexByteEscapesDecoded(text) {
  if (!text.includes("\\x") && !text.includes("\\X")) return text;
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "\\" && (text[i + 1] === "x" || text[i + 1] === "X") && hexDigit(text[i + 2]) >= 0 && hexDigit(text[i + 3]) >= 0) {
      out += String.fromCharCode(hexDigit(text[i + 2]) * 16 + hexDigit(text[i + 3]));
      i += 4;
    } else {
      out += text[i];
      i += 1;
    }
  }
  return out;
}
function quoteDecoded(text) {
  return htmlUnescaped(hexByteEscapesDecoded(text.replace(/\\'/g, "'")));
}
function foldedScalars(scalar) {
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
function foldedCharacter(character) {
  const scalars = [...character];
  const plain = scalars.every((s) => {
    const value = s.codePointAt(0);
    return value >= 19968 && value <= 40959;
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
    (scalar, index) => scalar.codePointAt(0) === 775 && index > 0 && folded[index - 1] === "i"
  );
  return { folded, droppable };
}
function buildFoldedText(text) {
  if (/^[\x00-\x7F]*$/.test(text)) {
    const scalars2 = [...text].map((c) => c.toLowerCase());
    const starts2 = scalars2.map((_, index) => index);
    const ends2 = starts2.map((start) => start + 1);
    return { scalars: scalars2, starts: starts2, ends: ends2, droppable: scalars2.map(() => false) };
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
function foldedSpelling(text) {
  const view = buildFoldedText(text);
  return view.scalars.filter((_, index) => !view.droppable[index]).join("");
}
function markScalar(scalar) {
  return /\p{M}/u.test(scalar);
}
function secretOccurrences(needle, haystack) {
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
function simpleFoldSpelling(text) {
  let folded = [];
  for (const scalar of [...String(text).normalize("NFD")]) {
    folded.push(...foldedScalars(scalar));
  }
  folded = [...folded.join("").normalize("NFD")];
  return folded.filter((scalar, index) => !(scalar.codePointAt(0) === 775 && index > 0 && folded[index - 1] === "i")).join("");
}
function revealsInFoldedText(text, secrets) {
  const hay = simpleFoldSpelling(text);
  return secrets.filter(Boolean).some((secret) => {
    const needle = simpleFoldSpelling(String(secret));
    return needle.length > 0 && hay.includes(needle);
  });
}
function maskFolded(text, secrets) {
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
var DECODERS = [
  percentDecoded,
  (text) => percentDecoded(text.split("+").join(" ")),
  percentLatin1,
  (text) => percentLatin1(text.split("+").join(" ")),
  jsonUnescaped,
  (text) => latin1RunsAsUtf8(jsonUnescaped(text)),
  quoteDecoded
];
var DECODE_LAYERS = 4;
function decodedViews(text) {
  const views = /* @__PURE__ */ new Set([text]);
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
function holdsSecret(text, secrets = []) {
  const present = secrets.filter(Boolean).map(String);
  if (!present.length) return false;
  for (const view of decodedViews(String(text))) {
    if (present.some((secret) => view.includes(secret))) return true;
    if (revealsInFoldedText(view, present)) return true;
  }
  return false;
}
var MAX_REDACTED_LENGTH = 65536;
var TEXT_TOO_LONG_MESSAGE = "ZeroBounce: the text was omitted because it is too long to show.";
function utf8Length(text) {
  let total = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code < 128) total += 1;
    else if (code < 2048) total += 2;
    else if (code >= 55296 && code <= 56319 && i + 1 < text.length && (text.charCodeAt(i + 1) & 64512) === 56320) {
      total += 4;
      i += 1;
    } else total += 3;
  }
  return total;
}
function redactSecrets(text, secrets = []) {
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
  return holdsSecret(value, secrets) ? CREDENTIAL_OMITTED_MESSAGE : value;
}
var callSecrets = new AsyncLocalStorage();
function withSecrets(secrets, fn) {
  return callSecrets.run(secrets.filter((s) => typeof s === "string" && s !== ""), fn);
}
function currentSecrets() {
  return callSecrets.getStore() ?? [];
}
var SECRET_ARG_NAME = /pass(?:word|phrase)?|secret|token|api[_-]?key|username|credential|^user$/i;
function collectArgSecrets(args, depth = 0) {
  const found = [];
  if (!args || typeof args !== "object" || depth > 3) return found;
  for (const [name, value] of Object.entries(args)) {
    if (typeof value === "string") {
      if (value !== "" && SECRET_ARG_NAME.test(name)) found.push(value);
    } else if (value && typeof value === "object") {
      found.push(...collectArgSecrets(value, depth + 1));
    }
  }
  return found;
}
var WHOLE_TEXT_MIN_SECRET_LENGTH = 8;
var WINDOW_CHARS = 16384;
function maskWholeTokens(text, secret) {
  if (!text.includes(secret)) return text;
  const isWord = (ch) => ch !== void 0 && /[\p{L}\p{N}_]/u.test(ch);
  let out = "";
  let from = 0;
  for (let at = text.indexOf(secret, from); at >= 0; at = text.indexOf(secret, from)) {
    const beforeChar = [...text.slice(Math.max(0, at - 2), at)].pop();
    const after = [...text.slice(at + secret.length, at + secret.length + 2)][0];
    out += text.slice(from, at);
    out += isWord(beforeChar) || isWord(after) ? secret : "***";
    from = at + secret.length;
  }
  return out + text.slice(from);
}
function windows(text) {
  const pieces = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + WINDOW_CHARS);
    if (end < text.length) {
      const lineBreak = text.lastIndexOf("\n", end - 1);
      if (lineBreak > start + WINDOW_CHARS / 2) end = lineBreak + 1;
      else if ((text.charCodeAt(end - 1) & 64512) === 55296) end -= 1;
    }
    pieces.push(text.slice(start, end));
    start = end;
  }
  return pieces;
}
function redactResultText(text, secrets) {
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
      out = windows(out).map((piece) => redactSecrets(piece, long)).join("");
    }
  }
  for (const secret of short) out = maskWholeTokens(out, secret);
  return out;
}

// src/errors.ts
var MAX_ERROR_MESSAGE_LENGTH = 1e3;
var HTML_TAG = /<(?:!doctype\s+html|html|head|body)\b/i;
function skipLeadingHtmlPadding(text) {
  let index = 0;
  if (text.charCodeAt(0) === 65279) index = 1;
  while (index < text.length) {
    const code = text.charCodeAt(index);
    if (code === 32 || code === 9 || code === 10 || code === 13 || code === 11 || code === 12 || code === 160) {
      index += 1;
      continue;
    }
    break;
  }
  return text.slice(index);
}
var HTML_PROBE_CHARS = 2e3;
function looksLikeHtml(text) {
  const body = skipLeadingHtmlPadding(text);
  if (body.startsWith("{") || body.startsWith("[")) {
    return false;
  }
  return HTML_TAG.test(body.slice(0, HTML_PROBE_CHARS));
}
function looksLikeHtmlDownload(text) {
  return skipLeadingHtmlPadding(text).startsWith("<");
}
var HTML_TITLE_WINDOW = 65536;
var HTML_TITLE_MAX = 1e3;
function htmlTitle(page) {
  const title = page.slice(0, HTML_TITLE_WINDOW).match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  const text = title?.replace(/\s+/g, " ").trim() ?? "";
  return text.length > HTML_TITLE_MAX ? "" : text;
}
function formatErrorMessage(error, secrets = currentSecrets()) {
  let message = (error instanceof Error ? error.message : String(error)).trim();
  message = message.replace(/^(?:(?:Error|\[Error\]):\s*)+/i, "");
  message = redactResultText(message, secrets);
  if (looksLikeHtml(message)) {
    const title = htmlTitle(message);
    return `ZeroBounce returned an HTML error page${title ? ` ("${title}")` : ""} instead of an API response. Check the API key and request parameters.`;
  }
  if (message.length > MAX_ERROR_MESSAGE_LENGTH) {
    let end = MAX_ERROR_MESSAGE_LENGTH;
    const last = message.charCodeAt(end - 1);
    if (last >= 55296 && last <= 56319) {
      end -= 1;
    }
    return `${message.slice(0, end)}\u2026 (truncated)`;
  }
  return message || "Unknown error";
}

// src/security/bulk-input.ts
import { isIP } from "node:net";
var MAX_BULK_FILE_CONTENT_BYTES = 32 * 1024 * 1024;
var HTTP_MAX_REQUEST_BODY_BYTES = MAX_BULK_FILE_CONTENT_BYTES * 2 + 64 * 1024;
function normalizeHost(hostname) {
  let host = hostname.trim().toLowerCase();
  if (host.startsWith("[") && host.endsWith("]") && host.length >= 2) {
    host = host.slice(1, -1);
  }
  return host.replace(/\.+$/, "");
}
var IPV4_BLOCKS = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4]
  // reserved, and 255.255.255.255 (limited broadcast)
];
function ipv4ToInt(host) {
  const parts = host.split(".");
  if (parts.length !== 4) return void 0;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return void 0;
    const n = Number(part);
    if (n > 255) return void 0;
    value = value * 256 + n;
  }
  return value;
}
function isSpecialIpv4Int(value) {
  return IPV4_BLOCKS.some(([base, bits]) => {
    const baseInt = ipv4ToInt(base);
    const size = 2 ** (32 - bits);
    return Math.floor(value / size) === Math.floor(baseInt / size);
  });
}
function isPrivateIpv4(host) {
  const value = ipv4ToInt(host);
  return value === void 0 ? true : isSpecialIpv4Int(value);
}
function parseIpv6(host) {
  let text = host;
  const lastColon = text.lastIndexOf(":");
  if (text.includes(".")) {
    const v4 = ipv4ToInt(text.slice(lastColon + 1));
    if (v4 === void 0) return void 0;
    text = text.slice(0, lastColon + 1) + Math.floor(v4 / 65536).toString(16) + ":" + (v4 % 65536).toString(16);
  }
  const halves = text.split("::");
  if (halves.length > 2) return void 0;
  const toGroups = (part) => {
    if (part === "") return [];
    const out = [];
    for (const g of part.split(":")) {
      if (!/^[0-9a-f]{1,4}$/i.test(g)) return void 0;
      out.push(Number.parseInt(g, 16));
    }
    return out;
  };
  const head = toGroups(halves[0] ?? "");
  const tail = halves.length === 2 ? toGroups(halves[1] ?? "") : [];
  if (!head || !tail) return void 0;
  if (halves.length === 1) return head.length === 8 ? head : void 0;
  const fill = 8 - head.length - tail.length;
  if (fill < 1) return void 0;
  return [...head, ...new Array(fill).fill(0), ...tail];
}
function groupsToIpv4(hi, lo) {
  return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
}
function isPrivateIpv6(host) {
  const bare = (host.split("%")[0] ?? host).toLowerCase();
  const groups = parseIpv6(bare);
  if (!groups) return true;
  const [a, b, c, d, e, f, g, h] = groups;
  const firstFiveZero = a === 0 && b === 0 && c === 0 && d === 0 && e === 0;
  if (firstFiveZero && (f === 0 || f === 65535)) {
    return f === 0 ? true : isPrivateIpv4(groupsToIpv4(g, h));
  }
  if (a === 0 && b === 0 && c === 0 && d === 0 && e === 65535 && f === 0) {
    return isPrivateIpv4(groupsToIpv4(g, h));
  }
  if (a === 100 && b === 65435 && c === 0 && d === 0 && e === 0 && f === 0) {
    return isPrivateIpv4(groupsToIpv4(g, h));
  }
  if (a === 100 && b === 65435 && c === 1) return true;
  if (a === 8194) return isPrivateIpv4(groupsToIpv4(b, c));
  if (a === 256 && b === 0 && c === 0 && d === 0) return true;
  if (a === 8193 && b < 512) return true;
  if (a === 8193 && b === 3512) return true;
  if (a === 16383 && b < 4096) return true;
  if (a === 24320) return true;
  if (a >= 64512 && a <= 65023) return true;
  if (a >= 65152 && a <= 65215) return true;
  if (a >= 65216 && a <= 65279) return true;
  if (a >= 65280) return true;
  return false;
}
var BLOCKED_NAME_SUFFIXES = [
  "localhost",
  "local",
  "localdomain",
  "internal",
  "lan",
  "home.arpa",
  "nip.io",
  "sslip.io",
  "xip.io",
  "traefik.me",
  "localtest.me",
  "lvh.me"
];
var BLOCKED_NAMES = /* @__PURE__ */ new Set(["metadata", "instance-data", "metadata.google.internal"]);
function isPrivateOrLocalHost(hostname) {
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
var UNSAFE_URL_CHARACTER = /[\p{Cc}\p{Cf}\p{Z}\s\\\p{Default_Ignorable_Code_Point}]/u;
function validateBulkReturnUrl(returnUrl, fieldName = "returnUrl") {
  if (UNSAFE_URL_CHARACTER.test(returnUrl)) {
    throw new Error(
      `${fieldName} must not contain control, whitespace, or invisible characters, or backslashes`
    );
  }
  let parsed;
  try {
    parsed = new URL(returnUrl);
  } catch {
    throw new Error(`${fieldName} must be a valid URL`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${fieldName} must use HTTPS`);
  }
  if (parsed.username || parsed.password) {
    throw new Error(`${fieldName} must not contain a username or password`);
  }
  if (parsed.port !== "") {
    throw new Error(`${fieldName} must use the default HTTPS port (443)`);
  }
  const hostname = normalizeHost(parsed.hostname);
  if (!hostname) {
    throw new Error(`${fieldName} must include a hostname`);
  }
  if (isPrivateOrLocalHost(hostname)) {
    throw new Error(`${fieldName} must not target private, link-local, or loopback addresses`);
  }
  if (isIP(hostname) === 0 && !hostname.includes(".")) {
    throw new Error(`${fieldName} hostname must be a fully qualified domain name`);
  }
  if (!parsed.hostname.startsWith("[")) parsed.hostname = hostname;
  return parsed.href;
}
function assertSafeFileName(fileName, fieldName = "fileName") {
  if (/[\p{Cc}\u2028\u2029]/u.test(fileName)) {
    throw new Error(`${fieldName} must not contain control characters (such as CR, LF, or NUL)`);
  }
}
function assertBulkFileContentWithinLimit(fileContent, fieldName = "fileContent") {
  const bytes = Buffer.byteLength(fileContent, "utf8");
  if (bytes > MAX_BULK_FILE_CONTENT_BYTES) {
    throw new Error(
      `${fieldName} exceeds maximum size of ${MAX_BULK_FILE_CONTENT_BYTES} bytes`
    );
  }
}

// node_modules/@zerobounce/zero-bounce-sdk/zeroBounceSDK.mjs
var import_zeroBounceSDK = __toESM(require_zeroBounceSDK(), 1);
var { ZeroBounceWarmup, ZBApiError } = import_zeroBounceSDK.default;
var zeroBounceSDK_default = import_zeroBounceSDK.default;

// src/warmup-client.ts
var DEFAULT_WARMUP_BASE_URL = "https://warmup-api.zerobounce.net";
function warmupConstructor() {
  const sdk = zeroBounceSDK_default;
  return typeof sdk.Warmup === "function" ? sdk.Warmup : void 0;
}
function isWarmupMethodAvailable(name) {
  const ctor = warmupConstructor();
  return ctor !== void 0 && typeof ctor.prototype?.[name] === "function";
}
function createWarmupClient(apiKey, baseUrl) {
  const Warmup = warmupConstructor();
  if (!Warmup) {
    throw new Error(
      "The Warmup API requires @zerobounce/zero-bounce-sdk with Warmup support (upgrade SDK)."
    );
  }
  return new Warmup(apiKey, baseUrl || DEFAULT_WARMUP_BASE_URL);
}

// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// src/zerobounce-client.ts
function readCsvColumn(row, column, rowIndex) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (quoted) {
      if (ch === '"' && row[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      fields.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  fields.push(field);
  const value = fields[column]?.trim();
  if (!value) {
    throw new Error(`emails[${rowIndex}] has no value in column ${column}`);
  }
  return value;
}
function isSdkMethodAvailable(name) {
  return typeof zeroBounceSDK_default.prototype?.[name] === "function";
}
var ZeroBounceClient = class {
  // Private field, not a property: no property of this object holds the key, so
  // util.inspect, %o and JSON output of a client never print it.
  #apiKey;
  #warmupApiKey;
  baseUrl;
  // Use official ZeroBounce SDK for core endpoints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk;
  warmupClient;
  constructor(config) {
    this.#apiKey = config.apiKey;
    this.#warmupApiKey = config.warmupApiKey || void 0;
    this.baseUrl = config.baseUrl || "https://api.zerobounce.net/v2";
    this.sdk = new zeroBounceSDK_default();
    this.sdk.init(this.#apiKey, this.baseUrl);
    if (config.warmupApiKey) {
      this.warmupClient = createWarmupClient(config.warmupApiKey, config.warmupBaseUrl);
    }
  }
  /**
   * The Warmup API client. Warmup tools are only registered when a Warmup key is
   * configured, so reaching this without one means a stale tool registry.
   */
  get warmup() {
    if (!this.warmupClient) {
      throw new Error(
        "A ZeroBounce Warmup API key is required. Provide it via --warmup-api-key, the ZEROBOUNCE_WARMUP_API_KEY environment variable, or the X-ZeroBounce-Warmup-Api-Key header in HTTP mode."
      );
    }
    return this.warmupClient;
  }
  /**
   * Every secret of a tool call: the validation and Inbox Placement key (one key),
   * the Warmup key, and what the caller put in the arguments (SMTP username and
   * password, a token). Held here so no inspectable property carries a key.
   */
  secretsForCall(args = {}) {
    return [
      ...new Set(
        [this.#apiKey, this.#warmupApiKey, ...collectArgSecrets(args)].filter(
          (secret) => typeof secret === "string" && secret !== ""
        )
      )
    ];
  }
  /**
   * Text taken from a response body, masked with every secret however short
   * (the server's own fixed words are never passed through this).
   */
  bodyText(text) {
    return redactSecrets(text, [...this.secretsForCall(), ...currentSecrets()]);
  }
  /** Whether this client can serve Warmup calls. */
  get hasWarmup() {
    return this.warmupClient !== void 0;
  }
  /** SDK bulk APIs use 1-based column indexes; MCP tools accept 0-based. */
  toSdkColumnIndex(column) {
    return (column ?? 0) + 1;
  }
  /** 0-based optional columns as the SDK's 1-based indexes, leaving out the unset ones. */
  optionalColumns(columns) {
    const out = {};
    for (const [name, column] of Object.entries(columns)) {
      if (column != null) {
        out[name] = this.toSdkColumnIndex(column);
      }
    }
    return out;
  }
  toCsvBlob(fileContent) {
    return fileContent instanceof Blob ? fileContent : new Blob([fileContent], { type: "text/csv" });
  }
  requireSdkResult(result, context) {
    if (result === void 0) {
      throw new Error(`ZeroBounce SDK returned no result for ${context}`);
    }
    return result;
  }
  /**
   * Validate a single email address
   */
  async validateEmail(email, options) {
    const hasExtended = options && (options.timeout != null || options.activityData != null || options.verifyPlus != null || options.usePost);
    const sdkArg = hasExtended ? {
      ip_address: options?.ipAddress,
      timeout: options?.timeout,
      activityData: options?.activityData,
      verifyPlus: options?.verifyPlus,
      ...options?.usePost ? { method: "POST" } : {}
    } : options?.ipAddress ?? null;
    const result = await this.sdk.validateEmail(email, sdkArg);
    return result;
  }
  /**
   * Validate multiple email addresses in batch
   * Note: ZeroBounce batch API typically requires file upload, but this implementation
   * uses the real-time batch API on the bulk endpoint
   */
  async validateBatch(emails, options) {
    const column = options?.emailAddressColumn;
    const emailBatch = emails.map((entry, row) => ({
      email_address: column == null ? entry : readCsvColumn(entry, column, row)
    }));
    const batchOptions = options && (options.timeout != null || options.activityData != null || options.verifyPlus != null) ? {
      timeout: options.timeout,
      activityData: options.activityData,
      verifyPlus: options.verifyPlus
    } : null;
    const result = this.requireSdkResult(
      await this.sdk.validateBatch(emailBatch, batchOptions),
      "batch validation"
    );
    const accountError = result.errors?.find(
      (e) => String(e?.email_address ?? "").trim().toLowerCase() === "all"
    );
    if (accountError) {
      throw new Error(this.bodyText(String(accountError.error ?? "")));
    }
    return result;
  }
  /**
   * Get account credits
   */
  async getCredits() {
    const result = await this.sdk.getCredits();
    return result;
  }
  /**
   * Get API usage statistics
   */
  async getApiUsage(startDate, endDate) {
    const result = await this.sdk.getApiUsage(startDate, endDate);
    return result;
  }
  // ========== Bulk Validation File Operations ==========
  /**
   * Send a file for bulk validation
   */
  async bulkValidateSendFile(fileContent, fileName, returnUrl, emailAddressColumn, options) {
    const blob = this.toCsvBlob(fileContent);
    const result = this.requireSdkResult(
      await this.sdk.sendFileStream(blob, fileName, {
        email_address_column: this.toSdkColumnIndex(emailAddressColumn),
        return_url: returnUrl || false,
        ...this.optionalColumns({
          first_name_column: options?.firstNameColumn,
          last_name_column: options?.lastNameColumn,
          gender_column: options?.genderColumn,
          ip_address_column: options?.ipAddressColumn
        }),
        ...options?.hasHeaderRow != null ? { has_header_row: options.hasHeaderRow } : {},
        ...options?.removeDuplicate != null ? { remove_duplicate: options.removeDuplicate } : {},
        ...options?.allowPhase2 != null ? { allowPhase2: options.allowPhase2 } : {}
      }),
      "bulk validation send file"
    );
    return result;
  }
  /**
   * Get bulk validation file status
   */
  async bulkValidateFileStatus(fileId) {
    const result = await this.sdk.getFileStatus(fileId);
    return result;
  }
  /**
   * Get bulk validation file results
   */
  async bulkValidateGetFile(fileId) {
    const result = await this.sdk.getFile(fileId);
    return this.normalizeBulkFileResult(result);
  }
  /**
   * Delete bulk validation file
   */
  async bulkValidateDeleteFile(fileId) {
    const result = await this.sdk.deleteFile(fileId);
    return result;
  }
  // ========== AI Scoring Operations ==========
  /**
   * Send a file for bulk AI scoring
   */
  async bulkAIScoringSendFile(fileContent, fileName, returnUrl, emailAddressColumn, options) {
    const blob = this.toCsvBlob(fileContent);
    const result = this.requireSdkResult(
      await this.sdk.sendScoringFileStream(blob, fileName, {
        email_address_column: this.toSdkColumnIndex(emailAddressColumn),
        return_url: returnUrl || false,
        ...options?.hasHeaderRow != null ? { has_header_row: options.hasHeaderRow } : {},
        ...options?.removeDuplicate != null ? { remove_duplicate: options.removeDuplicate } : {}
      }),
      "bulk AI scoring send file"
    );
    return result;
  }
  /**
   * Get bulk AI scoring file status
   */
  async bulkAIScoringFileStatus(fileId) {
    const result = await this.sdk.getScoringFileStatus(fileId);
    return result;
  }
  /**
   * Get bulk AI scoring file results
   */
  async bulkAIScoringGetFile(fileId) {
    const result = await this.sdk.getScoringFile(fileId);
    return this.normalizeBulkFileResult(result);
  }
  normalizeBulkFileResult(result) {
    if (result === void 0) {
      throw new Error("ZeroBounce SDK returned no result");
    }
    if (typeof result === "string") {
      if (looksLikeHtml(result)) {
        throw new Error(result);
      }
      if (looksLikeHtmlDownload(result)) {
        throw new Error("ZeroBounce returned an HTML page instead of a file.");
      }
      return { success: true, csv: result };
    }
    if (result instanceof Blob) {
      throw new Error("Unexpected Blob response from bulk get-file endpoint");
    }
    if (typeof result === "object" && result !== null) {
      const error = result;
      const message = Array.isArray(error.message) ? error.message.join(", ") : error.message ?? error.error_message ?? error.error;
      throw new Error(
        this.bodyText(typeof message === "string" ? message : JSON.stringify(result))
      );
    }
    throw new Error(`Unexpected bulk get-file response: ${this.bodyText(String(result))}`);
  }
  /**
   * Delete bulk AI scoring file
   */
  async bulkAIScoringDeleteFile(fileId) {
    const result = await this.sdk.deleteScoringFile(fileId);
    return result;
  }
  // ========== Email Finder Operations ==========
  /**
   * Find an email address
   */
  async findEmail(request) {
    if (!request.first_name) {
      throw new Error("first_name is required for email finder");
    }
    if (!request.domain && !request.company) {
      throw new Error("Either domain or company is required for email finder");
    }
    const nameOptions = {
      first_name: request.first_name,
      middle_name: request.middle_name ?? null,
      last_name: request.last_name ?? null
    };
    const result = this.requireSdkResult(
      request.domain ? await this.sdk.findEmailByDomain({ domain: request.domain, ...nameOptions }) : await this.sdk.findEmailByCompanyName({
        company_name: request.company,
        ...nameOptions
      }),
      "email finder"
    );
    return result;
  }
  // ========== Domain Search Operations ==========
  /**
   * Get likely email format for a domain or company
   */
  async domainSearch(request) {
    if (!request.domain && !request.company) {
      throw new Error("Either domain or company is required for domain search");
    }
    const result = this.requireSdkResult(
      request.domain ? await this.sdk.findEmailFormatByDomain({ domain: request.domain }) : await this.sdk.findEmailFormatByCompanyName({
        company_name: request.company
      }),
      "domain search"
    );
    return result;
  }
  // ========== Activity Data Operations ==========
  /**
   * Get activity data for an email address
   */
  async getActivityData(email) {
    const result = await this.sdk.getEmailActivity(email);
    return result;
  }
  /**
   * Real-time AI scoring for a single email (GET or POST /v2/scoring).
   */
  async scoreEmail(email, options) {
    const sdk = this.sdk;
    if (typeof sdk.scoreEmail !== "function") {
      throw new Error(
        "scoreEmail requires @zerobounce/zero-bounce-sdk with /v2/scoring support (upgrade SDK)."
      );
    }
    const method = options?.usePost ? { method: "POST" } : void 0;
    const result = await sdk.scoreEmail(email, method);
    return result;
  }
  // ========== List Evaluator Operations ==========
  /**
   * Evaluate the quality of an email list
   * Requires file upload (multipart/form-data) with CSV file containing emails
   */
  async bulkEmailFinderSendFile(fileContent, fileName, domainColumn, options) {
    if (options?.firstNameColumn == null && options?.fullNameColumn == null) {
      throw new Error(
        "firstNameColumn or fullNameColumn is required for the bulk email finder"
      );
    }
    const blob = this.toCsvBlob(fileContent);
    const result = this.requireSdkResult(
      await this.sdk.sendEmailFinderFileStream(blob, fileName, {
        domain_column: this.toSdkColumnIndex(domainColumn),
        first_name_column: options?.firstNameColumn != null ? this.toSdkColumnIndex(options.firstNameColumn) : false,
        last_name_column: options?.lastNameColumn != null ? this.toSdkColumnIndex(options.lastNameColumn) : false,
        middle_name_column: options?.middleNameColumn != null ? this.toSdkColumnIndex(options.middleNameColumn) : false,
        full_name_column: options?.fullNameColumn != null ? this.toSdkColumnIndex(options.fullNameColumn) : false,
        has_header_row: options?.hasHeaderRow ?? false
      }),
      "bulk email finder send file"
    );
    return result;
  }
  async bulkEmailFinderFileStatus(fileId) {
    const result = await this.sdk.getEmailFinderFileStatus(fileId);
    return result;
  }
  async bulkEmailFinderGetFile(fileId) {
    const result = await this.sdk.getEmailFinderFile(fileId);
    return this.normalizeBulkFileResult(result);
  }
  async bulkEmailFinderDeleteFile(fileId) {
    const result = await this.sdk.deleteEmailFinderFile(fileId);
    return result;
  }
  async bulkDomainSearchSendFile(fileContent, fileName, domainColumn, hasHeaderRow) {
    const blob = this.toCsvBlob(fileContent);
    const result = this.requireSdkResult(
      await this.sdk.sendDomainSearchFileStream(blob, fileName, {
        domain_column: this.toSdkColumnIndex(domainColumn),
        has_header_row: hasHeaderRow ?? false
      }),
      "bulk domain search send file"
    );
    return result;
  }
  async bulkDomainSearchFileStatus(fileId) {
    const result = await this.sdk.getDomainSearchFileStatus(fileId);
    return result;
  }
  async bulkDomainSearchGetFile(fileId) {
    const result = await this.sdk.getDomainSearchFile(fileId);
    return this.normalizeBulkFileResult(result);
  }
  async bulkDomainSearchDeleteFile(fileId) {
    const result = await this.sdk.deleteDomainSearchFile(fileId);
    return result;
  }
  async sendListEvaluatorFile(fileContent, fileName, emailAddressColumn) {
    const blob = this.toCsvBlob(fileContent);
    const result = this.requireSdkResult(
      await this.sdk.sendListEvaluatorFileStream(blob, fileName, {
        email_address_column: this.toSdkColumnIndex(emailAddressColumn)
      }),
      "list evaluator send file"
    );
    return result;
  }
  async getListEvaluatorResult(fileId) {
    const result = await this.sdk.getListEvaluatorResult(fileId);
    return result;
  }
  /**
   * Submit a finished list evaluation for validation (POST /v2/send-evaluated-file/).
   *
   * This takes the List Evaluator's `file_id` as a form field. It is not a file
   * upload, whatever the public docs say: an upload comes back as
   * "file_id: This field is required".
   */
  async sendEvaluatedFile(fileId) {
    const result = this.requireSdkResult(
      await this.sdk.sendEvaluatedFile(fileId),
      "send evaluated file"
    );
    return result;
  }
  async addFilter(rule, target, value) {
    return this.requireSdkResult(await this.sdk.addFilter({ rule, target, value }), "add filter");
  }
  async listFilters(usePost = false) {
    return this.requireSdkResult(
      await this.sdk.listFilters(usePost ? { method: "POST" } : null),
      "list filters"
    );
  }
  async deleteFilter(rule, target, value) {
    return this.requireSdkResult(
      await this.sdk.deleteFilter({ rule, target, value }),
      "delete filter"
    );
  }
  async listS3Files(options) {
    return this.requireSdkResult(
      await this.sdk.listS3files({
        bucket: options?.bucket ?? null,
        search: options?.search ?? null
      }),
      "list S3 files"
    );
  }
  /**
   * One of the eight S3 / SFTP file jobs on the bulkapi root.
   *
   * `return_url` is sent on every call: the live API refuses a job without one
   * ("Provided return URL is not permitted: None"), although the docs mark it
   * optional. `file_name` is likewise required for all eight, SFTP included.
   */
  async bulkRootFileJob(sdkMethod, context, request, path) {
    const fields = {
      file_name: request.fileName,
      has_header_row: request.hasHeaderRow,
      return_url: request.returnUrl
    };
    if (request.removeDuplicates != null) {
      fields.remove_duplicates = request.removeDuplicates;
    }
    const result = this.requireSdkResult(
      path ? await this.sdk[sdkMethod](path, fields) : await this.sdk[sdkMethod](fields),
      context
    );
    return result;
  }
  async validateS3File(request) {
    return this.bulkRootFileJob("validateS3file", "validate S3 file", request);
  }
  /**
   * scoreS3file is the one job the SDK's public method cannot send correctly.
   * In @zerobounce/zero-bounce-sdk 3.0.0 it kept an older signature that has no
   * `return_url` parameter at all, so the field is dropped and the API answers
   * "Provided return URL is not permitted: None". The other seven jobs already
   * go through the SDK's own `_bulkRootFileJob`, which sends all four
   * documented fields, so this calls that helper directly for this one path.
   *
   * `_bulkRootFileJob` is listed in the tool's `sdkMethods`, so the tool hides
   * itself rather than breaking if a future SDK drops it. Once the SDK routes
   * scoreS3file through the shared helper, this can go back to the public
   * method like its siblings.
   */
  async scoreS3File(request) {
    return this.bulkRootFileJob("_bulkRootFileJob", "score S3 file", request, "/scoreS3file");
  }
  async emailFinderS3File(request) {
    return this.bulkRootFileJob("emailFinderS3file", "email finder S3 file", request);
  }
  async domainSearchS3File(request) {
    return this.bulkRootFileJob("domainSearchS3file", "domain search S3 file", request);
  }
  async validateSftpFile(request) {
    return this.bulkRootFileJob("validateSFTPfile", "validate SFTP file", request);
  }
  async scoreSftpFile(request) {
    return this.bulkRootFileJob("scoreSFTPfile", "score SFTP file", request);
  }
  async emailFinderSftpFile(request) {
    return this.bulkRootFileJob("emailFinderSFTPfile", "email finder SFTP file", request);
  }
  async domainSearchSftpFile(request) {
    return this.bulkRootFileJob("domainSearchSFTPfile", "domain search SFTP file", request);
  }
  /**
   * Without an export bucket the API uses the one configured on the account.
   *
   * The SDK's public `exportS3file` refuses to send the request at all without
   * an `export_bucket` ("export_bucket parameter is missing"), a requirement the
   * API itself does not impose, so this posts the documented fields through the
   * SDK's own form-post helper instead. That keeps the SDK's base URL, HTTPS
   * enforcement, key redaction and error handling; only the surplus check is
   * skipped. `_sendBulkRootFormPost` is gated in the tool's `sdkMethods`.
   */
  async exportS3File(fileId, exportBucket) {
    const result = this.requireSdkResult(
      await this.sdk._sendBulkRootFormPost("/exportS3file", {
        file_id: fileId,
        ...exportBucket != null ? { export_bucket: exportBucket } : {}
      }),
      "export S3 file"
    );
    return result;
  }
  /** Without an export path the API uses the one configured on the account. */
  async exportSftpFile(fileId, exportPath) {
    const result = this.requireSdkResult(
      await this.sdk.exportSFTPfile({
        file_id: fileId,
        ...exportPath != null ? { export_path: exportPath } : {}
      }),
      "export SFTP file"
    );
    return result;
  }
  // ========== Inbox Placement Tester Operations ==========
  //
  // This API authenticates with `Authorization: Bearer`; the key never goes on the
  // query string. The SDK builds the requests, so the key stays out of URLs here too.
  /** Seed providers available for new tests. GET /api/ipt/providers */
  async getInboxPlacementProviders() {
    return this.requireSdkResult(
      await this.sdk.getInboxPlacementProviders(),
      "inbox placement providers"
    );
  }
  /** Supported test types and the default one. GET /api/ipt/test-types */
  async getInboxPlacementTestTypes() {
    return this.requireSdkResult(
      await this.sdk.getInboxPlacementTestTypes(),
      "inbox placement test types"
    );
  }
  /** Create an inbox placement test. POST /api/ipt/test */
  async createInboxPlacementTest(options) {
    return this.requireSdkResult(
      await this.sdk.createInboxPlacementTest(options),
      "create inbox placement test"
    );
  }
  /** A test and its placement results. GET /api/ipt/test/{id} */
  async getInboxPlacementTest(testId) {
    return this.requireSdkResult(
      await this.sdk.getInboxPlacementTest(testId),
      "inbox placement test"
    );
  }
  /** List tests, newest first. GET /api/ipt/tests */
  async listInboxPlacementTests(options) {
    return this.requireSdkResult(
      await this.sdk.listInboxPlacementTests(options),
      "list inbox placement tests"
    );
  }
  /** Delete a finished test. DELETE /api/ipt/test/{id}, which answers with no body. */
  async deleteInboxPlacementTest(testId) {
    const result = await this.sdk.deleteInboxPlacementTest(testId);
    if (result == null || typeof result === "object" && Object.keys(result).length === 0) {
      return { success: true, message: `Inbox placement test ${testId} deleted` };
    }
    return result;
  }
  /** The webhook URL saved on this API key. GET /api/ipt/webhook */
  async getInboxPlacementWebhook() {
    return this.requireSdkResult(
      await this.sdk.getInboxPlacementWebhook(),
      "inbox placement webhook"
    );
  }
  /** Save the URL finished results are posted to. PUT /api/ipt/webhook */
  async setInboxPlacementWebhook(webhookUrl) {
    return this.requireSdkResult(
      await this.sdk.setInboxPlacementWebhook(webhookUrl),
      "set inbox placement webhook"
    );
  }
  /** @deprecated Use sendListEvaluatorFile */
  async evaluateList(fileContent, fileName, emailAddressColumn) {
    await this.sendListEvaluatorFile(fileContent, fileName, emailAddressColumn ?? 0);
    throw new Error(
      "List evaluator is asynchronous; use get_list_evaluator_result with the returned file_id."
    );
  }
};

// src/tools/types.ts
function createSuccessResponse(data) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2)
      }
    ]
  };
}
function createTextResponse(text) {
  return {
    content: [
      {
        type: "text",
        text
      }
    ]
  };
}
function createErrorResponse(error) {
  const errorMessage = formatErrorMessage(error);
  return {
    content: [
      {
        type: "text",
        text: `Error: ${errorMessage}`
      }
    ],
    isError: true
  };
}
function requireString(value, fieldName) {
  if (typeof value !== "string" || !value) {
    throw new Error(`${fieldName} is required and must be a non-empty string`);
  }
  return value;
}
function requireArray(value, fieldName) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${fieldName} is required and must be a non-empty array`);
  }
  return value;
}
function requireStringArray(value, fieldName) {
  const items = requireArray(value, fieldName);
  if (!items.every((item) => typeof item === "string" && item !== "")) {
    throw new Error(`${fieldName} must contain only non-empty strings`);
  }
  return items;
}
function requireNumber(value, fieldName) {
  if (value === null || value === void 0 || value === "") {
    throw new Error(`${fieldName} is required and must be a number`);
  }
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`${fieldName} is required and must be a number`);
  }
  return num;
}
function requireBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw new Error(`${fieldName} is required and must be true or false`);
  }
  return value;
}
function optionalObject(value, fieldName) {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fieldName} must be an object`);
  }
  return value;
}
function optionalString(value, fieldName) {
  if (value === null || value === void 0 || value === "") {
    return void 0;
  }
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  return value;
}
function optionalNumber(value, fieldName) {
  if (value === null || value === void 0 || value === "") {
    return void 0;
  }
  const num = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value.trim()) : NaN;
  if (!Number.isFinite(num)) {
    throw new Error(`${fieldName} must be a number`);
  }
  return num;
}
function optionalBoolean(value, fieldName) {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (value === 1 || value === 0) {
    return value === 1;
  }
  if (typeof value === "string") {
    const text = value.trim().toLowerCase();
    if (text === "true" || text === "false") {
      return text === "true";
    }
  }
  throw new Error(`${fieldName} must be true or false`);
}
var MAX_COLUMN_INDEX = 999;
function optionalColumn(value, fieldName) {
  const num = optionalNumber(value, fieldName);
  if (num === void 0) return void 0;
  if (!Number.isSafeInteger(num) || num < 0 || num > MAX_COLUMN_INDEX) {
    throw new Error(`${fieldName} must be a whole number from 0 to ${MAX_COLUMN_INDEX} (0-based column index)`);
  }
  return num;
}
var MAX_EMAIL_LENGTH = 320;
function assertEmailLength(email, fieldName) {
  if (email.length > MAX_EMAIL_LENGTH) {
    throw new Error(`${fieldName} must be at most ${MAX_EMAIL_LENGTH} characters`);
  }
}
function requireIsoDate(value, fieldName) {
  const text = requireString(value, fieldName);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const date = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : void 0;
  if (!match || !date || date.getUTCFullYear() !== Number(match[1]) || date.getUTCMonth() !== Number(match[2]) - 1 || date.getUTCDate() !== Number(match[3])) {
    throw new Error(`${fieldName} must be a real date in YYYY-MM-DD format`);
  }
  return text;
}

// src/tools/validate-email.ts
var validateEmailTool = {
  definition: {
    name: "validate_email",
    description: "Validate a single email address using ZeroBounce API. Returns detailed validation results including status, sub-status, and additional metadata.",
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "The email address to validate"
        },
        ipAddress: {
          type: "string",
          description: "Optional IP address of the user (helps improve accuracy)"
        },
        timeout: {
          type: "number",
          description: "Validation timeout in seconds (3\u201360)"
        },
        activityData: {
          type: "boolean",
          description: "Include activity data on the validation result"
        },
        verifyPlus: {
          type: "boolean",
          description: "Use Verify+ validation for this request"
        },
        usePost: {
          type: "boolean",
          description: "When true, uses POST /validate with form-encoded body (same parameters as GET)"
        }
      },
      required: ["email"]
    }
  },
  handler: async (client, args) => {
    try {
      const email = requireString(args.email, "email");
      assertEmailLength(email, "email");
      const ipAddress = optionalString(args.ipAddress, "ipAddress");
      const timeout = optionalNumber(args.timeout, "timeout");
      const activityData = optionalBoolean(args.activityData, "activityData");
      const verifyPlus = optionalBoolean(args.verifyPlus, "verifyPlus");
      const usePost = optionalBoolean(args.usePost, "usePost") ?? false;
      const result = await client.validateEmail(email, {
        ipAddress,
        timeout,
        activityData,
        verifyPlus,
        usePost
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/validate-batch.ts
var MAX_BATCH_EMAILS = 200;
var validateBatchTool = {
  definition: {
    name: "validate_batch",
    description: "Validate multiple email addresses in batch. More efficient for validating multiple emails at once.",
    inputSchema: {
      type: "object",
      properties: {
        emails: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of email addresses to validate (at most 200)"
        },
        emailAddressColumn: {
          type: "number",
          description: "Optional 0-based column index when each entry is a CSV row; the email is read from that column. Omit when entries are plain email addresses."
        },
        timeout: {
          type: "number",
          description: "Batch validation timeout in seconds (10\u2013120)"
        },
        activityData: {
          type: "boolean",
          description: "Include activity data on each validation result"
        },
        verifyPlus: {
          type: "boolean",
          description: "Use Verify+ validation for this batch"
        }
      },
      required: ["emails"]
    }
  },
  handler: async (client, args) => {
    try {
      const emails = requireStringArray(args.emails, "emails");
      if (emails.length > MAX_BATCH_EMAILS) {
        throw new Error(`emails must contain at most ${MAX_BATCH_EMAILS} addresses`);
      }
      emails.forEach((email, index) => assertEmailLength(email, `emails[${index}]`));
      const emailAddressColumn = optionalColumn(args.emailAddressColumn, "emailAddressColumn");
      const timeout = optionalNumber(args.timeout, "timeout");
      const activityData = optionalBoolean(args.activityData, "activityData");
      const verifyPlus = optionalBoolean(args.verifyPlus, "verifyPlus");
      const result = await client.validateBatch(emails, {
        emailAddressColumn,
        timeout,
        activityData,
        verifyPlus
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/get-credits.ts
var getCreditsTool = {
  definition: {
    name: "get_credits",
    description: "Get the number of credits remaining in your ZeroBounce account.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  handler: async (client) => {
    try {
      const result = await client.getCredits();
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/get-api-usage.ts
var getApiUsageTool = {
  definition: {
    name: "get_api_usage",
    description: "Get API usage statistics for a date range. Shows validation counts by status and sub-status.",
    inputSchema: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "Start date in YYYY-MM-DD format"
        },
        endDate: {
          type: "string",
          description: "End date in YYYY-MM-DD format"
        }
      },
      required: ["startDate", "endDate"]
    }
  },
  handler: async (client, args) => {
    try {
      const startDate = requireIsoDate(args.startDate, "startDate");
      const endDate = requireIsoDate(args.endDate, "endDate");
      if (startDate > endDate) {
        throw new Error("startDate must not be after endDate");
      }
      const result = await client.getApiUsage(startDate, endDate);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/bulk-file-helpers.ts
function createBulkFileTools(config) {
  const kind = config.description.replace(/^bulk /, "");
  const sendFileProperties = {
    fileContent: {
      type: "string",
      description: "CSV file content as a string"
    },
    fileName: {
      type: "string",
      description: "Name of the file"
    },
    hasHeaderRow: {
      type: "boolean",
      description: "Whether the first row of the file is a header row. Sent as false when not given."
    }
  };
  if (config.supportsReturnUrl !== false) {
    sendFileProperties.returnUrl = {
      type: "string",
      description: "Optional HTTPS callback URL when processing completes. Only use trusted URLs you control; an attacker-controlled URL can receive bulk results."
    };
  }
  if (config.supportsRemoveDuplicate) {
    sendFileProperties.removeDuplicate = {
      type: "boolean",
      description: "Whether to remove duplicate emails (sent as remove_duplicate). Left out, it is sent as false."
    };
  }
  if (config.supportsAllowPhase2) {
    sendFileProperties.allowPhase2 = {
      type: "boolean",
      description: "Whether to allow phase 2 processing (sent as allow_phase_2). Sent only when given."
    };
  }
  if (config.supportsEmailAddressColumn) {
    sendFileProperties.emailAddressColumn = {
      type: "number",
      description: "Column index (0-based) containing email addresses. Defaults to 0 (first column)."
    };
  }
  if (config.supportsDomainColumn) {
    sendFileProperties.domainColumn = {
      type: "number",
      description: "Column index (0-based) containing domain names. Defaults to 0 (first column)."
    };
  }
  if (config.supportsCompanyNameColumn) {
    sendFileProperties.companyNameColumn = {
      type: "number",
      description: "Column index (0-based) containing company names. Defaults to 0 (first column)."
    };
  }
  if (config.supportsFullNameColumn) {
    sendFileProperties.fullNameColumn = {
      type: "number",
      description: "Column index (0-based) containing full name values." + (config.supportsFirstNameColumn ? " Give this or firstNameColumn." : "")
    };
  }
  if (config.supportsFirstNameColumn) {
    sendFileProperties.firstNameColumn = {
      type: "number",
      description: "Column index (0-based) containing first names." + (config.supportsFullNameColumn ? " Give this or fullNameColumn." : "")
    };
  }
  if (config.supportsMiddleNameColumn) {
    sendFileProperties.middleNameColumn = {
      type: "number",
      description: "Column index (0-based) containing middle names."
    };
  }
  if (config.supportsLastNameColumn) {
    sendFileProperties.lastNameColumn = {
      type: "number",
      description: "Column index (0-based) containing last names."
    };
  }
  if (config.supportsGenderColumn) {
    sendFileProperties.genderColumn = {
      type: "number",
      description: "Column index (0-based) containing gender values."
    };
  }
  if (config.supportsIpAddressColumn) {
    sendFileProperties.ipAddressColumn = {
      type: "number",
      description: "Column index (0-based) containing IP addresses."
    };
  }
  const sendFileTool = {
    sdkMethods: config.sdkMethods,
    definition: {
      name: `${config.name}_send_file`,
      description: `Send a CSV file for bulk ${kind}. Returns a file ID for tracking.`,
      inputSchema: {
        type: "object",
        properties: sendFileProperties,
        required: ["fileContent", "fileName"]
      }
    },
    handler: async (client, args) => {
      try {
        const fileContent = requireString(args.fileContent, "fileContent");
        assertBulkFileContentWithinLimit(fileContent);
        const fileName = requireString(args.fileName, "fileName");
        assertSafeFileName(fileName);
        let returnUrl = config.supportsReturnUrl !== false ? optionalString(args.returnUrl, "returnUrl") : void 0;
        if (returnUrl) {
          returnUrl = validateBulkReturnUrl(returnUrl);
        }
        const emailAddressColumn = config.supportsEmailAddressColumn ? optionalColumn(args.emailAddressColumn, "emailAddressColumn") : void 0;
        const domainColumn = config.supportsDomainColumn ? optionalColumn(args.domainColumn, "domainColumn") : void 0;
        const companyNameColumn = config.supportsCompanyNameColumn ? optionalColumn(args.companyNameColumn, "companyNameColumn") : void 0;
        const fullNameColumn = config.supportsFullNameColumn ? optionalColumn(args.fullNameColumn, "fullNameColumn") : void 0;
        const firstNameColumn = config.supportsFirstNameColumn ? optionalColumn(args.firstNameColumn, "firstNameColumn") : void 0;
        const middleNameColumn = config.supportsMiddleNameColumn ? optionalColumn(args.middleNameColumn, "middleNameColumn") : void 0;
        const lastNameColumn = config.supportsLastNameColumn ? optionalColumn(args.lastNameColumn, "lastNameColumn") : void 0;
        const options = {
          hasHeaderRow: optionalBoolean(args.hasHeaderRow, "hasHeaderRow"),
          removeDuplicate: config.supportsRemoveDuplicate ? optionalBoolean(args.removeDuplicate, "removeDuplicate") : void 0,
          genderColumn: config.supportsGenderColumn ? optionalColumn(args.genderColumn, "genderColumn") : void 0,
          ipAddressColumn: config.supportsIpAddressColumn ? optionalColumn(args.ipAddressColumn, "ipAddressColumn") : void 0,
          allowPhase2: config.supportsAllowPhase2 ? optionalBoolean(args.allowPhase2, "allowPhase2") : void 0
        };
        const result = await config.sendFileMethod(
          client,
          fileContent,
          fileName,
          returnUrl,
          emailAddressColumn,
          domainColumn,
          companyNameColumn,
          fullNameColumn,
          firstNameColumn,
          middleNameColumn,
          lastNameColumn,
          options
        );
        return createSuccessResponse(result);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  };
  const fileStatusTool = {
    sdkMethods: config.sdkMethods,
    definition: {
      name: `${config.name}_file_status`,
      description: `Get the status of a bulk ${kind} file upload.`,
      inputSchema: {
        type: "object",
        properties: {
          fileId: {
            type: "string",
            description: `File ID returned from ${config.name}_send_file`
          }
        },
        required: ["fileId"]
      }
    },
    handler: async (client, args) => {
      try {
        const fileId = requireString(args.fileId, "fileId");
        const result = await config.getStatusMethod(client, fileId);
        return createSuccessResponse(result);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  };
  const getFileTool = {
    sdkMethods: config.sdkMethods,
    definition: {
      name: `${config.name}_get_file`,
      description: `Get the results of a completed bulk ${kind} file.`,
      inputSchema: {
        type: "object",
        properties: {
          fileId: {
            type: "string",
            description: `File ID returned from ${config.name}_send_file`
          }
        },
        required: ["fileId"]
      }
    },
    handler: async (client, args) => {
      try {
        const fileId = requireString(args.fileId, "fileId");
        const result = await config.getFileMethod(client, fileId);
        return createSuccessResponse(result);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  };
  const deleteFileTool = {
    sdkMethods: config.sdkMethods,
    definition: {
      name: `${config.name}_delete_file`,
      description: `Delete a bulk ${kind} file from your account.`,
      annotations: { destructiveHint: true, readOnlyHint: false },
      inputSchema: {
        type: "object",
        properties: {
          fileId: {
            type: "string",
            description: "File ID to delete"
          }
        },
        required: ["fileId"]
      }
    },
    handler: async (client, args) => {
      try {
        const fileId = requireString(args.fileId, "fileId");
        const result = await config.deleteFileMethod(client, fileId);
        return createSuccessResponse(result);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  };
  return {
    sendFile: sendFileTool,
    fileStatus: fileStatusTool,
    getFile: getFileTool,
    deleteFile: deleteFileTool
  };
}

// src/tools/bulk-validate.ts
var bulkValidateTools = createBulkFileTools({
  name: "bulk_validate",
  description: "email validation",
  sendFileMethod: (client, fileContent, fileName, returnUrl, emailAddressColumn, _domainColumn, _companyNameColumn, _fullNameColumn, firstNameColumn, _middleNameColumn, lastNameColumn, options) => client.bulkValidateSendFile(fileContent, fileName, returnUrl, emailAddressColumn, {
    ...options,
    firstNameColumn,
    lastNameColumn
  }),
  getStatusMethod: (client, fileId) => client.bulkValidateFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkValidateGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkValidateDeleteFile(fileId),
  supportsEmailAddressColumn: true,
  supportsFirstNameColumn: true,
  supportsLastNameColumn: true,
  supportsGenderColumn: true,
  supportsIpAddressColumn: true,
  supportsRemoveDuplicate: true,
  supportsAllowPhase2: true
});

// src/tools/bulk-ai-scoring.ts
var bulkAIScoringTools = createBulkFileTools({
  name: "bulk_ai_scoring",
  description: "AI email scoring",
  sendFileMethod: (client, fileContent, fileName, returnUrl, emailAddressColumn, _domainColumn, _companyNameColumn, _fullNameColumn, _firstNameColumn, _middleNameColumn, _lastNameColumn, options) => client.bulkAIScoringSendFile(fileContent, fileName, returnUrl, emailAddressColumn, {
    hasHeaderRow: options?.hasHeaderRow,
    removeDuplicate: options?.removeDuplicate
  }),
  getStatusMethod: (client, fileId) => client.bulkAIScoringFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkAIScoringGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkAIScoringDeleteFile(fileId),
  supportsEmailAddressColumn: true,
  supportsRemoveDuplicate: true
});

// src/tools/score-email.ts
var scoreEmailTool = {
  sdkMethods: ["scoreEmail"],
  definition: {
    name: "score_email",
    description: "Real-time AI scoring for a single email address (ZeroBounce GET or POST /v2/scoring). Returns email and numeric score.",
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email address to score"
        },
        usePost: {
          type: "boolean",
          description: "When true, uses POST with form-encoded api_key and email"
        }
      },
      required: ["email"]
    }
  },
  handler: async (client, args) => {
    try {
      const email = requireString(args.email, "email");
      const usePost = optionalBoolean(args.usePost, "usePost") ?? false;
      const result = await client.scoreEmail(email, { usePost });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/find-email.ts
var findEmailTool = {
  definition: {
    name: "find_email",
    description: "Find an email address by person name and domain or company name.",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Domain to search for email addresses"
        },
        firstName: {
          type: "string",
          description: "First name of the person (required)"
        },
        middleName: {
          type: "string",
          description: "Middle name of the person"
        },
        lastName: {
          type: "string",
          description: "Last name of the person"
        },
        company: {
          type: "string",
          description: "Company name"
        }
      },
      required: ["firstName"]
    }
  },
  handler: async (client, args) => {
    try {
      const domain = optionalString(args.domain, "domain");
      const firstName = optionalString(args.firstName, "firstName");
      const middleName = optionalString(args.middleName, "middleName");
      const lastName = optionalString(args.lastName, "lastName");
      const company = optionalString(args.company, "company");
      if (!firstName) {
        throw new Error('"firstName" is required');
      }
      if (!domain && !company) {
        throw new Error('Either "domain" or "company" is required');
      }
      const result = await client.findEmail({
        domain,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        company
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/domain-search.ts
var domainSearchTool = {
  definition: {
    name: "domain_search",
    description: "Get the likely email address format for a domain or company (Domain Search API).",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Domain to look up (e.g. example.com)"
        },
        company: {
          type: "string",
          description: "Company name to look up (alternative to domain)"
        }
      },
      required: []
    }
  },
  handler: async (client, args) => {
    try {
      const domain = optionalString(args.domain, "domain");
      const company = optionalString(args.company, "company");
      if (!domain && !company) {
        throw new Error('Either "domain" or "company" is required');
      }
      const result = await client.domainSearch({ domain, company });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/activity-data.ts
var getActivityDataTool = {
  definition: {
    name: "get_activity_data",
    description: "Get activity data for an email address to see if it has been active recently.",
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email address to get activity data for"
        }
      },
      required: ["email"]
    }
  },
  handler: async (client, args) => {
    try {
      const email = requireString(args.email, "email");
      const result = await client.getActivityData(email);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/bulk-email-finder.ts
var bulkEmailFinderTools = createBulkFileTools({
  name: "bulk_email_finder",
  description: "bulk email finder",
  sendFileMethod: (client, fileContent, fileName, _returnUrl, _emailCol, domainColumn, _c, full, first, middle, last, options) => client.bulkEmailFinderSendFile(fileContent, fileName, domainColumn ?? 0, {
    fullNameColumn: full,
    firstNameColumn: first,
    middleNameColumn: middle,
    lastNameColumn: last,
    hasHeaderRow: options?.hasHeaderRow
  }),
  getStatusMethod: (client, fileId) => client.bulkEmailFinderFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkEmailFinderGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkEmailFinderDeleteFile(fileId),
  sdkMethods: [
    "sendEmailFinderFileStream",
    "getEmailFinderFileStatus",
    "getEmailFinderFile",
    "deleteEmailFinderFile"
  ],
  // The email finder sendfile endpoint takes no return_url.
  supportsReturnUrl: false,
  supportsDomainColumn: true,
  // The API needs a name to work from: firstNameColumn or fullNameColumn.
  supportsFullNameColumn: true,
  supportsFirstNameColumn: true,
  supportsMiddleNameColumn: true,
  supportsLastNameColumn: true
});

// src/tools/bulk-domain-search.ts
var bulkDomainSearchTools = createBulkFileTools({
  name: "bulk_domain_search",
  description: "bulk domain search",
  sendFileMethod: (client, fileContent, fileName, _returnUrl, _emailCol, domainColumn, _c, _full, _first, _middle, _last, options) => client.bulkDomainSearchSendFile(fileContent, fileName, domainColumn ?? 0, options?.hasHeaderRow),
  getStatusMethod: (client, fileId) => client.bulkDomainSearchFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkDomainSearchGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkDomainSearchDeleteFile(fileId),
  sdkMethods: [
    "sendDomainSearchFileStream",
    "getDomainSearchFileStatus",
    "getDomainSearchFile",
    "deleteDomainSearchFile"
  ],
  // The domain search sendfile endpoint takes no return_url.
  supportsReturnUrl: false,
  supportsDomainColumn: true
});

// src/tools/list-evaluator.ts
var listEvaluatorSendFileTool = {
  sdkMethods: ["sendListEvaluatorFileStream"],
  definition: {
    name: "list_evaluator_send_file",
    description: "Upload a CSV for list evaluator (bulkapi listevaluator)",
    inputSchema: {
      type: "object",
      properties: {
        fileContent: { type: "string", description: "CSV file content" },
        fileName: { type: "string", description: "File name" },
        emailAddressColumn: {
          type: "number",
          description: "0-based column index for email addresses"
        }
      },
      required: ["fileContent", "fileName"]
    }
  },
  handler: async (client, args) => {
    try {
      const fileContent = requireString(args.fileContent, "fileContent");
      assertBulkFileContentWithinLimit(fileContent);
      const fileName = requireString(args.fileName, "fileName");
      assertSafeFileName(fileName);
      const emailAddressColumn = optionalColumn(args.emailAddressColumn, "emailAddressColumn") ?? 0;
      const result = await client.sendListEvaluatorFile(fileContent, fileName, emailAddressColumn);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var listEvaluatorResultTool = {
  sdkMethods: ["getListEvaluatorResult"],
  definition: {
    name: "list_evaluator_result",
    description: "Get list evaluator job status/result by file_id",
    inputSchema: {
      type: "object",
      properties: {
        fileId: { type: "string", description: "File ID from send_file" }
      },
      required: ["fileId"]
    }
  },
  handler: async (client, args) => {
    try {
      const fileId = requireString(args.fileId, "fileId");
      const result = await client.getListEvaluatorResult(fileId);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var sendEvaluatedFileTool = {
  sdkMethods: ["sendEvaluatedFile"],
  definition: {
    name: "send_evaluated_file",
    description: "Submit a finished list evaluation for bulk validation (POST /send-evaluated-file/). Takes the List Evaluator file_id, not a file upload. Returns the new validation job.",
    inputSchema: {
      type: "object",
      properties: {
        fileId: {
          type: "string",
          description: "file_id returned by list_evaluator_send_file"
        }
      },
      required: ["fileId"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.sendEvaluatedFile(requireString(args.fileId, "fileId"));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/filters.ts
var addFilterTool = {
  sdkMethods: ["addFilter"],
  definition: {
    name: "add_filter",
    description: "Add a custom allow/block list filter",
    inputSchema: {
      type: "object",
      properties: {
        rule: { type: "string" },
        target: { type: "string" },
        value: { type: "string" }
      },
      required: ["rule", "target", "value"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.addFilter(
        requireString(args.rule, "rule"),
        requireString(args.target, "target"),
        requireString(args.value, "value")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var listFiltersTool = {
  sdkMethods: ["listFilters"],
  definition: {
    name: "list_filters",
    description: "List custom filters (GET by default; set usePost for POST)",
    inputSchema: {
      type: "object",
      properties: {
        usePost: { type: "boolean" }
      }
    }
  },
  handler: async (client, args) => {
    try {
      const usePost = optionalBoolean(args.usePost, "usePost") ?? false;
      const result = await client.listFilters(usePost);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var deleteFilterTool = {
  sdkMethods: ["deleteFilter"],
  definition: {
    name: "delete_filter",
    description: "Delete a custom filter",
    inputSchema: {
      type: "object",
      properties: {
        rule: { type: "string" },
        target: { type: "string" },
        value: { type: "string" }
      },
      required: ["rule", "target", "value"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.deleteFilter(
        requireString(args.rule, "rule"),
        requireString(args.target, "target"),
        requireString(args.value, "value")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/bulk-root-job-helpers.ts
function createBulkRootJobTool(config) {
  const location = config.source === "S3" ? "Path/key of the object in your configured S3 bucket" : "Path of the file on your configured SFTP/FTP server";
  return {
    sdkMethods: config.sdkMethods,
    definition: {
      name: config.name,
      description: `Submit a file from your ${config.source} storage for ${config.description} (POST /${config.endpoint}). The server and bucket come from your ZeroBounce settings.`,
      inputSchema: {
        type: "object",
        properties: {
          fileName: { type: "string", description: location },
          returnUrl: {
            type: "string",
            description: "HTTPS callback URL notified when the job completes. Required: the API refuses a job without one. Only use trusted URLs you control; an attacker-controlled URL can receive bulk results."
          },
          hasHeaderRow: {
            type: "boolean",
            description: "Whether the first row is a header row. Defaults to false."
          },
          removeDuplicates: {
            type: "boolean",
            description: "Whether to drop duplicate rows before processing."
          }
        },
        required: ["fileName", "returnUrl"]
      }
    },
    handler: async (client, args) => {
      try {
        const fileName = requireString(args.fileName, "fileName");
        assertSafeFileName(fileName);
        const returnUrl = validateBulkReturnUrl(requireString(args.returnUrl, "returnUrl"));
        const result = await config.jobMethod(client, {
          fileName,
          returnUrl,
          hasHeaderRow: optionalBoolean(args.hasHeaderRow, "hasHeaderRow") ?? false,
          removeDuplicates: optionalBoolean(args.removeDuplicates, "removeDuplicates")
        });
        return createSuccessResponse(result);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  };
}

// src/tools/s3-bulk.ts
var listS3FilesTool = {
  sdkMethods: ["listS3files"],
  definition: {
    name: "list_s3_files",
    description: "List S3 bucket files available for validation or scoring (GET /listS3files)",
    inputSchema: {
      type: "object",
      properties: {
        bucket: { type: "string", description: "Input bucket (optional if configured in UI)" },
        search: { type: "string", description: "Filter results by file name" }
      }
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.listS3Files({
        bucket: optionalString(args.bucket, "bucket"),
        search: optionalString(args.search, "search")
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var validateS3FileTool = createBulkRootJobTool({
  name: "validate_s3_file",
  endpoint: "validateS3file",
  description: "bulk validation",
  source: "S3",
  sdkMethods: ["validateS3file"],
  jobMethod: (client, request) => client.validateS3File(request)
});
var scoreS3FileTool = createBulkRootJobTool({
  name: "score_s3_file",
  endpoint: "scoreS3file",
  description: "bulk AI scoring",
  source: "S3",
  sdkMethods: ["scoreS3file", "_bulkRootFileJob"],
  jobMethod: (client, request) => client.scoreS3File(request)
});
var emailFinderS3FileTool = createBulkRootJobTool({
  name: "email_finder_s3_file",
  endpoint: "emailFinderS3file",
  description: "bulk email finder",
  source: "S3",
  sdkMethods: ["emailFinderS3file"],
  jobMethod: (client, request) => client.emailFinderS3File(request)
});
var domainSearchS3FileTool = createBulkRootJobTool({
  name: "domain_search_s3_file",
  endpoint: "domainSearchS3file",
  description: "bulk domain search",
  source: "S3",
  sdkMethods: ["domainSearchS3file"],
  jobMethod: (client, request) => client.domainSearchS3File(request)
});
var exportS3FileTool = {
  sdkMethods: ["exportS3file", "_sendBulkRootFormPost"],
  definition: {
    name: "export_s3_file",
    description: "Export a completed bulk job to an S3 bucket (POST /exportS3file)",
    inputSchema: {
      type: "object",
      properties: {
        fileId: { type: "string", description: "File ID of the completed bulk job" },
        exportBucket: {
          type: "string",
          description: "Destination bucket. Optional: without it the output bucket configured on your ZeroBounce account is used."
        }
      },
      required: ["fileId"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.exportS3File(
        requireString(args.fileId, "fileId"),
        optionalString(args.exportBucket, "exportBucket")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/sftp-bulk.ts
var validateSftpFileTool = createBulkRootJobTool({
  name: "validate_sftp_file",
  endpoint: "validateSFTPfile",
  description: "bulk validation",
  source: "SFTP/FTP",
  sdkMethods: ["validateSFTPfile"],
  jobMethod: (client, request) => client.validateSftpFile(request)
});
var scoreSftpFileTool = createBulkRootJobTool({
  name: "score_sftp_file",
  endpoint: "scoreSFTPfile",
  description: "bulk AI scoring",
  source: "SFTP/FTP",
  sdkMethods: ["scoreSFTPfile"],
  jobMethod: (client, request) => client.scoreSftpFile(request)
});
var emailFinderSftpFileTool = createBulkRootJobTool({
  name: "email_finder_sftp_file",
  endpoint: "emailFinderSFTPfile",
  description: "bulk email finder",
  source: "SFTP/FTP",
  sdkMethods: ["emailFinderSFTPfile"],
  jobMethod: (client, request) => client.emailFinderSftpFile(request)
});
var domainSearchSftpFileTool = createBulkRootJobTool({
  name: "domain_search_sftp_file",
  endpoint: "domainSearchSFTPfile",
  description: "bulk domain search",
  source: "SFTP/FTP",
  sdkMethods: ["domainSearchSFTPfile"],
  jobMethod: (client, request) => client.domainSearchSftpFile(request)
});
var exportSftpFileTool = {
  sdkMethods: ["exportSFTPfile"],
  definition: {
    name: "export_sftp_file",
    description: "Export a completed bulk job back to your SFTP/FTP server (POST /exportSFTPfile)",
    inputSchema: {
      type: "object",
      properties: {
        fileId: { type: "string", description: "File ID of the completed bulk job" },
        exportPath: {
          type: "string",
          description: "Destination path on the server. Optional: without it the export path configured on your ZeroBounce account is used."
        }
      },
      required: ["fileId"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.exportSftpFile(
        requireString(args.fileId, "fileId"),
        optionalString(args.exportPath, "exportPath")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/inbox-placement.ts
var MAX_TEST_NAME_LENGTH = 64;
var TEST_TYPES = [1, 2, 3];
var TEST_STATUSES = ["running", "finished"];
var MIN_PAGE_SIZE = 1;
var MAX_PAGE_SIZE = 100;
function requireTestId(value, fieldName = "testId") {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return requireString(value, fieldName).trim();
}
function optionalIdArray(value, fieldName) {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array of ids`);
  }
  return value.map((item, index) => {
    const id = optionalNumber(item, `${fieldName}[${index}]`);
    if (id === void 0 || !Number.isInteger(id)) {
      throw new Error(`${fieldName}[${index}] must be an integer id`);
    }
    return id;
  });
}
function optionalProviderSelections(value) {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (!Array.isArray(value)) {
    throw new Error("providers must be an array of { id, maxSeeds } objects");
  }
  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`providers[${index}] must be an object with an id`);
    }
    const entry = item;
    const id = optionalNumber(entry.id, `providers[${index}].id`);
    if (id === void 0 || !Number.isInteger(id)) {
      throw new Error(`providers[${index}].id must be an integer id`);
    }
    const maxSeeds = optionalNumber(entry.maxSeeds, `providers[${index}].maxSeeds`);
    if (maxSeeds !== void 0 && (!Number.isInteger(maxSeeds) || maxSeeds < 1)) {
      throw new Error(`providers[${index}].maxSeeds must be an integer of at least 1`);
    }
    return maxSeeds === void 0 ? { id } : { id, maxSeeds };
  });
}
function requireWebhookUrl(value, fieldName = "webhookUrl") {
  const webhookUrl = requireString(value, fieldName);
  return validateBulkReturnUrl(webhookUrl, fieldName);
}
var getInboxPlacementProvidersTool = {
  sdkMethods: ["getInboxPlacementProviders"],
  definition: {
    name: "get_inbox_placement_providers",
    description: "List the seed providers (mailbox providers and their seed addresses) available for inbox placement tests (GET /api/ipt/providers)",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  handler: async (client) => {
    try {
      const result = await client.getInboxPlacementProviders();
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var getInboxPlacementTestTypesTool = {
  sdkMethods: ["getInboxPlacementTestTypes"],
  definition: {
    name: "get_inbox_placement_test_types",
    description: "List the supported inbox placement test types and which one is the default (GET /api/ipt/test-types)",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  handler: async (client) => {
    try {
      const result = await client.getInboxPlacementTestTypes();
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var createInboxPlacementTestTool = {
  sdkMethods: ["createInboxPlacementTest"],
  definition: {
    name: "create_inbox_placement_test",
    description: "Start an inbox placement test: ZeroBounce returns seed addresses to send your campaign to, then reports where each copy landed (POST /api/ipt/test)",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: `Unique test name, at most ${MAX_TEST_NAME_LENGTH} characters`
        },
        testType: {
          type: "number",
          enum: [1, 2, 3],
          description: "1 = Email (requires senderEmail), 2 = Unique ID, 3 = Auto Alias"
        },
        senderEmail: {
          type: "string",
          description: "The From address to match. Required when testType is 1."
        },
        providerIds: {
          type: "array",
          items: { type: "number" },
          description: "Use every active seed of these providers (ids from get_inbox_placement_providers)"
        },
        seedIds: {
          type: "array",
          items: { type: "number" },
          description: "Use these specific seed mailboxes"
        },
        providers: {
          type: "array",
          description: "Per-provider seed caps",
          items: {
            type: "object",
            properties: {
              id: { type: "number", description: "Provider id" },
              maxSeeds: { type: "number", description: "Seed cap for this provider, at least 1" }
            },
            required: ["id"]
          }
        },
        webhookUrl: {
          type: "string",
          description: "HTTPS URL the finished result is posted to"
        }
      },
      required: ["name"]
    }
  },
  handler: async (client, args) => {
    try {
      const name = requireString(args.name, "name");
      if (name.length > MAX_TEST_NAME_LENGTH) {
        throw new Error(`name must be at most ${MAX_TEST_NAME_LENGTH} characters`);
      }
      const testType = optionalNumber(args.testType, "testType");
      if (testType !== void 0 && !TEST_TYPES.includes(testType)) {
        throw new Error(`testType must be one of ${TEST_TYPES.join(", ")}`);
      }
      const senderEmail = optionalString(args.senderEmail, "senderEmail");
      if (testType === 1 && !senderEmail) {
        throw new Error("senderEmail is required when testType is 1");
      }
      const options = { name };
      if (testType !== void 0) {
        options.testType = testType;
      }
      if (senderEmail) {
        options.senderEmail = senderEmail;
      }
      const providerIds = optionalIdArray(args.providerIds, "providerIds");
      if (providerIds) {
        options.providerIds = providerIds;
      }
      const seedIds = optionalIdArray(args.seedIds, "seedIds");
      if (seedIds) {
        options.seedIds = seedIds;
      }
      const providers = optionalProviderSelections(args.providers);
      if (providers) {
        options.providers = providers;
      }
      if (args.webhookUrl !== null && args.webhookUrl !== void 0) {
        options.webhookUrl = requireWebhookUrl(args.webhookUrl);
      }
      const result = await client.createInboxPlacementTest(options);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var getInboxPlacementTestTool = {
  sdkMethods: ["getInboxPlacementTest"],
  definition: {
    name: "get_inbox_placement_test",
    description: "Get one inbox placement test and its results: inbox, spam, and missing counts per provider (GET /api/ipt/test/{id})",
    inputSchema: {
      type: "object",
      properties: {
        testId: { type: "string", description: "Test id from create_inbox_placement_test" }
      },
      required: ["testId"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.getInboxPlacementTest(requireTestId(args.testId, "testId"));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var listInboxPlacementTestsTool = {
  sdkMethods: ["listInboxPlacementTests"],
  definition: {
    name: "list_inbox_placement_tests",
    description: "List inbox placement tests, newest first (GET /api/ipt/tests)",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["running", "finished"],
          description: "Only tests in this state"
        },
        createdAfter: {
          type: "string",
          description: "ISO 8601 date or datetime; only tests created at or after it"
        },
        createdBefore: {
          type: "string",
          description: "ISO 8601 date or datetime; only tests created at or before it"
        },
        page: { type: "number", description: "Page number, from 1" },
        pageSize: {
          type: "number",
          description: `Tests per page, ${MIN_PAGE_SIZE} to ${MAX_PAGE_SIZE} (sent as page_size)`
        }
      }
    }
  },
  handler: async (client, args) => {
    try {
      const options = {};
      const status = optionalString(args.status, "status");
      if (status !== void 0) {
        if (!TEST_STATUSES.includes(status)) {
          throw new Error(`status must be one of ${TEST_STATUSES.join(", ")}`);
        }
        options.status = status;
      }
      const createdAfter = optionalString(args.createdAfter, "createdAfter");
      if (createdAfter !== void 0) {
        options.createdAfter = createdAfter;
      }
      const createdBefore = optionalString(args.createdBefore, "createdBefore");
      if (createdBefore !== void 0) {
        options.createdBefore = createdBefore;
      }
      const page = optionalNumber(args.page, "page");
      if (page !== void 0) {
        if (!Number.isInteger(page) || page < 1) {
          throw new Error("page must be an integer of at least 1");
        }
        options.page = page;
      }
      const pageSize = optionalNumber(args.pageSize, "pageSize");
      if (pageSize !== void 0) {
        if (!Number.isInteger(pageSize) || pageSize < MIN_PAGE_SIZE || pageSize > MAX_PAGE_SIZE) {
          throw new Error(
            `pageSize must be an integer between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}`
          );
        }
        options.pageSize = pageSize;
      }
      const result = await client.listInboxPlacementTests(options);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var deleteInboxPlacementTestTool = {
  sdkMethods: ["deleteInboxPlacementTest"],
  definition: {
    name: "delete_inbox_placement_test",
    description: "Delete a finished inbox placement test. A running test cannot be deleted. (DELETE /api/ipt/test/{id})",
    inputSchema: {
      type: "object",
      properties: {
        testId: { type: "string", description: "Test id to delete" }
      },
      required: ["testId"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.deleteInboxPlacementTest(requireTestId(args.testId, "testId"));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var getInboxPlacementWebhookTool = {
  sdkMethods: ["getInboxPlacementWebhook"],
  definition: {
    name: "get_inbox_placement_webhook",
    description: "Get the webhook URL finished inbox placement results are posted to for this API key (GET /api/ipt/webhook)",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  handler: async (client) => {
    try {
      const result = await client.getInboxPlacementWebhook();
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var setInboxPlacementWebhookTool = {
  sdkMethods: ["setInboxPlacementWebhook"],
  definition: {
    name: "set_inbox_placement_webhook",
    description: "Save the webhook URL finished inbox placement results are posted to for this API key (PUT /api/ipt/webhook)",
    inputSchema: {
      type: "object",
      properties: {
        webhookUrl: { type: "string", description: "HTTPS URL to post finished results to" }
      },
      required: ["webhookUrl"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.setInboxPlacementWebhook(requireWebhookUrl(args.webhookUrl));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var inboxPlacementTools = {
  providers: getInboxPlacementProvidersTool,
  testTypes: getInboxPlacementTestTypesTool,
  createTest: createInboxPlacementTestTool,
  getTest: getInboxPlacementTestTool,
  listTests: listInboxPlacementTestsTool,
  deleteTest: deleteInboxPlacementTestTool,
  getWebhook: getInboxPlacementWebhookTool,
  setWebhook: setInboxPlacementWebhookTool
};

// src/tools/warmup/sending-accounts.ts
var warmupListSendingAccountsTool = {
  requiresWarmupKey: true,
  warmupMethods: ["listSendingAccounts"],
  definition: {
    name: "warmup_list_sending_accounts",
    description: "List every ZeroBounce Warmup sending account belonging to the Warmup key's team.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  handler: async (client) => {
    try {
      return createSuccessResponse(await client.warmup.listSendingAccounts());
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupGetSendingAccountTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getSendingAccount"],
  definition: {
    name: "warmup_get_sending_account",
    description: "Get one ZeroBounce Warmup sending account by its from-address.",
    inputSchema: {
      type: "object",
      properties: {
        fromAddress: { type: "string", description: "The account from-address" }
      },
      required: ["fromAddress"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.getSendingAccount(
        requireString(args.fromAddress, "fromAddress")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupAddSendingAccountTool = {
  requiresWarmupKey: true,
  warmupMethods: ["addSendingAccount"],
  definition: {
    name: "warmup_add_sending_account",
    description: 'Add a from-address to ZeroBounce Warmup. "self_managed" runs your own mailbox and requires engagementRuleId (0-4). "zb_managed" has ZeroBounce provision the mailbox and takes emailContent and managedSending instead; it rejects engagementRuleId.',
    inputSchema: {
      type: "object",
      properties: {
        fromAddress: { type: "string", description: "The from-address to warm up" },
        onboardingModel: {
          type: "string",
          enum: ["self_managed", "zb_managed"],
          description: "Who runs the mailbox"
        },
        engagementRuleId: {
          type: "number",
          description: "Standard engagement rule, 0-4 (0 Default, 1 Slow Pace, 2 Repair, 3 Boost, 4 Protect). Required for self_managed."
        },
        ignoreConflict: {
          type: "boolean",
          description: "Accept the address even if it conflicts with an existing one"
        },
        emailContent: {
          type: "object",
          description: "zb_managed only: company_name, company_website, company_description, types_of_emails (transactional/newsletter/marketing), example_email"
        },
        managedSending: {
          type: "object",
          description: "zb_managed only: weekdays_only, timezone, timezone_offset (-11 to 14), warmup_start_date (YYYY-MM-DD)"
        }
      },
      required: ["fromAddress", "onboardingModel"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.addSendingAccount({
        fromAddress: requireString(args.fromAddress, "fromAddress"),
        onboardingModel: requireString(args.onboardingModel, "onboardingModel"),
        engagementRuleId: optionalNumber(args.engagementRuleId, "engagementRuleId") ?? null,
        ignoreConflict: optionalBoolean(args.ignoreConflict, "ignoreConflict") ?? null,
        emailContent: optionalObject(args.emailContent, "emailContent") ?? null,
        managedSending: optionalObject(args.managedSending, "managedSending") ?? null
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupUpdateSendingAccountTool = {
  requiresWarmupKey: true,
  warmupMethods: ["updateSendingAccount"],
  definition: {
    name: "warmup_update_sending_account",
    description: "Update a ZeroBounce Warmup sending account's engagement rule, status and auto-enable flag.",
    inputSchema: {
      type: "object",
      properties: {
        fromAddress: { type: "string", description: "The account from-address" },
        engagementRuleId: { type: "number", description: "Standard engagement rule, 0-4" },
        statusId: { type: "number", description: "Status, 0-8 (4 Paused, 5 Disabled)" },
        autoEnable: {
          type: "boolean",
          description: "Accepted as true only for an account that is not active"
        }
      },
      required: ["fromAddress", "engagementRuleId", "statusId", "autoEnable"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.updateSendingAccount({
        fromAddress: requireString(args.fromAddress, "fromAddress"),
        engagementRuleId: requireNumber(args.engagementRuleId, "engagementRuleId"),
        statusId: requireNumber(args.statusId, "statusId"),
        autoEnable: requireBoolean(args.autoEnable, "autoEnable")
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupDeleteSendingAccountTool = {
  requiresWarmupKey: true,
  warmupMethods: ["deleteSendingAccount"],
  definition: {
    name: "warmup_delete_sending_account",
    description: "Remove a sending account from ZeroBounce Warmup. Destructive: the account and its warmup history are deleted.",
    inputSchema: {
      type: "object",
      properties: {
        fromAddress: { type: "string", description: "The account from-address" }
      },
      required: ["fromAddress"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.deleteSendingAccount(
        requireString(args.fromAddress, "fromAddress")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupChangeFromAddressTool = {
  requiresWarmupKey: true,
  warmupMethods: ["changeFromAddress"],
  definition: {
    name: "warmup_change_from_address",
    description: "Move a ZeroBounce Warmup account and its history to a new from-address. Despite the underlying /smtp-credentials path, no SMTP credentials are stored.",
    inputSchema: {
      type: "object",
      properties: {
        oldFromAddress: { type: "string", description: "The current from-address" },
        newFromAddress: { type: "string", description: "The replacement from-address" }
      },
      required: ["oldFromAddress", "newFromAddress"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.changeFromAddress(
        requireString(args.oldFromAddress, "oldFromAddress"),
        requireString(args.newFromAddress, "newFromAddress")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupListFromAddressesTool = {
  requiresWarmupKey: true,
  warmupMethods: ["listFromAddresses"],
  definition: {
    name: "warmup_list_from_addresses",
    description: "List the from-addresses registered with ZeroBounce Warmup.",
    inputSchema: {
      type: "object",
      properties: {
        searchFrom: {
          type: "string",
          description: "Filter text. Letters, digits and . - _ @ + only."
        },
        offset: { type: "number", description: "Non-negative offset; the API defaults to 0" },
        limit: { type: "number", description: "Page size; the API defaults to 100" }
      }
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.listFromAddresses({
        searchFrom: optionalString(args.searchFrom, "searchFrom") ?? null,
        offset: optionalNumber(args.offset, "offset") ?? null,
        limit: optionalNumber(args.limit, "limit") ?? null
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/warmup/engagement.ts
var warmupGetEngagementRulesTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getEngagementRules"],
  definition: {
    name: "warmup_get_engagement_rules",
    description: "List the ZeroBounce Warmup engagement rule catalogue: -1 Custom, 0 Default, 1 Slow Pace, 2 Repair, 3 Boost, 4 Protect.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  handler: async (client) => {
    try {
      return createSuccessResponse(await client.warmup.getEngagementRules());
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupSetEngagementRuleTool = {
  requiresWarmupKey: true,
  warmupMethods: ["setEngagementRule"],
  definition: {
    name: "warmup_set_engagement_rule",
    description: "Set a standard ZeroBounce Warmup engagement rule (0-4) on an address.",
    inputSchema: {
      type: "object",
      properties: {
        cFrom: { type: "string", description: "The warmup address identifier (c_from)" },
        ruleId: { type: "number", description: "Standard engagement rule, 0-4" }
      },
      required: ["cFrom", "ruleId"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.setEngagementRule(
        requireString(args.cFrom, "cFrom"),
        requireNumber(args.ruleId, "ruleId")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupGetCustomEngagementTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getCustomEngagement"],
  definition: {
    name: "warmup_get_custom_engagement",
    description: "Get an address's custom ZeroBounce Warmup engagement rule, including can_update and remaining_seconds of the update cooldown.",
    inputSchema: {
      type: "object",
      properties: {
        cFrom: { type: "string", description: "The warmup address identifier (c_from)" }
      },
      required: ["cFrom"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.getCustomEngagement(requireString(args.cFrom, "cFrom"));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupCreateCustomEngagementTool = {
  requiresWarmupKey: true,
  warmupMethods: ["createCustomEngagement"],
  definition: {
    name: "warmup_create_custom_engagement",
    description: "Create a custom ZeroBounce Warmup engagement rule. Starts a 7-day cooldown before the rule can be updated again.",
    inputSchema: {
      type: "object",
      properties: {
        cFrom: { type: "string", description: "The warmup address identifier (c_from)" },
        replyPct: { type: "number", description: "Reply percentage, 5-45" },
        importantPct: { type: "number", description: "Mark-as-important percentage, 5-40" },
        clickPct: {
          type: "number",
          description: "Click percentage, 0-70 and at most importantPct x 1.75"
        }
      },
      required: ["cFrom", "replyPct", "importantPct", "clickPct"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.createCustomEngagement({
        cFrom: requireString(args.cFrom, "cFrom"),
        replyPct: requireNumber(args.replyPct, "replyPct"),
        importantPct: requireNumber(args.importantPct, "importantPct"),
        clickPct: requireNumber(args.clickPct, "clickPct")
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupUpdateCustomEngagementTool = {
  requiresWarmupKey: true,
  warmupMethods: ["updateCustomEngagement"],
  definition: {
    name: "warmup_update_custom_engagement",
    description: "Update a custom ZeroBounce Warmup engagement rule. During the 7-day cooldown the API answers with HTTP 429.",
    inputSchema: {
      type: "object",
      properties: {
        cFrom: { type: "string", description: "The warmup address identifier (c_from)" },
        replyPct: { type: "number", description: "Reply percentage, 5-45" },
        importantPct: { type: "number", description: "Mark-as-important percentage, 5-40" },
        clickPct: {
          type: "number",
          description: "Click percentage, 0-70 and at most importantPct x 1.75"
        }
      },
      required: ["cFrom", "replyPct", "importantPct", "clickPct"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.updateCustomEngagement({
        cFrom: requireString(args.cFrom, "cFrom"),
        replyPct: requireNumber(args.replyPct, "replyPct"),
        importantPct: requireNumber(args.importantPct, "importantPct"),
        clickPct: requireNumber(args.clickPct, "clickPct")
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupDeleteCustomEngagementTool = {
  requiresWarmupKey: true,
  warmupMethods: ["deleteCustomEngagement"],
  definition: {
    name: "warmup_delete_custom_engagement",
    description: "Delete a custom ZeroBounce Warmup engagement rule and fall back to a standard rule (1-4).",
    inputSchema: {
      type: "object",
      properties: {
        cFrom: { type: "string", description: "The warmup address identifier (c_from)" },
        engagementRuleId: {
          type: "number",
          description: "Standard rule to fall back to, 1-4"
        }
      },
      required: ["cFrom", "engagementRuleId"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.deleteCustomEngagement(
        requireString(args.cFrom, "cFrom"),
        requireNumber(args.engagementRuleId, "engagementRuleId")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/warmup/insights.ts
var warmupGetSeedsTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getSeeds"],
  definition: {
    name: "warmup_get_seeds",
    description: "List the ZeroBounce Warmup seed accounts.",
    inputSchema: { type: "object", properties: {} }
  },
  handler: async (client) => {
    try {
      return createSuccessResponse(await client.warmup.getSeeds());
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupDownloadSeedsTool = {
  requiresWarmupKey: true,
  warmupMethods: ["downloadSeeds"],
  definition: {
    name: "warmup_download_seeds",
    description: "Download the ZeroBounce Warmup seed list as CSV text (columns seed,provider). Returns the CSV itself, not JSON.",
    inputSchema: { type: "object", properties: {} }
  },
  handler: async (client) => {
    try {
      return createTextResponse(await client.warmup.downloadSeeds());
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupGetSeedCountTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getSeedCount"],
  definition: {
    name: "warmup_get_seed_count",
    description: "Get the number of ZeroBounce Warmup seed accounts.",
    inputSchema: { type: "object", properties: {} }
  },
  handler: async (client) => {
    try {
      return createSuccessResponse(await client.warmup.getSeedCount());
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupGetProgressTodayTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getProgressToday"],
  definition: {
    name: "warmup_get_progress_today",
    description: "Get today's ZeroBounce Warmup progress.",
    inputSchema: { type: "object", properties: {} }
  },
  handler: async (client) => {
    try {
      return createSuccessResponse(await client.warmup.getProgressToday());
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupGetSentTodayTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getSentToday"],
  definition: {
    name: "warmup_get_sent_today",
    description: "Get the number of ZeroBounce Warmup messages sent today.",
    inputSchema: { type: "object", properties: {} }
  },
  handler: async (client) => {
    try {
      return createSuccessResponse(await client.warmup.getSentToday());
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupGetEmailsPerDayTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getEmailsPerDay"],
  definition: {
    name: "warmup_get_emails_per_day",
    description: "Get the current ZeroBounce Warmup daily sending volume.",
    inputSchema: { type: "object", properties: {} }
  },
  handler: async (client) => {
    try {
      return createSuccessResponse(await client.warmup.getEmailsPerDay());
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupGetStatisticsTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getStatistics"],
  definition: {
    name: "warmup_get_statistics",
    description: "Get ZeroBounce Warmup statistics for a from-address. An address with no history returns zeros.",
    inputSchema: {
      type: "object",
      properties: {
        fromAddress: { type: "string", description: "The account from-address" }
      },
      required: ["fromAddress"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.getStatistics(
        requireString(args.fromAddress, "fromAddress")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupGetStatisticsPerDayTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getStatisticsPerDay"],
  definition: {
    name: "warmup_get_statistics_per_day",
    description: "Get daily ZeroBounce Warmup statistics between two dates, inclusive.",
    inputSchema: {
      type: "object",
      properties: {
        fromAddress: { type: "string", description: "The account from-address" },
        startDate: { type: "string", description: "Start date, YYYY-MM-DD" },
        endDate: { type: "string", description: "End date, YYYY-MM-DD" }
      },
      required: ["fromAddress", "startDate", "endDate"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.getStatisticsPerDay({
        fromAddress: requireString(args.fromAddress, "fromAddress"),
        startDate: requireString(args.startDate, "startDate"),
        endDate: requireString(args.endDate, "endDate")
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupGetStatisticsDetailedTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getStatisticsDetailed"],
  definition: {
    name: "warmup_get_statistics_detailed",
    description: "Get detailed ZeroBounce Warmup statistics for an address.",
    inputSchema: {
      type: "object",
      properties: {
        cFrom: { type: "string", description: "The warmup address identifier (c_from)" }
      },
      required: ["cFrom"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.getStatisticsDetailed(requireString(args.cFrom, "cFrom"));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupDownloadStatisticsTool = {
  requiresWarmupKey: true,
  warmupMethods: ["downloadStatistics"],
  definition: {
    name: "warmup_download_statistics",
    description: "Download an address's ZeroBounce Warmup statistics as CSV text. Returns the CSV itself, not JSON.",
    inputSchema: {
      type: "object",
      properties: {
        cFrom: { type: "string", description: "The warmup address identifier (c_from)" }
      },
      required: ["cFrom"]
    }
  },
  handler: async (client, args) => {
    try {
      const csv = await client.warmup.downloadStatistics(requireString(args.cFrom, "cFrom"));
      return createTextResponse(csv);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupGetFromAddressStatisticsTool = {
  requiresWarmupKey: true,
  warmupMethods: ["getFromAddressStatistics"],
  definition: {
    name: "warmup_get_from_address_statistics",
    description: "Get ZeroBounce Warmup statistics for one from-address.",
    inputSchema: {
      type: "object",
      properties: {
        fromAddress: { type: "string", description: "The account from-address" }
      },
      required: ["fromAddress"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.getFromAddressStatistics(
        requireString(args.fromAddress, "fromAddress")
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/warmup/diagnostics.ts
var warmupCheckDomainDmarcTool = {
  requiresWarmupKey: true,
  warmupMethods: ["checkDomainDmarc"],
  definition: {
    name: "warmup_check_domain_dmarc",
    description: "Check the SPF, DKIM and DMARC records of a from-address's domain. fromAddress must be a full email address such as sender@example.com: the live API rejects a bare domain, although the public docs describe one.",
    inputSchema: {
      type: "object",
      properties: {
        fromAddress: {
          type: "string",
          description: "An email address, not a bare domain (e.g. sender@example.com)"
        },
        dkimSelector: { type: "string", description: "DKIM selector to look up" }
      },
      required: ["fromAddress"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.checkDomainDmarc(
        requireString(args.fromAddress, "fromAddress"),
        optionalString(args.dkimSelector, "dkimSelector") ?? null
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};
var warmupTestSmtpConfigurationTool = {
  requiresWarmupKey: true,
  warmupMethods: ["testSmtpConfiguration"],
  definition: {
    name: "warmup_test_smtp_configuration",
    description: "Check that SMTP credentials connect and hand off a message. Nothing is stored, and the test message goes to a ZeroBounce test recipient rather than fromAddress. The live API answers a failed SMTP login with HTTP 500; the username and password are masked in every error from this call.",
    inputSchema: {
      type: "object",
      properties: {
        fromAddress: { type: "string", description: "The from-address being configured" },
        username: { type: "string", description: "SMTP username" },
        password: { type: "string", description: "SMTP password" },
        server: { type: "string", description: "SMTP server hostname" },
        port: { type: "number", description: "SMTP port, 1-65535" }
      },
      required: ["fromAddress", "username", "password", "server", "port"]
    }
  },
  handler: async (client, args) => {
    try {
      const result = await client.warmup.testSmtpConfiguration({
        fromAddress: requireString(args.fromAddress, "fromAddress"),
        username: requireString(args.username, "username"),
        password: requireString(args.password, "password"),
        server: requireString(args.server, "server"),
        port: requireNumber(args.port, "port")
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/warmup/index.ts
var warmupTools = [
  // Sending accounts (49-55)
  warmupListSendingAccountsTool,
  warmupGetSendingAccountTool,
  warmupAddSendingAccountTool,
  warmupUpdateSendingAccountTool,
  warmupDeleteSendingAccountTool,
  warmupChangeFromAddressTool,
  warmupListFromAddressesTool,
  // Engagement rules (56-61)
  warmupGetEngagementRulesTool,
  warmupSetEngagementRuleTool,
  warmupGetCustomEngagementTool,
  warmupCreateCustomEngagementTool,
  warmupUpdateCustomEngagementTool,
  warmupDeleteCustomEngagementTool,
  // Seeds, progress and statistics (62-72)
  warmupGetSeedsTool,
  warmupDownloadSeedsTool,
  warmupGetSeedCountTool,
  warmupGetProgressTodayTool,
  warmupGetSentTodayTool,
  warmupGetEmailsPerDayTool,
  warmupGetStatisticsTool,
  warmupGetStatisticsPerDayTool,
  warmupGetStatisticsDetailedTool,
  warmupDownloadStatisticsTool,
  warmupGetFromAddressStatisticsTool,
  // Diagnostics (73-74)
  warmupCheckDomainDmarcTool,
  warmupTestSmtpConfigurationTool
];

// src/tools/index.ts
function listTools() {
  return [
    // Validation
    validateEmailTool,
    validateBatchTool,
    // Account
    getCreditsTool,
    getApiUsageTool,
    // Bulk Validation
    bulkValidateTools.sendFile,
    bulkValidateTools.fileStatus,
    bulkValidateTools.getFile,
    bulkValidateTools.deleteFile,
    // AI Scoring
    bulkAIScoringTools.sendFile,
    bulkAIScoringTools.fileStatus,
    bulkAIScoringTools.getFile,
    bulkAIScoringTools.deleteFile,
    scoreEmailTool,
    // Email Finder
    findEmailTool,
    // Domain Search
    domainSearchTool,
    // Activity Data
    getActivityDataTool,
    bulkEmailFinderTools.sendFile,
    bulkEmailFinderTools.fileStatus,
    bulkEmailFinderTools.getFile,
    bulkEmailFinderTools.deleteFile,
    bulkDomainSearchTools.sendFile,
    bulkDomainSearchTools.fileStatus,
    bulkDomainSearchTools.getFile,
    bulkDomainSearchTools.deleteFile,
    listEvaluatorSendFileTool,
    listEvaluatorResultTool,
    sendEvaluatedFileTool,
    addFilterTool,
    listFiltersTool,
    deleteFilterTool,
    listS3FilesTool,
    validateS3FileTool,
    scoreS3FileTool,
    emailFinderS3FileTool,
    domainSearchS3FileTool,
    exportS3FileTool,
    ...warmupTools,
    // Inbox Placement Tester
    inboxPlacementTools.providers,
    inboxPlacementTools.testTypes,
    inboxPlacementTools.createTest,
    inboxPlacementTools.getTest,
    inboxPlacementTools.listTests,
    inboxPlacementTools.deleteTest,
    inboxPlacementTools.getWebhook,
    inboxPlacementTools.setWebhook,
    // SFTP/FTP bulk
    validateSftpFileTool,
    scoreSftpFileTool,
    emailFinderSftpFileTool,
    domainSearchSftpFileTool,
    exportSftpFileTool
  ];
}
function getAllTools(availability = {}) {
  return listTools().filter((tool) => {
    if (!(tool.sdkMethods ?? []).every(isSdkMethodAvailable)) return false;
    if (!(tool.warmupMethods ?? []).every(isWarmupMethodAvailable)) return false;
    if (tool.requiresWarmupKey && !availability.warmupConfigured) return false;
    return true;
  });
}
function getToolRegistry(availability = {}) {
  const registry = /* @__PURE__ */ new Map();
  const allTools = getAllTools(availability);
  for (const tool of allTools) {
    registry.set(tool.definition.name, tool.handler);
  }
  return registry;
}

// src/server.ts
var SERVER_VERSION = true ? "0.3.1" : "0.0.0-dev";
var ZeroBounceMCPServer = class {
  server;
  client;
  // The keys are not kept on this object: it is inspectable, and the client
  // holds its key privately. Only what the config resource reports is kept.
  config;
  constructor(config) {
    this.config = {
      baseUrl: config.baseUrl,
      warmupBaseUrl: config.warmupBaseUrl,
      apiKeyConfigured: !!config.apiKey,
      warmupApiKeyConfigured: !!config.warmupApiKey
    };
    this.client = new ZeroBounceClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      warmupApiKey: config.warmupApiKey,
      warmupBaseUrl: config.warmupBaseUrl
    });
    this.server = new Server(
      {
        name: "zerobounce-mcp",
        version: SERVER_VERSION
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );
    this.setupHandlers();
  }
  setupHandlers() {
    const availability = { warmupConfigured: this.client.hasWarmup };
    const allTools = getAllTools(availability);
    const toolRegistry = getToolRegistry(availability);
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: allTools.map((tool) => tool.definition)
    }));
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const handler = toolRegistry.get(name);
      if (!handler) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Unknown tool: ${name}`
            }
          ],
          isError: true
        };
      }
      const secrets = this.client.secretsForCall(args || {});
      return withSecrets(secrets, async () => {
        let result;
        try {
          result = await handler(this.client, args || {});
        } catch (error) {
          result = createErrorResponse(error);
        }
        return {
          ...result,
          content: result.content.map(
            (item) => item.type === "text" ? { ...item, text: redactResultText(item.text, secrets) } : item
          )
        };
      });
    });
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: "zerobounce://config",
          name: "ZeroBounce Configuration",
          description: "Current ZeroBounce API configuration",
          mimeType: "application/json"
        }
      ]
    }));
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      if (uri === "zerobounce://config") {
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  baseUrl: this.config.baseUrl,
                  apiKeyConfigured: this.config.apiKeyConfigured,
                  warmupBaseUrl: this.config.warmupBaseUrl,
                  warmupApiKeyConfigured: this.config.warmupApiKeyConfigured
                },
                null,
                2
              )
            }
          ]
        };
      }
      throw new Error(`Unknown resource: ${uri}`);
    });
  }
  async connect(transport) {
    await this.server.connect(transport);
  }
  async close() {
    await this.server.close();
  }
};

// src/index.ts
var API_KEY_HEADER = "x-zerobounce-api-key";
var WARMUP_API_KEY_HEADER = "x-zerobounce-warmup-api-key";
var DEFAULT_API_BASE_URL = "https://api.zerobounce.net/v2";
var REGIONAL_API_BASE_URLS = {
  default: DEFAULT_API_BASE_URL,
  us: "https://api-us.zerobounce.net/v2",
  eu: "https://api-eu.zerobounce.net/v2"
};
function authorityHasUserinfo(raw) {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.username || parsed.password) return true;
  const afterScheme = raw.trim().replace(/^https?:/i, "");
  const authority = afterScheme.replace(/^[/\\]+/, "").split(/[/\\?#]/)[0] || "";
  return authority.includes("@");
}
function requireExplicitHttpsBase(raw, label) {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`Invalid ${label}. Use an https:// URL.`);
  }
  if (authorityHasUserinfo(raw)) {
    throw new Error(`The ${label} must not contain a username or password.`);
  }
  if (parsed.search || parsed.hash || raw.includes("?") || raw.includes("#")) {
    throw new Error(`The ${label} must not contain a query string or a fragment.`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`The ${label} must use https.`);
  }
  return raw.replace(/\/+$/, "");
}
function resolveApiBaseUrl(value) {
  const raw = value?.trim();
  if (!raw) return DEFAULT_API_BASE_URL;
  const region = REGIONAL_API_BASE_URLS[raw.toLowerCase()];
  if (region) return region;
  try {
    return requireExplicitHttpsBase(raw, "API URL");
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid API URL")) throw error;
    if (!(error instanceof Error) || !error.message.startsWith("Invalid ")) throw error;
    throw new Error("Invalid API URL. Use us, eu, or an https:// URL.");
  }
}
function resolveWarmupBaseUrl(value) {
  const raw = value?.trim();
  if (!raw) return DEFAULT_WARMUP_BASE_URL;
  try {
    return requireExplicitHttpsBase(raw, "Warmup API URL");
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid Warmup API URL")) throw error;
    if (!(error instanceof Error) || !error.message.startsWith("Invalid ")) throw error;
    throw new Error("Invalid Warmup API URL. Use an https:// URL.");
  }
}
function isInvisibleChar(code) {
  return code === 173 || code === 847 || code >= 1536 && code <= 1541 || code === 2192 || code === 2193 || code === 1564 || code === 1757 || code === 1807 || code === 2274 || code === 4447 || code === 4448 || code === 6068 || code === 6069 || code >= 6155 && code <= 6159 || code >= 8203 && code <= 8207 || code >= 8234 && code <= 8238 || code >= 8288 && code <= 8303 || code === 10240 || code === 12644 || code >= 65024 && code <= 65039 || code === 65279 || code === 65440 || code >= 65520 && code <= 65531 || code === 69821 || code === 69837 || code >= 78896 && code <= 78911 || code >= 113824 && code <= 113827 || code >= 119155 && code <= 119162 || code >= 917504 && code <= 921599;
}
function assertSafeApiKey(key, label) {
  const message = `${label} must not contain control characters or invisible characters.`;
  if (key !== key.trim()) throw new Error(message);
  let onlyMarks = true;
  for (const char of key) {
    const code = char.codePointAt(0) ?? 0;
    if (code <= 31 || code >= 127 && code <= 159) throw new Error(message);
    if (code >= 55296 && code <= 57343) throw new Error(message);
    if (char !== " " && /\s/u.test(char)) throw new Error(message);
    if (isInvisibleChar(code)) throw new Error(message);
    if (!/\p{M}/u.test(char)) onlyMarks = false;
  }
  if (onlyMarks) throw new Error(message);
}
async function runStdio(config) {
  const server = new ZeroBounceMCPServer(config);
  await server.connect(new StdioServerTransport());
  console.error(
    `ZeroBounce MCP server running on stdio${config.warmupApiKey ? " (Warmup tools enabled)" : ""}`
  );
}
function isHttpWhitespace(char) {
  const code = char.charCodeAt(0);
  return code === 9 || code === 10 || code === 11 || code === 12 || code === 13 || code === 32 || code === 160 || code === 5760 || code === 8232 || code === 8233 || code === 8239 || code === 8287 || code === 12288 || code === 65279 || code >= 8192 && code <= 8202;
}
function bearerToken(authorization) {
  const scheme = "bearer";
  if (authorization.length <= scheme.length) return "";
  if (authorization.slice(0, scheme.length).toLowerCase() !== scheme) return "";
  let index = scheme.length;
  if (!isHttpWhitespace(authorization[index])) return "";
  while (index < authorization.length && isHttpWhitespace(authorization[index])) {
    index += 1;
  }
  if (index >= authorization.length) return "";
  return authorization.slice(index).trim();
}
function headerCount(req, name) {
  let count = 0;
  for (let i = 0; i < req.rawHeaders.length; i += 2) {
    if (req.rawHeaders[i]?.toLowerCase() === name) count += 1;
  }
  return count;
}
function headerValue(req, name) {
  const header = req.headers[name];
  const value = Array.isArray(header) ? header[0] : header;
  return value?.trim() ?? "";
}
function getRequestApiKey(req) {
  if (headerCount(req, API_KEY_HEADER) > 1 || headerCount(req, "authorization") > 1 || headerCount(req, WARMUP_API_KEY_HEADER) > 1) {
    throw new RequestError("Duplicate credential headers are not allowed.");
  }
  const value = headerValue(req, API_KEY_HEADER);
  const authorization = req.headers.authorization;
  const bearer = typeof authorization === "string" ? bearerToken(authorization) : "";
  if (value && bearer && value !== bearer) {
    throw new RequestError("Conflicting API keys in X-ZeroBounce-Api-Key and Authorization.");
  }
  return value || bearer;
}
var RequestError = class extends Error {
};
function getRequestWarmupApiKey(req) {
  return headerValue(req, WARMUP_API_KEY_HEADER);
}
function sendJsonRpcError(res, status, message) {
  res.writeHead(status, { "Content-Type": "application/json" }).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32e3, message },
      id: null
    })
  );
}
async function handleMcpRequest(req, res, baseUrl, warmupBaseUrl) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJsonRpcError(res, 405, "Method not allowed.");
    return;
  }
  let apiKey;
  try {
    apiKey = getRequestApiKey(req);
  } catch (error) {
    sendJsonRpcError(res, 400, formatErrorMessage(error));
    return;
  }
  if (!apiKey) {
    sendJsonRpcError(
      res,
      401,
      `ZeroBounce API key is required. Send it in the X-ZeroBounce-Api-Key header or as Authorization: Bearer <key>.`
    );
    return;
  }
  try {
    assertSafeApiKey(apiKey, "ZeroBounce API key");
    const warmupKey = getRequestWarmupApiKey(req);
    if (warmupKey) assertSafeApiKey(warmupKey, "ZeroBounce Warmup API key");
  } catch (error) {
    sendJsonRpcError(res, 401, formatErrorMessage(error));
    return;
  }
  const server = new ZeroBounceMCPServer({
    apiKey,
    baseUrl,
    warmupApiKey: getRequestWarmupApiKey(req) || void 0,
    warmupBaseUrl
  });
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: void 0,
    maxRequestBodySize: HTTP_MAX_REQUEST_BODY_BYTES
  });
  res.on("close", () => {
    void transport.close();
    void server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res);
}
var LOOPBACK_NAMES = ["localhost", "127.0.0.1", "::1"];
function hostnameOf(value) {
  const text = value.trim().toLowerCase();
  let host;
  if (text.startsWith("[")) {
    const end = text.indexOf("]");
    if (end < 0) return void 0;
    host = text.slice(1, end);
    if (text.slice(end + 1) !== "" && !/^:\d{1,5}$/.test(text.slice(end + 1))) return void 0;
  } else {
    const parts = text.split(":");
    if (parts.length > 2) return void 0;
    host = parts[0] ?? "";
    if (parts.length === 2 && !/^\d{1,5}$/.test(parts[1] ?? "")) return void 0;
  }
  host = host.replace(/\.+$/, "");
  return host || void 0;
}
function buildAllowedHosts(bindHost, extra) {
  const bind = hostnameOf(bindHost) ?? bindHost.toLowerCase();
  const wildcard = bind === "0.0.0.0" || bind === "::";
  const names = /* @__PURE__ */ new Set();
  for (const name of extra) {
    const host = hostnameOf(name);
    if (host) names.add(host);
  }
  if (LOOPBACK_NAMES.includes(bind)) {
    for (const name of LOOPBACK_NAMES) names.add(name);
  } else if (!wildcard) {
    names.add(bind);
  } else if (names.size === 0) {
    return null;
  }
  return names;
}
function hostAndOriginAllowed(req, allowed) {
  const hostHeader = req.headers.host;
  if (allowed) {
    const host = typeof hostHeader === "string" ? hostnameOf(hostHeader) : void 0;
    if (!host || !allowed.has(host)) return false;
  }
  const origin = req.headers.origin;
  if (origin === void 0) return true;
  if (typeof origin !== "string") return false;
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  if (allowed) {
    const originHost = hostnameOf(parsed.host);
    return originHost !== void 0 && allowed.has(originHost);
  }
  return typeof hostHeader === "string" && parsed.host.toLowerCase() === hostHeader.trim().toLowerCase();
}
function requestPath(target) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) return void 0;
  const end = target.search(/[?#]/);
  return end < 0 ? target : target.slice(0, end);
}
async function runHttp(host, port, baseUrl, warmupBaseUrl, allowedHostNames = []) {
  const allowedHosts = buildAllowedHosts(host, allowedHostNames);
  if (!allowedHosts) {
    console.error(
      "Warning: Host header is not restricted (wildcard bind without MCP_ALLOWED_HOSTS or --allowed-host). Set the public host name to enable DNS-rebinding protection."
    );
  }
  const httpServer = createServer((req, res) => {
    try {
      const pathname = requestPath(req.url);
      if (pathname === void 0) {
        res.writeHead(400, { "Content-Type": "application/json" }).end('{"error":"Bad request target."}');
        return;
      }
      if (pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" }).end('{"status":"ok"}');
        return;
      }
      if (pathname !== "/mcp") {
        res.writeHead(404).end();
        return;
      }
      if (!hostAndOriginAllowed(req, allowedHosts)) {
        sendJsonRpcError(res, 403, "Forbidden: Host or Origin is not allowed.");
        return;
      }
      handleMcpRequest(req, res, baseUrl, warmupBaseUrl).catch((error) => {
        console.error("Error handling MCP request:", formatErrorMessage(error));
        if (!res.headersSent) {
          sendJsonRpcError(res, 500, "Internal server error.");
        }
      });
    } catch (error) {
      console.error("Error routing request:", formatErrorMessage(error));
      try {
        if (!res.headersSent) res.writeHead(500).end();
        else res.end();
      } catch {
        res.destroy();
      }
    }
  });
  httpServer.headersTimeout = 15e3;
  httpServer.requestTimeout = 12e4;
  httpServer.keepAliveTimeout = 5e3;
  httpServer.maxConnections = 512;
  await new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, host, resolve);
  });
  console.error(`ZeroBounce MCP server listening on http://${host}:${port}/mcp`);
}
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    apiKey: "",
    warmupApiKey: "",
    transport: process.env.MCP_TRANSPORT?.trim() === "http" ? "http" : "stdio",
    // Loopback by default; hosted deployments must opt in to 0.0.0.0 explicitly.
    host: process.env.MCP_HOST?.trim() || "127.0.0.1",
    port: Number(process.env.PORT) || 3e3,
    allowedHosts: (process.env.MCP_ALLOWED_HOSTS ?? "").split(",").map((name) => name.trim()).filter(Boolean),
    baseUrl: resolveApiBaseUrl(process.env.ZEROBOUNCE_API_URL),
    warmupBaseUrl: resolveWarmupBaseUrl(process.env.ZEROBOUNCE_WARMUP_API_URL)
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    if (arg === "--api-key" || arg === "-k") {
      if (nextArg) {
        config.apiKey = nextArg;
        i++;
      } else {
        throw new Error("--api-key requires a value");
      }
    } else if (arg.startsWith("--api-key=")) {
      config.apiKey = arg.slice("--api-key=".length);
    } else if (arg === "--warmup-api-key") {
      if (nextArg) {
        config.warmupApiKey = nextArg;
        i++;
      } else {
        throw new Error("--warmup-api-key requires a value");
      }
    } else if (arg.startsWith("--warmup-api-key=")) {
      config.warmupApiKey = arg.slice("--warmup-api-key=".length);
    } else if (arg === "--warmup-url") {
      if (nextArg) {
        config.warmupBaseUrl = resolveWarmupBaseUrl(nextArg);
        i++;
      } else {
        throw new Error("--warmup-url requires a value");
      }
    } else if (arg.startsWith("--warmup-url=")) {
      config.warmupBaseUrl = resolveWarmupBaseUrl(arg.slice("--warmup-url=".length));
    } else if (arg === "--allowed-host") {
      if (nextArg) {
        config.allowedHosts.push(nextArg);
        i++;
      } else {
        throw new Error("--allowed-host requires a value");
      }
    } else if (arg.startsWith("--allowed-host=")) {
      config.allowedHosts.push(arg.slice("--allowed-host=".length));
    } else if (arg === "--http") {
      config.transport = "http";
    } else if (arg === "--port") {
      if (nextArg) {
        config.port = Number(nextArg);
        i++;
      } else {
        throw new Error("--port requires a value");
      }
    } else if (arg.startsWith("--port=")) {
      config.port = Number(arg.slice("--port=".length));
    } else if (arg === "--host") {
      if (nextArg) {
        config.host = nextArg;
        i++;
      } else {
        throw new Error("--host requires a value");
      }
    } else if (arg.startsWith("--host=")) {
      config.host = arg.slice("--host=".length);
    } else if (arg === "--url") {
      if (nextArg) {
        config.baseUrl = resolveApiBaseUrl(nextArg);
        i++;
      } else {
        throw new Error("--url requires a value");
      }
    } else if (arg.startsWith("--url=")) {
      config.baseUrl = resolveApiBaseUrl(arg.slice("--url=".length));
    } else {
      throw new Error(`Unknown argument: ${arg.startsWith("-") ? arg.split("=")[0] : "unexpected positional argument"}. Run with --help for the options.`);
    }
  }
  if (!Number.isInteger(config.port) || config.port <= 0) {
    throw new Error("--port must be a positive integer");
  }
  if (config.transport === "http") {
    const loopback = config.host === "127.0.0.1" || config.host === "::1" || config.host === "localhost";
    if (!loopback && process.env.MCP_TLS_TERMINATED !== "true") {
      throw new Error("Non-loopback HTTP binding requires MCP_TLS_TERMINATED=true and a trusted TLS-terminating proxy.");
    }
    return config;
  }
  if (!config.apiKey) {
    config.apiKey = process.env.ZEROBOUNCE_API_KEY?.trim() ?? "";
  }
  if (!config.warmupApiKey) {
    config.warmupApiKey = process.env.ZEROBOUNCE_WARMUP_API_KEY?.trim() ?? "";
  }
  if (!config.apiKey) {
    throw new Error(
      "ZeroBounce API key is required. Provide it via the --api-key flag or the ZEROBOUNCE_API_KEY environment variable."
    );
  }
  assertSafeApiKey(config.apiKey, "ZeroBounce API key");
  if (config.warmupApiKey) assertSafeApiKey(config.warmupApiKey, "ZeroBounce Warmup API key");
  return config;
}
var HELP_TEXT = `ZeroBounce MCP server

Usage: zerobounce-mcp [options]

Options:
  -k, --api-key <key>        ZeroBounce API key (or ZEROBOUNCE_API_KEY)
      --warmup-api-key <key> ZeroBounce Warmup API key, enables the Warmup tools (or ZEROBOUNCE_WARMUP_API_KEY)
      --url <url>            ZeroBounce API base URL (or ZEROBOUNCE_API_URL)
      --warmup-url <url>     Warmup API base URL (or ZEROBOUNCE_WARMUP_API_URL)
      --http                 Serve MCP over HTTP instead of stdio (or MCP_TRANSPORT=http)
      --port <port>          HTTP port, default 3000 (or PORT)
      --host <host>          HTTP bind address, default 127.0.0.1 (or MCP_HOST)
      --allowed-host <name>  Host name accepted in HTTP mode besides the bind address; repeatable (or MCP_ALLOWED_HOSTS, comma-separated)
  -h, --help                 Show this help and exit
  -v, --version              Show the version and exit

Unknown options are refused. In HTTP mode the API key comes from each request
(X-ZeroBounce-Api-Key or Authorization: Bearer), not from the command line.
`;
function handleInfoFlags(args) {
  const valueFlags = /* @__PURE__ */ new Set(["--api-key", "-k", "--warmup-api-key", "--warmup-url", "--port", "--host", "--url", "--allowed-host"]);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (valueFlags.has(arg)) {
      if (args[i + 1]?.startsWith("--")) throw new Error(`${arg} requires a value`);
      i++;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(HELP_TEXT);
      return true;
    }
    if (arg === "--version" || arg === "-v") {
      process.stdout.write(`${true ? "0.3.1" : "0.0.0-dev"}
`);
      return true;
    }
  }
  return false;
}
async function main() {
  try {
    if (handleInfoFlags(process.argv.slice(2))) return;
    const config = parseArgs();
    if (config.transport === "http") {
      await runHttp(config.host, config.port, config.baseUrl, config.warmupBaseUrl, config.allowedHosts);
    } else {
      await runStdio({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        warmupApiKey: config.warmupApiKey || void 0,
        warmupBaseUrl: config.warmupBaseUrl
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
}
main().catch((error) => {
  console.error("Fatal error:", formatErrorMessage(error));
  process.exit(1);
});

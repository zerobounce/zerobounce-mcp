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
      const e = { d: (t2, i2) => {
        if (Array.isArray(i2)) for (var r2 = 0; r2 < i2.length; ) {
          var n2 = i2[r2++], a2 = i2[r2++];
          e.o(t2, n2) ? 0 === a2 && r2++ : 0 === a2 ? Object.defineProperty(t2, n2, { enumerable: true, value: i2[r2++] }) : Object.defineProperty(t2, n2, { enumerable: true, get: a2 });
        }
        else for (var n2 in i2) e.o(i2, n2) && !e.o(t2, n2) && Object.defineProperty(t2, n2, { enumerable: true, get: i2[n2] });
      }, o: (e2, t2) => Object.prototype.hasOwnProperty.call(e2, t2) };
      let t = {};
      e.d(t, { default: () => H });
      const i = { Accept: "*/*", "Accept-Encoding": "gzip, deflate, br", Connection: "keep-alive" };
      class r extends Error {
        constructor(e2, t2 = 0) {
          super(e2), this.name = "ZBApiError", this.statusCode = t2;
        }
      }
      function n(e2, t2 = 0) {
        return new r(e2, t2);
      }
      function a(e2, t2 = "apiBaseURL") {
        if ("string" != typeof e2 || !/^https:\/\//i.test(e2)) throw new Error(`ZeroBounce: ${t2} must be an https:// URL`);
        return e2;
      }
      function s(e2, t2 = "api key") {
        if ("string" != typeof e2 || !e2.trim()) throw new Error(`ZeroBounce: ${t2} parameter is missing.`);
        if (e2 !== e2.trim() || /[\u0000-\u001f\u007f]/.test(e2)) throw new Error(`ZeroBounce: ${t2} has surrounding whitespace or control characters.`);
        return e2;
      }
      function o(e2, t2 = []) {
        let i2 = String(e2);
        for (const e3 of t2) if (e3) for (const t3 of [e3, encodeURIComponent(e3), escape(e3)]) t3 && (i2 = i2.split(t3).join("***"));
        return i2.replace(/([?&](?:api_key|API-Key)=)[^&\s"']+/gi, "$1***");
      }
      function l() {
        if ("undefined" != typeof AbortSignal && "function" == typeof AbortSignal.timeout) return AbortSignal.timeout(12e4);
      }
      function u(e2, t2) {
        const i2 = e2[t2];
        return null != i2 && ("string" == typeof i2 ? "" !== i2.trim() : !!Array.isArray(i2) && i2.some((e3) => "string" == typeof e3 && "" !== e3.trim()));
      }
      function d() {
        return "undefined" != typeof window && "undefined" != typeof document && "function" == typeof document.createElement;
      }
      function _(e2) {
        return e2 && "number" == typeof e2.status ? e2.status : 200;
      }
      function c(e2) {
        return e2 && e2.headers && "function" == typeof e2.headers.get ? String(e2.headers.get("content-type") || "").toLowerCase() : "";
      }
      function m(e2) {
        const t2 = String(e2).slice(0, 2e3).toLowerCase();
        return t2.includes("<!doctype html") || t2.includes("<html") || t2.includes("<head") || t2.includes("<body");
      }
      function p(e2) {
        let t2 = String(e2).trim();
        for (; ; ) if (t2.startsWith("Error:")) t2 = t2.slice(6).trim();
        else {
          if (!t2.startsWith("[Error]:")) return t2;
          t2 = t2.slice(8).trim();
        }
      }
      function f(e2) {
        if (!e2 || "object" != typeof e2 || Array.isArray(e2)) return null;
        if (Array.isArray(e2.errors)) {
          for (const t3 of e2.errors) if (t3 && "all" === String(t3.email_address || "").toLowerCase()) return p(("string" == typeof t3.error ? t3.error.trim() : "") || "Invalid API Key or your account ran out of credits");
        }
        return "string" == typeof e2.error && (t2 = e2.error, /invalid api key|api_key is invalid|ran out of credits|out of credits/i.test(t2)) ? p(e2.error.trim()) : null;
        var t2;
      }
      function h(e2, t2) {
        const i2 = String(e2).trim();
        if (!i2) return `Empty response from ZeroBounce (HTTP ${t2})`;
        if (m(e2)) {
          const t3 = (function(e3) {
            const t4 = String(e3).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            return t4 ? t4[1].replace(/\s+/g, " ").trim() : "";
          })(e2);
          return t3 ? `ZeroBounce returned an HTML error page ("${t3}") instead of an API response.` : "ZeroBounce returned an HTML error page instead of an API response.";
        }
        if (i2.startsWith("{") || i2.startsWith("[")) try {
          const e3 = JSON.parse(i2), t3 = (function(e4) {
            return !e4 || "object" != typeof e4 || Array.isArray(e4) || "string" != typeof e4.title ? null : (e4.title.includes("Access denied") || e4.title.includes("1020")) && true === e4.cloudflare_error ? e4.title : null;
          })(e3);
          if (t3) return t3;
          const r2 = f(e3);
          if (r2) return r2;
          const n2 = (function(e4) {
            if (Array.isArray(e4)) {
              const t4 = e4.find((e5) => "string" == typeof e5 && e5.trim());
              return t4 ? t4.trim() : null;
            }
            if (!e4 || "object" != typeof e4) return null;
            for (const t4 of ["error", "message", "error_message", "detail"]) {
              const i3 = e4[t4];
              if ("string" == typeof i3 && i3.trim()) return i3.trim();
              if (Array.isArray(i3) && i3.length) {
                const e5 = i3.filter((e6) => "string" == typeof e6 && e6.trim());
                if (e5.length) return e5.join("; ");
                const t5 = i3[0];
                if (t5 && "object" == typeof t5 && t5.msg) {
                  const e6 = Array.isArray(t5.loc) ? t5.loc.slice(1).join(".") : "";
                  return e6 ? `${e6}: ${t5.msg}` : String(t5.msg);
                }
              }
            }
            return null;
          })(e3);
          return n2 ? p(n2) : "ZeroBounce returned an unexpected response.";
        } catch {
          return "ZeroBounce returned a response that is not valid JSON.";
        }
        return i2.length > 1e3 ? "ZeroBounce returned a response that is not valid JSON." : p(i2) || `Empty response from ZeroBounce (HTTP ${t2})`;
      }
      function y(e2, t2 = []) {
        const i2 = e2 && e2.name ? e2.name : "Error", r2 = e2 && e2.message ? e2.message : String(e2);
        return new Error(o(`${i2}: ${r2}`, t2));
      }
      const g = ["api-eu.zerobounce.net", "api-us.zerobounce.net"];
      function b(e2) {
        try {
          return new URL(String(e2)).hostname.toLowerCase();
        } catch {
          return "";
        }
      }
      function S(e2, t2, i2) {
        const r2 = _(t2), a2 = c(t2);
        if (m(e2) || a2.includes("text/html") || r2 >= 400) throw n(h(e2, r2), r2);
        if (!String(e2).trim()) throw n(`Empty response from ZeroBounce (HTTP ${r2})`, r2);
        const s2 = e2.trim();
        if (a2.includes("application/json") || s2.startsWith("{") || s2.startsWith("[")) try {
          const t3 = JSON.parse(e2);
          if ((function(e3) {
            return !(!e3 || "object" != typeof e3 || Array.isArray(e3)) && (!(!(t4 = e3) || "object" != typeof t4 || Array.isArray(t4) || !(Object.prototype.hasOwnProperty.call(t4, "success") && null != t4.success && (false === t4.success || "False" === t4.success || "false" === t4.success) || u(t4, "message") || u(t4, "error") || u(t4, "error_message"))) || Object.prototype.hasOwnProperty.call(e3, "success"));
            var t4;
          })(t3)) return t3;
        } catch {
          throw n("ZeroBounce returned a response that is not valid JSON.", r2);
        }
        return d() ? (function(e3, t3) {
          if (!d()) throw new Error("saveFile is only available in browser environments");
          if (!window.navigator.msSaveOrOpenBlob) {
            const i3 = document.createElement("a");
            document.body.appendChild(i3);
            const r3 = window.URL.createObjectURL(e3);
            return i3.href = r3, i3.download = t3, i3.click(), setTimeout(() => {
              window.URL.revokeObjectURL(r3), document.body.removeChild(i3);
            }, 0), t3;
          }
          window.navigator.msSaveOrOpenBlob(e3, t3);
        })(new Blob([e2], { type: "text/csv" }), `result${i2 ? "-scoring" : ""}.csv`) : e2;
      }
      async function v({ requestType: e2, body: t2 = null, jsonBody: r2 = null, params: s2 = null, path: u2, batch: d2 = false, bulkBase: p2 = "v2", returnText: v2 = false, scoring: E2 = false, apiBaseURL: T2, baseURL: w2 = null, bearerToken: R2 = null, extraHeaders: L2 = null, secrets: U2 = [], regionalWarningState: k2 = null }) {
        const A2 = (function({ batch: e3, bulkBase: t3, apiBaseURL: i2, baseURL: r3, path: n2, params: a2 }) {
          const s3 = null != r3 ? r3 : e3 ? /* @__PURE__ */ (function(e4) {
            return "root" === e4 ? "https://bulkapi.zerobounce.net" : "https://bulkapi.zerobounce.net/v2";
          })(t3) : i2;
          return `${s3}${n2}${null != a2 && Object.keys(a2).length > 0 ? `?${new URLSearchParams(a2)}` : ""}`;
        })({ batch: d2, bulkBase: p2, apiBaseURL: T2, baseURL: w2, path: u2, params: s2 });
        a(A2, "request URL"), (function(e3, t3, i2) {
          if (!i2 || i2.warned) return;
          if (!g.includes(b(t3))) return;
          if ("bulkapi.zerobounce.net" !== b(e3)) return;
          i2.warned = true;
          const r3 = "undefined" != typeof console && console.warn ? console.warn : null;
          r3 && r3("ZeroBounce: a regional base URL is set, but this request goes to bulkapi.zerobounce.net. ZeroBounce documents no regional bulk host.");
        })(A2, T2, k2);
        const B2 = { ...i };
        let F2;
        null != r2 && (B2["Content-Type"] = "application/json"), R2 && (B2.Authorization = `Bearer ${R2}`), L2 && Object.assign(B2, L2);
        try {
          F2 = await fetch(A2, { method: e2, headers: B2, body: null != r2 ? JSON.stringify(r2) : t2, signal: l(), redirect: "error" });
        } catch (e3) {
          throw y(e3, U2);
        }
        const P2 = _(F2);
        if (P2 >= 300 && P2 < 400) throw n("ZeroBounce returned a redirect, which this client does not follow.", P2);
        let O2;
        try {
          O2 = await (async function(e3) {
            if (e3 && "function" == typeof e3.text) return await e3.text();
            if (e3 && "function" == typeof e3.json) {
              const t3 = await e3.json();
              return "string" == typeof t3 ? t3 : JSON.stringify(t3);
            }
            return "";
          })(F2);
        } catch (e3) {
          throw y(e3, U2);
        }
        if (v2) return S(O2, F2, E2);
        const j2 = _(F2), D2 = c(F2);
        if (m(O2) || D2.includes("text/html") || j2 >= 400 || !String(O2).trim()) throw n(o(h(O2, j2), U2), j2);
        let I2;
        try {
          I2 = JSON.parse(O2);
        } catch {
          throw n(o(h(O2, j2), U2), j2);
        }
        const z2 = f(I2);
        if (z2) throw n(z2, j2);
        if (I2 && "object" == typeof I2 && !Array.isArray(I2) && (false === I2.success || "False" === I2.success || "false" === I2.success)) throw n(h(O2, j2), j2);
        return I2;
      }
      function E() {
        throw new Error("ZeroBounce: Call init function first with a valid api key.");
      }
      function T(e2, t2 = "") {
        throw new Error(`ZeroBounce: ${e2} parameter is missing.${t2 ? ` ${t2}` : ""}`);
      }
      function w(e2, t2 = "") {
        throw new Error(`ZeroBounce: ${e2} parameter is invalid.${t2 ? ` ${t2}` : ""}`);
      }
      const R = Object.freeze({ NONE: "", VALID: "valid", INVALID: "invalid", CATCH_ALL: "catch-all", UNKNOWN: "unknown", SPAMTRAP: "spamtrap", ABUSE: "abuse", DO_NOT_MAIL: "do_not_mail" }), L = Object.freeze({ NONE: "", ANTISPAM_SYSTEM: "antispam_system", GREYLISTED: "greylisted", MAIL_SERVER_TEMPORARY_ERROR: "mail_server_temporary_error", FORCIBLE_DISCONNECT: "forcible_disconnect", MAIL_SERVER_DID_NOT_RESPOND: "mail_server_did_not_respond", TIMEOUT_EXCEEDED: "timeout_exceeded", FAILED_SMTP_CONNECTION: "failed_smtp_connection", MAILBOX_QUOTA_EXCEEDED: "mailbox_quota_exceeded", EXCEPTION_OCCURRED: "exception_occurred", POSSIBLE_TRAP: "possible_trap", ROLE_BASED: "role_based", GLOBAL_SUPPRESSION: "global_suppression", MAILBOX_NOT_FOUND: "mailbox_not_found", NO_DNS_ENTRIES: "no_dns_entries", FAILED_SYNTAX_CHECK: "failed_syntax_check", POSSIBLE_TYPO: "possible_typo", UNROUTABLE_IP_ADDRESS: "unroutable_ip_address", LEADING_PERIOD_REMOVED: "leading_period_removed", DOES_NOT_ACCEPT_MAIL: "does_not_accept_mail", ALIAS_ADDRESS: "alias_address", ROLE_BASED_CATCH_ALL: "role_based_catch_all", DISPOSABLE: "disposable", TOXIC: "toxic", ALTERNATE: "alternate", MX_FORWARD: "mx_forward", BLOCKED: "blocked", ALLOWED: "allowed", ACCEPT_ALL: "accept_all", ROLE_BASED_ACCEPT_ALL: "role_based_accept_all", GOLD: "gold", AI_AGENT_MAILBOX: "ai_agent_mailbox" }), U = Object.freeze({ PHASE_1: "phase_1", PHASE_2: "phase_2", COMBINED: "combined" });
      function k(e2) {
        return null == e2 || "string" == typeof e2 && "" === e2.trim();
      }
      function A(e2) {
        return e2 ? "true" : "false";
      }
      function B(e2) {
        return e2 || null;
      }
      function F(e2) {
        return e2 instanceof Date && !Number.isNaN(e2.getTime()) ? e2.toISOString().slice(0, 10) : e2;
      }
      const P = ["allow", "block"], O = ["email", "domain", "mx", "tld"];
      class j {
        static ApiURL = Object.freeze({ DEFAULT_API_URL: "https://api.zerobounce.net/v2", USA_API_URL: "https://api-us.zerobounce.net/v2", EU_API_URL: "https://api-eu.zerobounce.net/v2" });
        static ZBValidateStatus = R;
        static ZBValidateSubStatus = L;
        static ZBDownloadType = U;
        static ListEvaluatorURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/v2/listevaluator" });
        static InboxPlacementURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/api/ipt" });
        static EmailFinderURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/email-finder" });
        static DomainSearchURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/domain-search" });
        constructor() {
          this._initialized = false, this._api_key = null, this._api_base_url = j.ApiURL.DEFAULT_API_URL, this._list_evaluator_base_url = j.ListEvaluatorURL.DEFAULT_URL, this._inbox_placement_base_url = j.InboxPlacementURL.DEFAULT_URL, this._email_finder_base_url = j.EmailFinderURL.DEFAULT_URL, this._domain_search_base_url = j.DomainSearchURL.DEFAULT_URL, this._regional_warning = { warned: false };
        }
        init(e2, t2 = j.ApiURL.DEFAULT_API_URL, i2 = null) {
          if (null == e2 || "" === String(e2).trim()) throw new Error("ZeroBounce: Api key parameter is missing. Please provide a valid API key.");
          s(e2, "Api key"), this._api_key = e2, this._api_base_url = a(t2);
          const { listEvaluatorBaseURL: r2, inboxPlacementBaseURL: n2, emailFinderBaseURL: o2, domainSearchBaseURL: l2 } = i2 || {};
          this._list_evaluator_base_url = a(r2 ?? j.ListEvaluatorURL.DEFAULT_URL, "listEvaluatorBaseURL"), this._inbox_placement_base_url = a(n2 ?? j.InboxPlacementURL.DEFAULT_URL, "inboxPlacementBaseURL"), this._email_finder_base_url = a(o2 ?? j.EmailFinderURL.DEFAULT_URL, "emailFinderBaseURL"), this._domain_search_base_url = a(l2 ?? j.DomainSearchURL.DEFAULT_URL, "domainSearchBaseURL"), this._regional_warning = { warned: false }, this._initialized = true;
        }
        async getCredits() {
          if (this._initialized) return v({ requestType: "GET", params: { api_key: this._api_key }, path: "/getcredits", apiBaseURL: this._api_base_url });
          E();
        }
        async validateEmail(e2, t2 = null) {
          if (!this._initialized) return void E();
          if (k(e2)) return void T("Email");
          let i2, r2, n2, a2, s2, o2, l2;
          if ("string" == typeof t2 ? i2 = t2 : t2 && "object" == typeof t2 && (i2 = t2.ip_address, r2 = t2.timeout, n2 = t2.activityData, a2 = t2.verifyPlus, s2 = t2.domainInfo, o2 = t2.greylistProcessing, l2 = t2.callbackUrl), null != r2 && (r2 < 3 || r2 > 60)) return void w("timeout", "Must be between 3 and 60 seconds.");
          if (null != l2 && true !== o2) return void w("callbackUrl", "Requires greylistProcessing: true.");
          if (null != l2 && "" === String(l2).trim()) return void T("callbackUrl");
          const u2 = { api_key: this._api_key, email: e2 };
          return null != i2 && (u2.ip_address = i2), null != r2 && (u2.timeout = r2), null != n2 && (u2.activity_data = n2 ? "true" : "false"), null != a2 && (u2.verify_plus = a2 ? "true" : "false"), null != s2 && (u2.domain_info = s2 ? "true" : "false"), null != o2 && (u2.greylist_processing = o2 ? "true" : "false"), null != l2 && (u2.callback_url = l2), v(t2 && "object" == typeof t2 && "POST" === t2.method ? { requestType: "POST", path: "/validate", body: new URLSearchParams(u2), params: {}, apiBaseURL: this._api_base_url } : { requestType: "GET", params: u2, path: "/validate", apiBaseURL: this._api_base_url });
        }
        async getApiUsage(e2, t2) {
          if (this._initialized) if (k(e2)) T("Start date", "Format: YYYY-MM-DD");
          else {
            if (!k(t2)) return v({ requestType: "GET", params: { api_key: this._api_key, start_date: F(e2), end_date: F(t2) }, path: "/getapiusage", apiBaseURL: this._api_base_url });
            T("End date", "Format: YYYY-MM-DD");
          }
          else E();
        }
        async validateBatch(e2, t2 = null) {
          if (!this._initialized) return void E();
          if (null == e2) return void T("Email list");
          let i2, r2, n2;
          if (t2 && "object" == typeof t2 && (i2 = t2.timeout, r2 = t2.activityData, n2 = t2.verifyPlus), null != i2 && (i2 < 10 || i2 > 120)) return void w("timeout", "Must be between 10 and 120 seconds.");
          const a2 = { api_key: this._api_key, email_batch: e2 };
          return null != i2 && (a2.timeout = String(i2)), null != r2 && (a2.activity_data = r2), null != n2 && (a2.verify_plus = n2), v({ requestType: "POST", path: "/validatebatch", body: JSON.stringify(a2), apiBaseURL: this._api_base_url });
        }
        async getEmailActivity(e2) {
          if (this._initialized) {
            if (!k(e2)) return v({ requestType: "GET", params: { api_key: this._api_key, email: e2 }, path: "/activity", apiBaseURL: this._api_base_url });
            T("Email");
          } else E();
        }
        async scoreEmail(e2, t2 = null) {
          if (!this._initialized) return void E();
          if (k(e2)) return void T("Email");
          const i2 = { api_key: this._api_key, email: e2 };
          return v(t2 && "object" == typeof t2 && "POST" === t2.method ? { requestType: "POST", path: "/scoring", body: new URLSearchParams(i2), params: {}, apiBaseURL: this._api_base_url } : { requestType: "GET", params: i2, path: "/scoring", apiBaseURL: this._api_base_url });
        }
        async sendFile({ file: e2, email_address_column: t2, first_name_column: i2 = false, return_url: r2 = false, last_name_column: n2 = false, gender_column: a2 = false, ip_address_column: s2 = false, has_header_row: o2 = false, remove_duplicate: l2 = false, allowPhase2: u2 = null }) {
          if (!this._initialized) return void E();
          if (!e2) return void T("file");
          if (k(t2)) return void T("email_address_column");
          const d2 = new FormData();
          return r2 && d2.append("return_url", r2), i2 && d2.append("first_name_column", i2), n2 && d2.append("last_name_column", n2), a2 && d2.append("gender_column", a2), s2 && d2.append("ip_address_column", s2), d2.append("email_address_column", t2), d2.append("file", e2), d2.append("has_header_row", A(o2)), d2.append("remove_duplicate", A(l2)), d2.append("api_key", this._api_key), null != u2 && d2.append("allow_phase_2", A(u2)), v({ requestType: "POST", path: "/sendfile", body: d2, batch: true, apiBaseURL: this._api_base_url });
        }
        async sendFileStream(e2, t2, { email_address_column: i2, first_name_column: r2 = false, return_url: n2 = false, last_name_column: a2 = false, gender_column: s2 = false, ip_address_column: o2 = false, has_header_row: l2 = false, remove_duplicate: u2 = false, allowPhase2: d2 = null } = {}) {
          if (!this._initialized) return void E();
          if (!e2) return void T("fileStreamOrBlob");
          if (k(t2)) return void T("fileName");
          if (k(i2)) return void T("email_address_column");
          const _2 = new FormData();
          return n2 && _2.append("return_url", n2), r2 && _2.append("first_name_column", r2), a2 && _2.append("last_name_column", a2), s2 && _2.append("gender_column", s2), o2 && _2.append("ip_address_column", o2), _2.append("email_address_column", i2), _2.append("file", e2, t2), _2.append("has_header_row", A(l2)), _2.append("remove_duplicate", A(u2)), _2.append("api_key", this._api_key), null != d2 && _2.append("allow_phase_2", A(d2)), v({ requestType: "POST", path: "/sendfile", body: _2, batch: true, apiBaseURL: this._api_base_url });
        }
        async sendScoringFile({ file: e2, email_address_column: t2, return_url: i2 = false, has_header_row: r2 = false, remove_duplicate: n2 = false }) {
          if (!this._initialized) return void E();
          if (!e2) return void T("file: File");
          if (k(t2)) return void T("email_address_column: number");
          const a2 = new FormData();
          return i2 && a2.append("return_url", i2), a2.append("file", e2), a2.append("email_address_column", t2), a2.append("has_header_row", A(r2)), a2.append("api_key", this._api_key), a2.append("remove_duplicate", A(n2)), v({ requestType: "POST", path: "/scoring/sendfile", body: a2, batch: true, apiBaseURL: this._api_base_url });
        }
        async sendScoringFileStream(e2, t2, { email_address_column: i2, return_url: r2 = false, has_header_row: n2 = false, remove_duplicate: a2 = false } = {}) {
          if (!this._initialized) return void E();
          if (!e2) return void T("fileStreamOrBlob");
          if (k(t2)) return void T("fileName");
          if (k(i2)) return void T("email_address_column");
          const s2 = new FormData();
          return r2 && s2.append("return_url", r2), s2.append("file", e2, t2), s2.append("email_address_column", i2), s2.append("has_header_row", A(n2)), s2.append("api_key", this._api_key), s2.append("remove_duplicate", A(a2)), v({ requestType: "POST", path: "/scoring/sendfile", body: s2, batch: true, apiBaseURL: this._api_base_url });
        }
        async _getStatusUtil(e2, t2, { bulkRoot: i2 = false } = {}) {
          if (this._initialized) {
            if (!k(e2)) return v({ requestType: "GET", params: { api_key: this._api_key, file_id: e2 }, path: t2, batch: true, bulkBase: i2 ? "root" : "v2", apiBaseURL: this._api_base_url });
            T("File id");
          } else E();
        }
        async _sendBulkRootFormPost(e2, t2) {
          const i2 = { api_key: this._api_key, ...t2 };
          return v({ requestType: "POST", path: e2, body: new URLSearchParams(i2), params: {}, batch: true, bulkBase: "root", apiBaseURL: this._api_base_url });
        }
        async getFileStatus(e2) {
          return this._getStatusUtil(e2, "/filestatus");
        }
        async getScoringFileStatus(e2) {
          return this._getStatusUtil(e2, "/scoring/filestatus");
        }
        async _getFileUtil(e2, t2, i2 = false, r2 = null, { bulkRoot: n2 = false } = {}) {
          if (!this._initialized) return void E();
          if (k(e2)) return void T("File id");
          const a2 = { api_key: this._api_key, file_id: e2 };
          return null != r2 && "object" == typeof r2 && (null != r2.downloadType && (a2.download_type = r2.downloadType), i2 || null == r2.activityData || (a2.activity_data = r2.activityData ? "true" : "false")), v({ requestType: "GET", params: a2, path: t2, batch: true, bulkBase: n2 ? "root" : "v2", returnText: true, scoring: i2, apiBaseURL: this._api_base_url });
        }
        async getFile(e2, t2 = null) {
          return this._getFileUtil(e2, "/getfile", false, t2);
        }
        async getScoringFile(e2, t2 = null) {
          return this._getFileUtil(e2, "/scoring/getfile", true, t2);
        }
        async _deleteFileUtil(e2, t2, i2 = false, { bulkRoot: r2 = false } = {}) {
          if (this._initialized) {
            if (!k(e2)) return v({ requestType: "GET", params: { api_key: this._api_key, file_id: e2 }, path: t2, batch: true, bulkBase: r2 ? "root" : "v2", scoring: i2, apiBaseURL: this._api_base_url });
            T("File id");
          } else E();
        }
        async _sendBulkRootMultipartFile(e2, { file: t2, fileName: i2 = null, fields: r2 = {} }) {
          const n2 = new FormData();
          for (const [e3, t3] of Object.entries(r2)) null != t3 && n2.append(e3, "boolean" == typeof t3 ? A(t3) : t3);
          return null != i2 ? n2.append("file", t2, i2) : n2.append("file", t2), n2.append("api_key", this._api_key), v({ requestType: "POST", path: e2, body: n2, batch: true, bulkBase: "root", apiBaseURL: this._api_base_url });
        }
        async deleteFile(e2) {
          return this._deleteFileUtil(e2, "/deletefile");
        }
        async deleteScoringFile(e2) {
          return this._deleteFileUtil(e2, "/scoring/deletefile", true);
        }
        async sendEmailFinderFile({ file: e2, domain_column: t2, first_name_column: i2 = false, last_name_column: r2 = false, middle_name_column: n2 = false, full_name_column: a2 = false, has_header_row: s2 = false }) {
          if (this._initialized) if (e2) {
            if (!k(t2)) return this._sendBulkRootMultipartFile("/email-finder/sendfile", { file: e2, fields: { domain_column: t2, first_name_column: B(i2), last_name_column: B(r2), middle_name_column: B(n2), full_name_column: B(a2), has_header_row: Boolean(s2) } });
            T("domain_column");
          } else T("file");
          else E();
        }
        async sendEmailFinderFileStream(e2, t2, { domain_column: i2, first_name_column: r2 = false, last_name_column: n2 = false, middle_name_column: a2 = false, full_name_column: s2 = false, has_header_row: o2 = false } = {}) {
          if (this._initialized) if (e2) if (k(t2)) T("fileName");
          else {
            if (!k(i2)) return this._sendBulkRootMultipartFile("/email-finder/sendfile", { file: e2, fileName: t2, fields: { domain_column: i2, first_name_column: B(r2), last_name_column: B(n2), middle_name_column: B(a2), full_name_column: B(s2), has_header_row: Boolean(o2) } });
            T("domain_column");
          }
          else T("fileStreamOrBlob");
          else E();
        }
        async getEmailFinderFileStatus(e2) {
          return this._getStatusUtil(e2, "/email-finder/filestatus", { bulkRoot: true });
        }
        async getEmailFinderFile(e2) {
          return this._getFileUtil(e2, "/email-finder/getfile", false, null, { bulkRoot: true });
        }
        async deleteEmailFinderFile(e2) {
          return this._deleteFileUtil(e2, "/email-finder/deletefile", false, { bulkRoot: true });
        }
        async sendDomainSearchFile({ file: e2, domain_column: t2, has_header_row: i2 = false }) {
          if (this._initialized) if (e2) {
            if (!k(t2)) return this._sendBulkRootMultipartFile("/domain-search/sendfile", { file: e2, fields: { domain_column: t2, has_header_row: Boolean(i2) } });
            T("domain_column");
          } else T("file");
          else E();
        }
        async sendDomainSearchFileStream(e2, t2, { domain_column: i2, has_header_row: r2 = false } = {}) {
          if (this._initialized) if (e2) if (k(t2)) T("fileName");
          else {
            if (!k(i2)) return this._sendBulkRootMultipartFile("/domain-search/sendfile", { file: e2, fileName: t2, fields: { domain_column: i2, has_header_row: Boolean(r2) } });
            T("domain_column");
          }
          else T("fileStreamOrBlob");
          else E();
        }
        async getDomainSearchFileStatus(e2) {
          return this._getStatusUtil(e2, "/domain-search/filestatus", { bulkRoot: true });
        }
        async getDomainSearchFile(e2) {
          return this._getFileUtil(e2, "/domain-search/getfile", false, null, { bulkRoot: true });
        }
        async deleteDomainSearchFile(e2) {
          return this._deleteFileUtil(e2, "/domain-search/deletefile", false, { bulkRoot: true });
        }
        async sendListEvaluatorFile({ file: e2, email_address_column: t2 }) {
          if (!this._initialized) return void E();
          if (!e2) return void T("file");
          if (k(t2)) return void T("email_address_column");
          const i2 = new FormData();
          return i2.append("file", e2), i2.append("email_address_column", t2), i2.append("api_key", this._api_key), v({ requestType: "POST", path: "/", body: i2, apiBaseURL: this._list_evaluator_base_url });
        }
        async sendListEvaluatorFileStream(e2, t2, { email_address_column: i2 } = {}) {
          if (!this._initialized) return void E();
          if (!e2) return void T("fileStreamOrBlob");
          if (k(t2)) return void T("fileName");
          if (k(i2)) return void T("email_address_column");
          const r2 = new FormData();
          return r2.append("file", e2, t2), r2.append("email_address_column", i2), r2.append("api_key", this._api_key), v({ requestType: "POST", path: "/", body: r2, apiBaseURL: this._list_evaluator_base_url });
        }
        async getListEvaluatorResult(e2) {
          if (this._initialized) {
            if (!k(e2)) return v({ requestType: "GET", params: { api_key: this._api_key }, path: `/${encodeURIComponent(e2)}/`, apiBaseURL: this._list_evaluator_base_url });
            T("File id");
          } else E();
        }
        async sendEvaluatedFile(e2) {
          if (!this._initialized) return void E();
          const t2 = "object" == typeof e2 && null !== e2 ? e2.file_id : e2;
          if (k(t2)) return void T("File id");
          const i2 = new FormData();
          return i2.append("api_key", this._api_key), i2.append("file_id", String(t2)), v({ requestType: "POST", path: "/send-evaluated-file/", body: i2, batch: true, secrets: [this._api_key], apiBaseURL: this._api_base_url, regionalWarningState: this._regional_warning });
        }
        async addFilter({ rule: e2, target: t2, value: i2 }) {
          if (!this._initialized) return void E();
          if (k(e2)) return void T("rule");
          if (!P.includes(e2)) return void w("rule", `Must be one of ${P.join(", ")}.`);
          if (k(t2)) return void T("target");
          if (!O.includes(t2)) return void w("target", `Must be one of ${O.join(", ")}.`);
          if (k(i2)) return void T("value");
          const r2 = { api_key: this._api_key, rule: e2, target: t2, value: i2 };
          return v({ requestType: "POST", path: "/filters/add", body: new URLSearchParams(r2), params: {}, apiBaseURL: this._api_base_url });
        }
        async listFilters(e2 = null) {
          if (!this._initialized) return void E();
          const t2 = { api_key: this._api_key };
          return v(e2 && "object" == typeof e2 && "POST" === e2.method ? { requestType: "POST", path: "/filters/list", body: new URLSearchParams(t2), params: {}, apiBaseURL: this._api_base_url } : { requestType: "GET", params: t2, path: "/filters/list", apiBaseURL: this._api_base_url });
        }
        async deleteFilter({ rule: e2, target: t2, value: i2 }) {
          if (!this._initialized) return void E();
          if (k(e2)) return void T("rule");
          if (!P.includes(e2)) return void w("rule", `Must be one of ${P.join(", ")}.`);
          if (k(t2)) return void T("target");
          if (!O.includes(t2)) return void w("target", `Must be one of ${O.join(", ")}.`);
          if (k(i2)) return void T("value");
          const r2 = { api_key: this._api_key, rule: e2, target: t2, value: i2 };
          return v({ requestType: "POST", path: "/filters/delete", body: new URLSearchParams(r2), params: {}, apiBaseURL: this._api_base_url });
        }
        async listS3files({ bucket: e2 = null, search: t2 = null } = {}) {
          if (!this._initialized) return void E();
          const i2 = { api_key: this._api_key };
          return null != e2 && (i2.bucket = e2), null != t2 && (i2.search = t2), v({ requestType: "GET", params: i2, path: "/listS3files", batch: true, bulkBase: "root", apiBaseURL: this._api_base_url });
        }
        async validateS3file({ file_name: e2, has_header_row: t2, remove_duplicates: i2, email_address_column: r2 = null, return_url: n2 = false, first_name_column: a2 = false, last_name_column: s2 = false, gender_column: o2 = false, ip_address_column: l2 = false, remove_duplicate: u2 = null, allowPhase2: d2 = null }) {
          if (!this._initialized) return void E();
          if (k(e2)) return void T("file_name");
          const _2 = { file_name: e2 };
          return null != t2 && (_2.has_header_row = t2), null != i2 && (_2.remove_duplicates = i2), null != u2 && (_2.remove_duplicate = u2), null != r2 && (_2.email_address_column = r2), n2 && (_2.return_url = n2), a2 && (_2.first_name_column = a2), s2 && (_2.last_name_column = s2), o2 && (_2.gender_column = o2), l2 && (_2.ip_address_column = l2), null != d2 && (_2.allow_phase_2 = String(d2)), this._sendBulkRootFormPost("/validateS3file", _2);
        }
        async scoreS3file({ file_name: e2, has_header_row: t2, remove_duplicates: i2, email_address_column: r2 = null, remove_duplicate: n2 = null }) {
          if (!this._initialized) return void E();
          if (k(e2)) return void T("file_name");
          const a2 = { file_name: e2 };
          return null != t2 && (a2.has_header_row = t2), null != i2 && (a2.remove_duplicates = i2), null != n2 && (a2.remove_duplicate = n2), null != r2 && (a2.email_address_column = r2), this._sendBulkRootFormPost("/scoreS3file", a2);
        }
        async exportS3file({ file_id: e2, export_bucket: t2 }) {
          if (this._initialized) if (k(e2)) T("file_id");
          else {
            if (!k(t2)) return this._sendBulkRootFormPost("/exportS3file", { file_id: e2, export_bucket: t2 });
            T("export_bucket");
          }
          else E();
        }
        async _bulkRootFileJob(e2, { file_name: t2, has_header_row: i2, remove_duplicates: r2, return_url: n2 }) {
          if (!this._initialized) return void E();
          if (k(t2) || "" === String(t2).trim()) return void T("file_name");
          if (null == i2) return void T("has_header_row");
          if (k(n2) || "" === String(n2).trim()) return void T("return_url", "The API rejects a job without it.");
          const a2 = { file_name: t2, has_header_row: A(i2), return_url: n2 };
          return null != r2 && (a2.remove_duplicates = A(r2)), this._sendBulkRootFormPost(e2, a2);
        }
        async emailFinderS3file(e2) {
          return this._bulkRootFileJob("/emailFinderS3file", e2 || {});
        }
        async domainSearchS3file(e2) {
          return this._bulkRootFileJob("/domainSearchS3file", e2 || {});
        }
        async validateSFTPfile(e2) {
          return this._bulkRootFileJob("/validateSFTPfile", e2 || {}, false);
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
          if (!this._initialized) return void E();
          if (k(e2)) return void T("file_id");
          if (null != t2 && "" === String(t2).trim()) return void T("export_path");
          const i2 = { file_id: e2 };
          return null != t2 && (i2.export_path = t2), this._sendBulkRootFormPost("/exportSFTPfile", i2);
        }
        _iptRequest(e2, t2, { params: i2 = null, jsonBody: r2 = null } = {}) {
          return v({ requestType: e2, path: t2, params: i2, jsonBody: r2, bearerToken: this._api_key, secrets: [this._api_key], apiBaseURL: this._api_base_url, baseURL: this._inbox_placement_base_url, regionalWarningState: this._regional_warning });
        }
        async getInboxPlacementProviders() {
          if (this._initialized) return this._iptRequest("GET", "/providers");
          E();
        }
        async getInboxPlacementTestTypes() {
          if (this._initialized) return this._iptRequest("GET", "/test-types");
          E();
        }
        async createInboxPlacementTest({ name: e2, testType: t2 = null, senderEmail: i2 = null, providerIds: r2 = null, seedIds: n2 = null, providers: a2 = null, webhookUrl: s2 = null } = {}) {
          if (!this._initialized) return void E();
          if (k(e2)) return void T("name");
          if (String(e2).length > 64) return void w("name", "Must be at most 64 characters.");
          if (null != t2 && ![1, 2, 3].includes(t2)) return void w("testType", "Must be 1, 2 or 3.");
          if (1 === t2 && k(i2)) return void T("senderEmail", "Required when testType is 1.");
          for (const e3 of a2 || []) {
            if (!e3 || "object" != typeof e3 || null == e3.id) return void w("providers", "Each entry needs an id.");
            if (null != e3.maxSeeds && e3.maxSeeds < 1) return void w("providers", "maxSeeds must be at least 1.");
          }
          const o2 = { name: e2 };
          return null != t2 && (o2.testType = t2), null != i2 && (o2.senderEmail = i2), null != r2 && (o2.providerIds = r2), null != n2 && (o2.seedIds = n2), null != a2 && (o2.providers = a2), null != s2 && (o2.webhookUrl = s2), this._iptRequest("POST", "/test", { jsonBody: o2 });
        }
        async getInboxPlacementTest(e2) {
          if (this._initialized) {
            if (!k(e2)) return this._iptRequest("GET", `/test/${encodeURIComponent(String(e2).trim())}`);
            T("testId");
          } else E();
        }
        async listInboxPlacementTests({ status: e2 = null, createdAfter: t2 = null, createdBefore: i2 = null, page: r2 = null, pageSize: n2 = null } = {}) {
          if (!this._initialized) return void E();
          if (null != e2 && !["running", "finished"].includes(e2)) return void w("status", "Must be running or finished.");
          if (null != r2 && r2 < 1) return void w("page", "Must be at least 1.");
          if (null != n2 && (n2 < 1 || n2 > 100)) return void w("pageSize", "Must be between 1 and 100.");
          const a2 = {};
          return null != e2 && (a2.status = e2), null != t2 && (a2.createdAfter = t2), null != i2 && (a2.createdBefore = i2), null != r2 && (a2.page = r2), null != n2 && (a2.page_size = n2), this._iptRequest("GET", "/tests", { params: a2 });
        }
        async deleteInboxPlacementTest(e2) {
          if (this._initialized) {
            if (!k(e2)) return this._iptRequest("DELETE", `/test/${encodeURIComponent(String(e2).trim())}`);
            T("testId");
          } else E();
        }
        async getInboxPlacementWebhook() {
          if (this._initialized) return this._iptRequest("GET", "/webhook");
          E();
        }
        async setInboxPlacementWebhook(e2) {
          if (this._initialized) {
            if (!k(e2)) return this._iptRequest("PUT", "/webhook", { jsonBody: { webhookUrl: e2 } });
            T("webhookUrl");
          } else E();
        }
        async findEmailByDomain({ domain: e2, first_name: t2, middle_name: i2 = null, last_name: r2 = null }) {
          return this._findEmail({ domain: e2, first_name: t2, middle_name: i2, last_name: r2 });
        }
        async findEmailByCompanyName({ company_name: e2, first_name: t2, middle_name: i2 = null, last_name: r2 = null }) {
          return this._findEmail({ company_name: e2, first_name: t2, middle_name: i2, last_name: r2 });
        }
        async _findEmail({ domain: e2 = null, company_name: t2 = null, first_name: i2, middle_name: r2 = null, last_name: n2 = null }) {
          if (!this._initialized) return void E();
          if (k(e2) && k(t2)) return T("domain"), void T("company_name");
          if (k(i2)) return void T("first_name");
          const a2 = { api_key: this._api_key, first_name: i2 };
          return k(r2) || (a2.middle_name = r2), k(n2) || (a2.last_name = n2), null != e2 ? a2.domain = e2 : null != t2 && (a2.company_name = t2), v({ requestType: "GET", params: a2, path: "/guessformat", apiBaseURL: this._api_base_url });
        }
        async findEmailFormatByDomain({ domain: e2 }) {
          return this._findEmailFormat({ domain: e2 });
        }
        async findEmailFormatByCompanyName({ company_name: e2 }) {
          return this._findEmailFormat({ company_name: e2 });
        }
        async _findEmailFormat({ domain: e2 = null, company_name: t2 = null }) {
          if (!this._initialized) return void E();
          if (k(e2) && k(t2)) return T("domain"), void T("company_name");
          const i2 = { api_key: this._api_key };
          return null != e2 ? i2.domain = e2 : null != t2 && (i2.company_name = t2), v({ requestType: "GET", params: i2, path: "/guessformat", apiBaseURL: this._api_base_url });
        }
        async guessFormat({ domain: e2, first_name: t2 = null, middle_name: i2 = null, last_name: r2 = null }) {
          if (console.warn("guessFormat() is deprecated. Use findEmail for Email Finder API, or findEmailFormat for Domain Search API."), !this._initialized) return void E();
          if (k(e2)) return void T("domain");
          const n2 = { api_key: this._api_key, domain: e2 };
          return k(t2) || (n2.first_name = t2), k(i2) || (n2.middle_name = i2), k(r2) || (n2.last_name = r2), v({ requestType: "GET", params: n2, path: "/guessformat", apiBaseURL: this._api_base_url });
        }
      }
      const D = "https://warmup-api.zerobounce.net", I = ["self_managed", "zb_managed"], z = ["transactional", "newsletter", "marketing"], N = [0, 4], x = [0, 8], C = /^[A-Za-z0-9.\-_@+]*$/, $ = /^\d{4}-\d{2}-\d{2}$/;
      function M(e2) {
        return new Error(`ZeroBounce: ${e2}`);
      }
      function q(e2, t2) {
        if (null == e2 || !String(e2).trim()) throw M(`${t2} parameter is missing.`);
        return e2;
      }
      function G(e2, [t2, i2], r2) {
        if ("number" != typeof e2 || !Number.isInteger(e2) || e2 < t2 || e2 > i2) throw M(`${r2} parameter is invalid. Must be ${t2} to ${i2}.`);
        return e2;
      }
      function Z(e2, t2) {
        if (e2 instanceof Date) return e2.toISOString().slice(0, 10);
        if ("string" != typeof e2 || !$.test(e2)) throw M(`${t2} parameter is invalid. Expected YYYY-MM-DD.`);
        return e2;
      }
      function J() {
        if ("undefined" != typeof AbortSignal && "function" == typeof AbortSignal.timeout) return AbortSignal.timeout(12e4);
      }
      function W(e2, t2, i2, r2) {
        if (q(e2, "c_from"), G(t2, [5, 45], "reply_pct"), G(i2, [5, 40], "important_pct"), G(r2, [0, 70], "click_pct"), r2 > 1.75 * i2) throw M("click_pct parameter is invalid. At most important_pct x 1.75.");
        return { c_from: e2, reply_pct: t2, important_pct: i2, click_pct: r2 };
      }
      function Y(e2, t2) {
        const i2 = String(e2 || "").trim();
        if (!i2) return `Empty response from ZeroBounce (HTTP ${t2})`;
        const r2 = i2.slice(0, 2e3).toLowerCase();
        if (r2.includes("<!doctype html") || r2.includes("<html")) return "ZeroBounce returned an HTML error page instead of an API response.";
        if (i2.startsWith("{") || i2.startsWith("[")) {
          let e3;
          try {
            e3 = JSON.parse(i2);
          } catch {
            return "ZeroBounce returned a response that is not valid JSON.";
          }
          if (Array.isArray(e3)) {
            const t3 = e3.find((e4) => "string" == typeof e4 && e4.trim());
            if (t3) return t3.trim();
          } else if (e3 && "object" == typeof e3) for (const t3 of ["message", "error", "error_message", "detail"]) {
            const i3 = e3[t3];
            if ("string" == typeof i3 && i3.trim()) return i3.trim();
            if (Array.isArray(i3) && i3.length) {
              const e4 = i3.filter((e5) => "string" == typeof e5 && e5.trim());
              if (e4.length) return e4.join("; ");
              const t4 = i3[0];
              if (t4 && "object" == typeof t4 && t4.msg) {
                const e5 = Array.isArray(t4.loc) ? t4.loc.slice(1).join(".") : "";
                return e5 ? `${e5}: ${t4.msg}` : String(t4.msg);
              }
            }
          }
          return `ZeroBounce returned an error (HTTP ${t2}).`;
        }
        return i2.length > 1e3 ? "ZeroBounce returned a response that is not valid JSON." : i2;
      }
      j.Warmup = class {
        static DEFAULT_BASE_URL = D;
        constructor(e2, t2 = D) {
          s(e2, "Warmup api key");
          const i2 = a(t2 || D, "baseURL");
          this._api_key = e2, this._root = `${(function(e3) {
            let t3 = e3.length;
            for (; t3 > 0 && 47 === e3.charCodeAt(t3 - 1); ) t3 -= 1;
            return e3.slice(0, t3);
          })(i2)}/api/v1/warmup`;
        }
        async _send(e2, t2, { params: i2 = null, jsonBody: r2 = null, secrets: s2 = [] } = {}) {
          const l2 = i2 && Object.keys(i2).length ? `?${new URLSearchParams(i2)}` : "", u2 = `${this._root}${t2}${l2}`;
          a(u2, "request URL");
          const d2 = [this._api_key, ...s2], _2 = { "API-Key": this._api_key, Accept: "application/json" };
          let c2;
          null != r2 && (_2["Content-Type"] = "application/json");
          try {
            c2 = await fetch(u2, { method: e2, headers: _2, body: null != r2 ? JSON.stringify(r2) : void 0, signal: J(), redirect: "error" });
          } catch (e3) {
            const t3 = e3 && e3.name ? e3.name : "Error", i3 = e3 && e3.message ? e3.message : String(e3);
            throw new Error(o(`${t3}: ${i3}`, d2));
          }
          const m2 = "number" == typeof c2.status ? c2.status : 200;
          if (m2 >= 300 && m2 < 400) throw n("ZeroBounce returned a redirect, which this client does not follow.", m2);
          const p2 = "function" == typeof c2.text ? await c2.text() : "";
          if (m2 > 299) throw n(o(Y(p2, m2), d2), m2);
          return { status: m2, body: p2, response: c2 };
        }
        async _json(e2, t2, i2 = {}) {
          const { status: r2, body: a2 } = await this._send(e2, t2, i2);
          if (204 === r2 || !String(a2).trim()) return null;
          try {
            return JSON.parse(a2);
          } catch {
            throw n(o(Y(a2, r2), [this._api_key, ...i2.secrets || []]), r2);
          }
        }
        async _csv(e2, t2 = null) {
          const { status: i2, body: r2, response: a2 } = await this._send("GET", e2, { params: t2 }), s2 = a2 && a2.headers && "function" == typeof a2.headers.get ? String(a2.headers.get("content-type") || "").toLowerCase() : "";
          if (!String(r2).trim() || s2.includes("application/json")) throw n(o(Y(r2, i2), [this._api_key]), i2);
          return r2;
        }
        listSendingAccounts() {
          return this._json("GET", "/sending-accounts");
        }
        getSendingAccount(e2) {
          return this._json("GET", "/sending-account", { params: { from_address: q(e2, "from_address") } });
        }
        addSendingAccount({ fromAddress: e2, onboardingModel: t2, engagementRuleId: i2 = null, ignoreConflict: r2 = null, emailContent: n2 = null, managedSending: a2 = null } = {}) {
          if (q(e2, "from_address"), !I.includes(t2)) throw M("onboarding_model parameter is invalid. Must be self_managed or zb_managed.");
          const s2 = { from_address: e2, onboarding_model: t2 };
          if ("self_managed" === t2) {
            if (null == i2) throw M("engagement_rule_id parameter is missing. Required for self_managed.");
            if (s2.engagement_rule_id = G(i2, N, "engagement_rule_id"), null != n2 || null != a2) throw M("email_content and managed_sending are for zb_managed.");
          }
          if (null != r2 && (s2.ignore_conflict = Boolean(r2)), null != n2) {
            const e3 = { ...n2 }, t3 = e3.types_of_emails;
            if (null != t3 && (!Array.isArray(t3) || t3.some((e4) => !z.includes(e4)))) throw M("types_of_emails parameter is invalid. transactional, newsletter and/or marketing.");
            s2.email_content = e3;
          }
          if (null != a2) {
            const e3 = { ...a2 }, t3 = e3.timezone_offset;
            if (null != t3 && ("number" != typeof t3 || t3 < -11 || t3 > 14)) throw M("timezone_offset parameter is invalid. Must be -11 to 14.");
            null != e3.warmup_start_date && (e3.warmup_start_date = Z(e3.warmup_start_date, "warmup_start_date")), s2.managed_sending = e3;
          }
          return this._json("POST", "/sending-accounts", { jsonBody: s2 });
        }
        updateSendingAccount({ fromAddress: e2, engagementRuleId: t2, statusId: i2, autoEnable: r2 } = {}) {
          if (q(e2, "from_address"), "boolean" != typeof r2) throw M("auto_enable parameter is missing. Must be true or false.");
          return this._json("PUT", "/sending-accounts", { jsonBody: { team_id: 1, from_address: e2, engagement_rule_id: G(t2, N, "engagement_rule_id"), status_id: G(i2, x, "status_id"), auto_enable: r2 } });
        }
        deleteSendingAccount(e2) {
          return this._json("DELETE", "/sending-accounts", { params: { from_address: q(e2, "from_address") } });
        }
        changeFromAddress(e2, t2) {
          return this._json("PUT", "/smtp-credentials", { jsonBody: { team_id: 1, old_from_address: q(e2, "old_from_address"), new_from_address: q(t2, "new_from_address") } });
        }
        listFromAddresses({ searchFrom: e2 = null, offset: t2 = null, limit: i2 = null } = {}) {
          const r2 = {};
          if (null != e2) {
            if (!C.test(e2)) throw M("search_from parameter is invalid. Letters, digits and . - _ @ + only.");
            r2.search_from = e2;
          }
          for (const [e3, n2] of [["offset", t2], ["limit", i2]]) if (null != n2) {
            if ("number" != typeof n2 || !Number.isInteger(n2) || n2 < 0) throw M(`${e3} parameter is invalid. Must be a non-negative integer.`);
            r2[e3] = String(n2);
          }
          return this._json("GET", "/from-addresses", { params: r2 });
        }
        getEngagementRules() {
          return this._json("GET", "/engagement-rules");
        }
        setEngagementRule(e2, t2) {
          return q(e2, "c_from"), this._json("PUT", "/engagement-rule", { params: { c_from: e2 }, jsonBody: { rule_id: G(t2, N, "rule_id") } });
        }
        getCustomEngagement(e2) {
          return this._json("GET", `/custom-engagement/${(function(e3, t2) {
            const i2 = null == e3 ? "" : String(e3).trim();
            if (!i2) throw new Error(`ZeroBounce: ${t2} parameter is missing.`);
            if ("." === i2 || ".." === i2) throw new Error(`ZeroBounce: ${t2} parameter is invalid.`);
            return encodeURIComponent(i2);
          })(e2, "c_from")}`);
        }
        createCustomEngagement({ cFrom: e2, replyPct: t2, importantPct: i2, clickPct: r2 } = {}) {
          return this._json("POST", "/custom-engagement", { jsonBody: W(e2, t2, i2, r2) });
        }
        updateCustomEngagement({ cFrom: e2, replyPct: t2, importantPct: i2, clickPct: r2 } = {}) {
          return this._json("PUT", "/custom-engagement", { jsonBody: W(e2, t2, i2, r2) });
        }
        deleteCustomEngagement(e2, t2) {
          return this._json("DELETE", "/custom-engagement", { jsonBody: { c_from: q(e2, "c_from"), engagement_rule_id: G(t2, [1, 4], "engagement_rule_id") } });
        }
        getSeeds() {
          return this._json("GET", "/seeds");
        }
        downloadSeeds() {
          return this._csv("/seeds/download");
        }
        getSeedCount() {
          return this._json("GET", "/seed-count");
        }
        getProgressToday() {
          return this._json("GET", "/progress-today");
        }
        getSentToday() {
          return this._json("GET", "/sent-today");
        }
        getEmailsPerDay() {
          return this._json("GET", "/emails-per-day");
        }
        getStatistics(e2) {
          return this._json("GET", "/statistics", { params: { from_address: q(e2, "from_address") } });
        }
        getStatisticsPerDay({ fromAddress: e2, startDate: t2, endDate: i2 } = {}) {
          q(e2, "from_address");
          const r2 = Z(t2, "start_date"), n2 = Z(i2, "end_date");
          if (r2 > n2) throw M("start_date parameter is invalid. It is later than end_date.");
          return this._json("GET", "/statistics-per-day", { params: { from_address: e2, start_date: r2, end_date: n2 } });
        }
        getStatisticsDetailed(e2) {
          return this._json("GET", "/statistics-detailed", { params: { c_from: q(e2, "c_from") } });
        }
        downloadStatistics(e2) {
          return this._csv("/statistics/download", { c_from: q(e2, "c_from") });
        }
        getFromAddressStatistics(e2) {
          return this._json("GET", "/from-address-statistics", { params: { from_address: q(e2, "from_address") } });
        }
        checkDomainDmarc(e2, t2 = null) {
          if (q(e2, "from_address"), !String(e2).includes("@")) throw M("from_address parameter is invalid. Pass an email address, e.g. sender@example.com.");
          const i2 = { from_address: e2 };
          return null != t2 && (i2.dkim_selector = q(t2, "dkim_selector")), this._json("GET", "/check-domain-dmarc", { params: i2 });
        }
        testSmtpConfiguration({ fromAddress: e2, username: t2, password: i2, server: r2, port: n2 } = {}) {
          if ("number" != typeof n2 || !Number.isInteger(n2) || n2 < 1 || n2 > 65535) throw M("port parameter is invalid. Must be 1 to 65535.");
          const a2 = { from_address: q(e2, "from_address"), username: q(t2, "username"), password: q(i2, "password"), server: q(r2, "server"), port: n2 };
          return this._json("POST", "/test-smtp-configuration", { jsonBody: a2, secrets: [i2, t2] });
        }
      };
      const H = j;
      return t = t.default, t;
    })());
  }
});

// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// src/security/bulk-input.ts
import { isIP } from "node:net";
var MAX_BULK_FILE_CONTENT_BYTES = 32 * 1024 * 1024;
var HTTP_MAX_REQUEST_BODY_BYTES = MAX_BULK_FILE_CONTENT_BYTES * 2 + 64 * 1024;
function normalizeHost(hostname) {
  const host = hostname.trim().toLowerCase();
  if (host.startsWith("[") && host.endsWith("]") && host.length >= 2) {
    return host.slice(1, -1);
  }
  return host;
}
function isPrivateIpv4(host) {
  const parts = host.split(".").map((p) => Number(p));
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
function ipv4FromMapped(host) {
  const dotted = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(host);
  if (dotted?.[1]) {
    return dotted[1];
  }
  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(host);
  if (!hex?.[1] || !hex[2]) {
    return void 0;
  }
  const hi = Number.parseInt(hex[1], 16);
  const lo = Number.parseInt(hex[2], 16);
  return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
}
function isPrivateIpv6(host) {
  const bare = (host.split("%")[0] ?? host).toLowerCase();
  if (bare === "::" || bare === "::0" || bare === "0:0:0:0:0:0:0:0") {
    return true;
  }
  if (bare === "::1" || bare === "0:0:0:0:0:0:0:1") {
    return true;
  }
  const mapped = ipv4FromMapped(bare);
  if (mapped) {
    return isPrivateIpv4(mapped);
  }
  const first = bare.split(":")[0] ?? "";
  if (!first) {
    return false;
  }
  const value = Number.parseInt(first, 16);
  if (!Number.isFinite(value)) {
    return false;
  }
  if (value >= 65152 && value <= 65215) {
    return true;
  }
  if (value >= 64512 && value <= 65023) {
    return true;
  }
  return false;
}
function isPrivateOrLocalHost(hostname) {
  const host = normalizeHost(hostname);
  if (host === "localhost" || host.endsWith(".localhost")) {
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
function validateBulkReturnUrl(returnUrl) {
  let parsed;
  try {
    parsed = new URL(returnUrl);
  } catch {
    throw new Error("returnUrl must be a valid URL");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("returnUrl must use HTTPS");
  }
  const hostname = normalizeHost(parsed.hostname);
  if (!hostname) {
    throw new Error("returnUrl must include a hostname");
  }
  if (isPrivateOrLocalHost(hostname)) {
    throw new Error("returnUrl must not target private, link-local, or loopback addresses");
  }
  if (isIP(hostname) === 0 && !hostname.includes(".")) {
    throw new Error("returnUrl hostname must be a fully qualified domain name");
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

// src/zerobounce-client.ts
var import_zero_bounce_sdk = __toESM(require_zeroBounceSDK(), 1);

// src/errors.ts
var MAX_ERROR_MESSAGE_LENGTH = 1e3;
function looksLikeHtml(text) {
  return /<(?:!doctype\s+html|html|head|body)\b/i.test(text.slice(0, 2e3));
}
function formatErrorMessage(error) {
  let message = (error instanceof Error ? error.message : String(error)).trim();
  message = message.replace(/^(?:(?:Error|\[Error\]):\s*)+/i, "");
  if (looksLikeHtml(message)) {
    const title = message.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
    return `ZeroBounce returned an HTML error page${title ? ` ("${title}")` : ""} instead of an API response. Check the API key and request parameters.`;
  }
  if (message.length > MAX_ERROR_MESSAGE_LENGTH) {
    return `${message.slice(0, MAX_ERROR_MESSAGE_LENGTH)}\u2026 (truncated)`;
  }
  return message || "Unknown error";
}

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
  return typeof import_zero_bounce_sdk.default.prototype?.[name] === "function";
}
var ZeroBounceClient = class {
  apiKey;
  baseUrl;
  // Use official ZeroBounce SDK for core endpoints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk;
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.zerobounce.net/v2";
    this.sdk = new import_zero_bounce_sdk.default();
    this.sdk.init(this.apiKey, this.baseUrl);
  }
  /** SDK bulk APIs use 1-based column indexes; MCP tools accept 0-based. */
  toSdkColumnIndex(column) {
    return (column ?? 0) + 1;
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
    const accountError = result.errors?.find((e) => e.email_address === "all");
    if (accountError) {
      throw new Error(accountError.error);
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
  async bulkValidateSendFile(fileContent, fileName, returnUrl, emailAddressColumn) {
    const blob = this.toCsvBlob(fileContent);
    const result = this.requireSdkResult(
      await this.sdk.sendFileStream(blob, fileName, {
        email_address_column: this.toSdkColumnIndex(emailAddressColumn),
        return_url: returnUrl || false
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
  async bulkAIScoringSendFile(fileContent, fileName, returnUrl, emailAddressColumn) {
    const blob = this.toCsvBlob(fileContent);
    const result = this.requireSdkResult(
      await this.sdk.sendScoringFileStream(blob, fileName, {
        email_address_column: this.toSdkColumnIndex(emailAddressColumn),
        return_url: returnUrl || false
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
      return { success: true, csv: result };
    }
    if (result instanceof Blob) {
      throw new Error("Unexpected Blob response from bulk get-file endpoint");
    }
    if (typeof result === "object" && result !== null) {
      const error = result;
      const message = Array.isArray(error.message) ? error.message.join(", ") : error.message ?? error.error_message ?? error.error;
      throw new Error(message ?? JSON.stringify(result));
    }
    throw new Error(`Unexpected bulk get-file response: ${String(result)}`);
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
function optionalString(value) {
  return typeof value === "string" && value ? value : void 0;
}
function optionalNumber(value) {
  if (value === null || value === void 0) {
    return void 0;
  }
  const num = typeof value === "number" ? value : Number(value);
  return isNaN(num) ? void 0 : num;
}
function optionalBoolean(value) {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return void 0;
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
      const ipAddress = optionalString(args.ipAddress);
      const timeout = optionalNumber(args.timeout);
      const activityData = optionalBoolean(args.activityData);
      const verifyPlus = optionalBoolean(args.verifyPlus);
      const usePost = optionalBoolean(args.usePost) ?? false;
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
          description: "Array of email addresses to validate"
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
      const emails = requireArray(args.emails, "emails");
      const emailAddressColumn = optionalNumber(args.emailAddressColumn);
      const timeout = optionalNumber(args.timeout);
      const activityData = optionalBoolean(args.activityData);
      const verifyPlus = optionalBoolean(args.verifyPlus);
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
      const startDate = requireString(args.startDate, "startDate");
      const endDate = requireString(args.endDate, "endDate");
      const result = await client.getApiUsage(startDate, endDate);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

// src/tools/bulk-file-helpers.ts
function createBulkFileTools(config) {
  const sendFileProperties = {
    fileContent: {
      type: "string",
      description: "CSV file content as a string"
    },
    fileName: {
      type: "string",
      description: "Name of the file"
    },
    returnUrl: {
      type: "string",
      description: "Optional HTTPS callback URL when processing completes. Only use trusted URLs you control; an attacker-controlled URL can receive bulk results."
    }
  };
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
      description: "Column index (0-based) containing full name values."
    };
  }
  if (config.supportsFirstNameColumn) {
    sendFileProperties.firstNameColumn = {
      type: "number",
      description: "Column index (0-based) containing first names."
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
  const sendFileTool = {
    sdkMethods: config.sdkMethods,
    definition: {
      name: `${config.name}_send_file`,
      description: `Send a CSV file for bulk ${config.description}. Returns a file ID for tracking.`,
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
        const returnUrl = optionalString(args.returnUrl);
        if (returnUrl) {
          validateBulkReturnUrl(returnUrl);
        }
        const emailAddressColumn = config.supportsEmailAddressColumn ? optionalNumber(args.emailAddressColumn) : void 0;
        const domainColumn = config.supportsDomainColumn ? optionalNumber(args.domainColumn) : void 0;
        const companyNameColumn = config.supportsCompanyNameColumn ? optionalNumber(args.companyNameColumn) : void 0;
        const fullNameColumn = config.supportsFullNameColumn ? optionalNumber(args.fullNameColumn) : void 0;
        const firstNameColumn = config.supportsFirstNameColumn ? optionalNumber(args.firstNameColumn) : void 0;
        const middleNameColumn = config.supportsMiddleNameColumn ? optionalNumber(args.middleNameColumn) : void 0;
        const lastNameColumn = config.supportsLastNameColumn ? optionalNumber(args.lastNameColumn) : void 0;
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
          lastNameColumn
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
      description: `Get the status of a bulk ${config.description} file upload.`,
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
      description: `Get the results of a completed bulk ${config.description} file.`,
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
      description: `Delete a bulk ${config.description} file from your account.`,
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
  sendFileMethod: (client, fileContent, fileName, returnUrl, emailAddressColumn) => client.bulkValidateSendFile(fileContent, fileName, returnUrl, emailAddressColumn),
  getStatusMethod: (client, fileId) => client.bulkValidateFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkValidateGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkValidateDeleteFile(fileId),
  supportsEmailAddressColumn: true
});

// src/tools/bulk-ai-scoring.ts
var bulkAIScoringTools = createBulkFileTools({
  name: "bulk_ai_scoring",
  description: "AI email scoring",
  sendFileMethod: (client, fileContent, fileName, returnUrl, emailAddressColumn) => client.bulkAIScoringSendFile(fileContent, fileName, returnUrl, emailAddressColumn),
  getStatusMethod: (client, fileId) => client.bulkAIScoringFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkAIScoringGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkAIScoringDeleteFile(fileId),
  supportsEmailAddressColumn: true
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
      const usePost = optionalBoolean(args.usePost) ?? false;
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
      const domain = optionalString(args.domain);
      const firstName = optionalString(args.firstName);
      const middleName = optionalString(args.middleName);
      const lastName = optionalString(args.lastName);
      const company = optionalString(args.company);
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
      const domain = optionalString(args.domain);
      const company = optionalString(args.company);
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
  sendFileMethod: (client, fileContent, fileName, _returnUrl, _emailCol, domainColumn, _c, _f, first, middle, last) => client.bulkEmailFinderSendFile(fileContent, fileName, domainColumn ?? 0, {
    firstNameColumn: first,
    middleNameColumn: middle,
    lastNameColumn: last
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
  supportsDomainColumn: true,
  supportsFirstNameColumn: true,
  supportsMiddleNameColumn: true,
  supportsLastNameColumn: true
});

// src/tools/bulk-domain-search.ts
var bulkDomainSearchTools = createBulkFileTools({
  name: "bulk_domain_search",
  description: "bulk domain search",
  sendFileMethod: (client, fileContent, fileName, _returnUrl, _emailCol, domainColumn) => client.bulkDomainSearchSendFile(fileContent, fileName, domainColumn ?? 0),
  getStatusMethod: (client, fileId) => client.bulkDomainSearchFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkDomainSearchGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkDomainSearchDeleteFile(fileId),
  sdkMethods: [
    "sendDomainSearchFileStream",
    "getDomainSearchFileStatus",
    "getDomainSearchFile",
    "deleteDomainSearchFile"
  ],
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
      const emailAddressColumn = optionalNumber(args.emailAddressColumn) ?? 0;
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
      const usePost = Boolean(args.usePost);
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
        const returnUrl = requireString(args.returnUrl, "returnUrl");
        validateBulkReturnUrl(returnUrl);
        const result = await config.jobMethod(client, {
          fileName,
          returnUrl,
          hasHeaderRow: optionalBoolean(args.hasHeaderRow) ?? false,
          removeDuplicates: optionalBoolean(args.removeDuplicates)
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
        bucket: optionalString(args.bucket),
        search: optionalString(args.search)
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
        optionalString(args.exportBucket)
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
        optionalString(args.exportPath)
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
};

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
    // SFTP/FTP bulk
    validateSftpFileTool,
    scoreSftpFileTool,
    emailFinderSftpFileTool,
    domainSearchSftpFileTool,
    exportSftpFileTool
  ];
}
function getAllTools() {
  return listTools().filter((tool) => (tool.sdkMethods ?? []).every(isSdkMethodAvailable));
}
function getToolRegistry() {
  const registry = /* @__PURE__ */ new Map();
  const allTools = getAllTools();
  for (const tool of allTools) {
    registry.set(tool.definition.name, tool.handler);
  }
  return registry;
}

// src/index.ts
var API_KEY_HEADER = "x-zerobounce-api-key";
var DEFAULT_API_BASE_URL = "https://api.zerobounce.net/v2";
var REGIONAL_API_BASE_URLS = {
  default: DEFAULT_API_BASE_URL,
  us: "https://api-us.zerobounce.net/v2",
  eu: "https://api-eu.zerobounce.net/v2"
};
function resolveApiBaseUrl(value) {
  const raw = value?.trim();
  if (!raw) return DEFAULT_API_BASE_URL;
  const region = REGIONAL_API_BASE_URLS[raw.toLowerCase()];
  if (region) return region;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `Invalid API URL: ${raw}. Use us, eu, or an https:// URL.`
    );
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`The API URL must use https, got: ${raw}`);
  }
  return raw.replace(/\/+$/, "");
}
var SERVER_VERSION = true ? "0.2.0" : "0.0.0-dev";
var ZeroBounceMCPServer = class {
  server;
  client;
  config;
  constructor(config) {
    this.config = config;
    this.client = new ZeroBounceClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl
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
    const allTools = getAllTools();
    const toolRegistry = getToolRegistry();
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
      return handler(this.client, args || {});
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
                  apiKeyConfigured: !!this.config.apiKey
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
async function runStdio(apiKey, baseUrl) {
  const server = new ZeroBounceMCPServer({ apiKey, baseUrl });
  await server.connect(new StdioServerTransport());
  console.error("ZeroBounce MCP server running on stdio");
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
function getRequestApiKey(req) {
  const header = req.headers[API_KEY_HEADER];
  const value = Array.isArray(header) ? header[0] : header;
  if (value?.trim()) {
    return value.trim();
  }
  const authorization = req.headers.authorization;
  return typeof authorization === "string" ? bearerToken(authorization) : "";
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
async function handleMcpRequest(req, res, baseUrl) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJsonRpcError(res, 405, "Method not allowed.");
    return;
  }
  const apiKey = getRequestApiKey(req);
  if (!apiKey) {
    sendJsonRpcError(
      res,
      401,
      `ZeroBounce API key is required. Send it in the X-ZeroBounce-Api-Key header or as Authorization: Bearer <key>.`
    );
    return;
  }
  const server = new ZeroBounceMCPServer({ apiKey, baseUrl });
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
async function runHttp(host, port, baseUrl) {
  const httpServer = createServer((req, res) => {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    if (pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" }).end('{"status":"ok"}');
      return;
    }
    if (pathname !== "/mcp") {
      res.writeHead(404).end();
      return;
    }
    handleMcpRequest(req, res, baseUrl).catch((error) => {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        sendJsonRpcError(res, 500, "Internal server error.");
      }
    });
  });
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
    transport: process.env.MCP_TRANSPORT?.trim() === "http" ? "http" : "stdio",
    // Loopback by default; hosted deployments must opt in to 0.0.0.0 explicitly.
    host: process.env.MCP_HOST?.trim() || "127.0.0.1",
    port: Number(process.env.PORT) || 3e3,
    baseUrl: resolveApiBaseUrl(process.env.ZEROBOUNCE_API_URL)
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
  if (!config.apiKey) {
    throw new Error(
      "ZeroBounce API key is required. Provide it via the --api-key flag or the ZEROBOUNCE_API_KEY environment variable."
    );
  }
  return config;
}
async function main() {
  try {
    const config = parseArgs();
    if (config.transport === "http") {
      await runHttp(config.host, config.port, config.baseUrl);
    } else {
      await runStdio(config.apiKey, config.baseUrl);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
}
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

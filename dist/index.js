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
      const e = { d: (t2, r2) => {
        if (Array.isArray(r2)) for (var i2 = 0; i2 < r2.length; ) {
          var n2 = r2[i2++], a2 = r2[i2++];
          e.o(t2, n2) ? 0 === a2 && i2++ : 0 === a2 ? Object.defineProperty(t2, n2, { enumerable: true, value: r2[i2++] }) : Object.defineProperty(t2, n2, { enumerable: true, get: a2 });
        }
        else for (var n2 in r2) e.o(r2, n2) && !e.o(t2, n2) && Object.defineProperty(t2, n2, { enumerable: true, get: r2[n2] });
      }, o: (e2, t2) => Object.prototype.hasOwnProperty.call(e2, t2) };
      let t = {};
      e.d(t, { default: () => re });
      const r = { Accept: "*/*", "Accept-Encoding": "gzip, deflate, br", Connection: "keep-alive" };
      class i extends Error {
        constructor(e2, t2 = 0) {
          super(e2), this.name = "ZBApiError", this.statusCode = t2;
        }
      }
      function n(e2, t2 = 0) {
        return new i(e2, t2);
      }
      function a(e2, t2 = "apiBaseURL") {
        if ("string" != typeof e2 || !/^https:\/\//i.test(e2)) throw new Error(`ZeroBounce: ${t2} must be an https:// URL`);
        return e2;
      }
      function s(e2) {
        let t2 = e2.length;
        for (; t2 > 0 && 47 === e2.charCodeAt(t2 - 1); ) t2 -= 1;
        return e2.slice(0, t2);
      }
      function o(e2, t2) {
        return s(a(e2, t2));
      }
      function l(e2, t2) {
        if ("boolean" == typeof e2) return e2;
        if (1 === e2 || 0 === e2) return 1 === e2;
        if ("string" == typeof e2) {
          const t3 = e2.trim().toLowerCase();
          if ("true" === t3 || "false" === t3) return "true" === t3;
        }
        throw new Error(`ZeroBounce: ${t2} parameter is invalid. Must be true or false.`);
      }
      function u(e2, t2 = "api key") {
        if ("string" != typeof e2 || !e2.trim()) throw new Error(`ZeroBounce: ${t2} parameter is missing.`);
        if (e2 !== e2.trim() || /[\u0000-\u001f\u007f]/.test(e2)) throw new Error(`ZeroBounce: ${t2} has surrounding whitespace or control characters.`);
        return e2;
      }
      function _(e2, t2 = []) {
        let r2 = String(e2);
        for (const e3 of t2) if (e3) for (const t3 of [e3, encodeURIComponent(e3), escape(e3)]) t3 && (r2 = r2.split(t3).join("***"));
        return r2.replace(/([?&](?:api_key|API-Key)=)[^&\s"']+/gi, "$1***");
      }
      function d() {
        if ("undefined" != typeof AbortSignal && "function" == typeof AbortSignal.timeout) return AbortSignal.timeout(12e4);
      }
      function c(e2, t2) {
        const r2 = e2[t2];
        return null != r2 && ("string" == typeof r2 ? "" !== r2.trim() : !!Array.isArray(r2) && r2.some((e3) => "string" == typeof e3 && "" !== e3.trim()));
      }
      function m() {
        return "undefined" != typeof window && "undefined" != typeof document && "function" == typeof document.createElement;
      }
      function p(e2) {
        return e2 && "number" == typeof e2.status ? e2.status : 200;
      }
      function f(e2) {
        return e2 && e2.headers && "function" == typeof e2.headers.get ? String(e2.headers.get("content-type") || "").toLowerCase() : "";
      }
      function h(e2) {
        const t2 = String(e2).slice(0, 2e3).toLowerCase();
        return t2.includes("<!doctype html") || t2.includes("<html") || t2.includes("<head") || t2.includes("<body");
      }
      function y(e2) {
        let t2 = String(e2).trim();
        for (; ; ) if (t2.startsWith("Error:")) t2 = t2.slice(6).trim();
        else {
          if (!t2.startsWith("[Error]:")) return t2;
          t2 = t2.slice(8).trim();
        }
      }
      function b(e2) {
        return /invalid api key|api_key is invalid|ran out of credits|out of credits/i.test(e2);
      }
      function g(e2) {
        if (!e2 || "object" != typeof e2 || Array.isArray(e2)) return null;
        if (Array.isArray(e2.errors)) {
          for (const t3 of e2.errors) if (t3 && "all" === String(t3.email_address || "").toLowerCase()) return y(("string" == typeof t3.error ? t3.error.trim() : "") || "Invalid API Key or your account ran out of credits");
        }
        const t2 = !Object.prototype.hasOwnProperty.call(e2, "success");
        for (const r2 of ["error", "error_message", "Error"]) {
          const i2 = e2[r2];
          if ("string" == typeof i2 && i2.trim() && (t2 || "error_message" !== r2 && b(i2))) return y(i2.trim()) || i2.trim();
        }
        return null;
      }
      const S = /* @__PURE__ */ new Set(["error", "message", "error_message", "Message", "Error", "detail"]);
      function v(e2, t2) {
        const r2 = String(e2).trim();
        if (!r2) return `Empty response from ZeroBounce (HTTP ${t2})`;
        if (h(e2)) {
          const t3 = (function(e3) {
            const t4 = String(e3).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            return t4 ? t4[1].replace(/\s+/g, " ").trim() : "";
          })(e2);
          return t3 ? `ZeroBounce returned an HTML error page ("${t3}") instead of an API response.` : "ZeroBounce returned an HTML error page instead of an API response.";
        }
        if (r2.startsWith("{") || r2.startsWith("[")) try {
          const e3 = JSON.parse(r2), t3 = (function(e4) {
            return !e4 || "object" != typeof e4 || Array.isArray(e4) || "string" != typeof e4.title ? null : (e4.title.includes("Access denied") || e4.title.includes("1020")) && true === e4.cloudflare_error ? e4.title : null;
          })(e3);
          if (t3) return t3;
          const i2 = g(e3);
          if (i2) return i2;
          const n2 = (function(e4) {
            if (Array.isArray(e4)) {
              const t4 = e4.find((e5) => "string" == typeof e5 && e5.trim());
              return t4 ? t4.trim() : null;
            }
            if (!e4 || "object" != typeof e4) return null;
            for (const t4 of ["error", "message", "error_message", "Message", "Error", "detail"]) {
              const r3 = e4[t4];
              if ("string" == typeof r3 && r3.trim()) return r3.trim();
              if (Array.isArray(r3) && r3.length) {
                const e5 = r3.filter((e6) => "string" == typeof e6 && e6.trim());
                if (e5.length) return e5.join("; ");
                const t5 = r3[0];
                if (t5 && "object" == typeof t5 && t5.msg) {
                  const e6 = Array.isArray(t5.loc) ? t5.loc.slice(1).join(".") : "";
                  return e6 ? `${e6}: ${t5.msg}` : String(t5.msg);
                }
              }
            }
            return null;
          })(e3);
          return n2 ? y(n2) : "ZeroBounce returned an unexpected response.";
        } catch {
          return "ZeroBounce returned a response that is not valid JSON.";
        }
        return r2.length > 1e3 ? "ZeroBounce returned a response that is not valid JSON." : y(r2) || `Empty response from ZeroBounce (HTTP ${t2})`;
      }
      function E(e2, t2 = []) {
        const r2 = e2 && e2.name ? e2.name : "Error", i2 = e2 && e2.message ? e2.message : String(e2);
        return new Error(_(`${r2}: ${i2}`, t2));
      }
      const w = ["api-eu.zerobounce.net", "api-us.zerobounce.net"];
      function R(e2) {
        try {
          return new URL(String(e2)).hostname.toLowerCase();
        } catch {
          return "";
        }
      }
      function L(e2, t2, r2) {
        const i2 = p(t2), a2 = f(t2);
        if (h(e2) || a2.includes("text/html") || i2 >= 400) throw n(v(e2, i2), i2);
        if (!String(e2).trim()) throw n(`Empty response from ZeroBounce (HTTP ${i2})`, i2);
        const s2 = e2.trim(), o2 = a2.includes("application/json");
        if (o2 || s2.startsWith("{") || s2.startsWith("[")) {
          let t3;
          try {
            t3 = JSON.parse(e2);
          } catch {
            throw n("ZeroBounce returned a response that is not valid JSON.", i2);
          }
          if (o2 || (function(e3) {
            return !(!e3 || "object" != typeof e3 || Array.isArray(e3)) && (!(!(t4 = e3) || "object" != typeof t4 || Array.isArray(t4) || !(Object.prototype.hasOwnProperty.call(t4, "success") && null != t4.success && (false === t4.success || "False" === t4.success || "false" === t4.success) || c(t4, "message") || c(t4, "error") || c(t4, "error_message"))) || Object.prototype.hasOwnProperty.call(e3, "success"));
            var t4;
          })(t3)) throw n(v(e2, i2), i2);
        }
        return m() ? (function(e3, t3) {
          if (!m()) throw new Error("saveFile is only available in browser environments");
          if (!window.navigator.msSaveOrOpenBlob) {
            const r3 = document.createElement("a");
            document.body.appendChild(r3);
            const i3 = window.URL.createObjectURL(e3);
            return r3.href = i3, r3.download = t3, r3.click(), setTimeout(() => {
              window.URL.revokeObjectURL(i3), document.body.removeChild(r3);
            }, 0), t3;
          }
          window.navigator.msSaveOrOpenBlob(e3, t3);
        })(new Blob([e2], { type: "text/csv" }), `result${r2 ? "-scoring" : ""}.csv`) : e2;
      }
      async function T({ requestType: e2, body: t2 = null, jsonBody: i2 = null, params: s2 = null, path: o2, batch: l2 = false, bulkBase: u2 = "v2", returnText: c2 = false, scoring: m2 = false, apiBaseURL: y2, baseURL: b2 = null, bearerToken: T2 = null, extraHeaders: U2 = null, secrets: k2 = [], regionalWarningState: A2 = null, messageOnlyIsFailure: B2 = false }) {
        const F2 = (function({ batch: e3, bulkBase: t3, apiBaseURL: r2, baseURL: i3, path: n2, params: a2 }) {
          const s3 = null != i3 ? i3 : e3 ? /* @__PURE__ */ (function(e4) {
            return "root" === e4 ? "https://bulkapi.zerobounce.net" : "https://bulkapi.zerobounce.net/v2";
          })(t3) : r2;
          return `${s3}${n2}${null != a2 && Object.keys(a2).length > 0 ? `?${new URLSearchParams(a2)}` : ""}`;
        })({ batch: l2, bulkBase: u2, apiBaseURL: y2, baseURL: b2, path: o2, params: s2 });
        a(F2, "request URL"), (function(e3, t3, r2) {
          if (!r2 || r2.warned) return;
          if (!w.includes(R(t3))) return;
          if ("bulkapi.zerobounce.net" !== R(e3)) return;
          r2.warned = true;
          const i3 = "undefined" != typeof console && console.warn ? console.warn : null;
          i3 && i3("ZeroBounce: a regional base URL is set, but this request goes to bulkapi.zerobounce.net. ZeroBounce documents no regional bulk host.");
        })(F2, y2, A2);
        const P2 = { ...r };
        let O2;
        null != i2 && (P2["Content-Type"] = "application/json"), T2 && (P2.Authorization = `Bearer ${T2}`), U2 && Object.assign(P2, U2);
        try {
          O2 = await fetch(F2, { method: e2, headers: P2, body: null != i2 ? JSON.stringify(i2) : t2, signal: d(), redirect: "error" });
        } catch (e3) {
          throw E(e3, k2);
        }
        const j2 = p(O2);
        if (j2 >= 300 && j2 < 400) throw n("ZeroBounce returned a redirect, which this client does not follow.", j2);
        let D2;
        try {
          D2 = await (async function(e3) {
            if (e3 && "function" == typeof e3.text) return await e3.text();
            if (e3 && "function" == typeof e3.json) {
              const t3 = await e3.json();
              return "string" == typeof t3 ? t3 : JSON.stringify(t3);
            }
            return "";
          })(O2);
        } catch (e3) {
          throw E(e3, k2);
        }
        if (c2) return L(D2, O2, m2);
        const I2 = p(O2), z2 = f(O2);
        if (h(D2) || z2.includes("text/html") || I2 >= 400 || !String(D2).trim()) throw n(_(v(D2, I2), k2), I2);
        let N2;
        try {
          N2 = JSON.parse(D2);
        } catch {
          throw n(_(v(D2, I2), k2), I2);
        }
        const x2 = g(N2);
        if (x2) throw n(x2, I2);
        if (B2 && (function(e3) {
          const t3 = (function(e4) {
            return !e4 || "object" != typeof e4 || Array.isArray(e4) || Object.prototype.hasOwnProperty.call(e4, "success") ? null : e4;
          })(e3);
          if (!t3) return false;
          const r2 = Object.keys(t3);
          return r2.length > 0 && r2.every((e4) => S.has(e4)) && r2.some((e4) => {
            return "string" == typeof (r3 = t3[e4]) && "" !== r3.trim();
            var r3;
          });
        })(N2)) throw n(_(v(D2, I2), k2), I2);
        if (N2 && "object" == typeof N2 && !Array.isArray(N2) && (false === N2.success || "False" === N2.success || "false" === N2.success)) throw n(v(D2, I2), I2);
        return N2;
      }
      function U() {
        throw new Error("ZeroBounce: Call init function first with a valid api key.");
      }
      function k(e2, t2 = "") {
        throw new Error(`ZeroBounce: ${e2} parameter is missing.${t2 ? ` ${t2}` : ""}`);
      }
      function A(e2, t2 = "") {
        throw new Error(`ZeroBounce: ${e2} parameter is invalid.${t2 ? ` ${t2}` : ""}`);
      }
      const B = Object.freeze({ NONE: "", VALID: "valid", INVALID: "invalid", CATCH_ALL: "catch-all", UNKNOWN: "unknown", SPAMTRAP: "spamtrap", ABUSE: "abuse", DO_NOT_MAIL: "do_not_mail" }), F = Object.freeze({ NONE: "", ANTISPAM_SYSTEM: "antispam_system", GREYLISTED: "greylisted", MAIL_SERVER_TEMPORARY_ERROR: "mail_server_temporary_error", FORCIBLE_DISCONNECT: "forcible_disconnect", MAIL_SERVER_DID_NOT_RESPOND: "mail_server_did_not_respond", TIMEOUT_EXCEEDED: "timeout_exceeded", FAILED_SMTP_CONNECTION: "failed_smtp_connection", MAILBOX_QUOTA_EXCEEDED: "mailbox_quota_exceeded", EXCEPTION_OCCURRED: "exception_occurred", POSSIBLE_TRAP: "possible_trap", ROLE_BASED: "role_based", GLOBAL_SUPPRESSION: "global_suppression", MAILBOX_NOT_FOUND: "mailbox_not_found", NO_DNS_ENTRIES: "no_dns_entries", FAILED_SYNTAX_CHECK: "failed_syntax_check", POSSIBLE_TYPO: "possible_typo", UNROUTABLE_IP_ADDRESS: "unroutable_ip_address", LEADING_PERIOD_REMOVED: "leading_period_removed", DOES_NOT_ACCEPT_MAIL: "does_not_accept_mail", ALIAS_ADDRESS: "alias_address", ROLE_BASED_CATCH_ALL: "role_based_catch_all", DISPOSABLE: "disposable", TOXIC: "toxic", ALTERNATE: "alternate", MX_FORWARD: "mx_forward", BLOCKED: "blocked", ALLOWED: "allowed", ACCEPT_ALL: "accept_all", ROLE_BASED_ACCEPT_ALL: "role_based_accept_all", GOLD: "gold", AI_AGENT_MAILBOX: "ai_agent_mailbox" }), P = Object.freeze({ PHASE_1: "phase_1", PHASE_2: "phase_2", COMBINED: "combined" });
      function O(e2) {
        return null == e2 || "string" == typeof e2 && "" === e2.trim();
      }
      function j(e2) {
        return e2 ? "true" : "false";
      }
      function D(e2, t2, r2) {
        return j(null == e2 && void 0 !== r2 ? r2 : l(e2, t2));
      }
      function I(e2) {
        return e2 || null;
      }
      function z(e2) {
        return e2 instanceof Date && !Number.isNaN(e2.getTime()) ? e2.toISOString().slice(0, 10) : e2;
      }
      const N = ["allow", "block"], x = ["email", "domain", "mx", "tld"];
      class C {
        static ApiURL = Object.freeze({ DEFAULT_API_URL: "https://api.zerobounce.net/v2", USA_API_URL: "https://api-us.zerobounce.net/v2", EU_API_URL: "https://api-eu.zerobounce.net/v2" });
        static ZBValidateStatus = B;
        static ZBValidateSubStatus = F;
        static ZBDownloadType = P;
        static ListEvaluatorURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/v2/listevaluator" });
        static InboxPlacementURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/api/ipt" });
        static EmailFinderURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/email-finder" });
        static DomainSearchURL = Object.freeze({ DEFAULT_URL: "https://bulkapi.zerobounce.net/domain-search" });
        constructor() {
          this._initialized = false, Object.defineProperty(this, "_api_key", { value: null, writable: true, enumerable: false }), this._api_base_url = C.ApiURL.DEFAULT_API_URL, this._list_evaluator_base_url = C.ListEvaluatorURL.DEFAULT_URL, this._inbox_placement_base_url = C.InboxPlacementURL.DEFAULT_URL, this._email_finder_base_url = C.EmailFinderURL.DEFAULT_URL, this._domain_search_base_url = C.DomainSearchURL.DEFAULT_URL, this._regional_warning = { warned: false };
        }
        init(e2, t2 = C.ApiURL.DEFAULT_API_URL, r2 = null) {
          if (null == e2 || "" === String(e2).trim()) throw new Error("ZeroBounce: Api key parameter is missing. Please provide a valid API key.");
          u(e2, "Api key"), this._api_key = e2, this._api_base_url = o(t2, "apiBaseURL");
          const { listEvaluatorBaseURL: i2, inboxPlacementBaseURL: n2, emailFinderBaseURL: a2, domainSearchBaseURL: s2 } = r2 || {};
          this._list_evaluator_base_url = o(i2 ?? C.ListEvaluatorURL.DEFAULT_URL, "listEvaluatorBaseURL"), this._inbox_placement_base_url = o(n2 ?? C.InboxPlacementURL.DEFAULT_URL, "inboxPlacementBaseURL"), this._email_finder_base_url = o(a2 ?? C.EmailFinderURL.DEFAULT_URL, "emailFinderBaseURL"), this._domain_search_base_url = o(s2 ?? C.DomainSearchURL.DEFAULT_URL, "domainSearchBaseURL"), this._regional_warning = { warned: false }, this._initialized = true;
        }
        async getCredits() {
          if (this._initialized) return T({ requestType: "GET", params: { api_key: this._api_key }, path: "/getcredits", apiBaseURL: this._api_base_url });
          U();
        }
        async validateEmail(e2, t2 = null) {
          if (!this._initialized) return void U();
          if (O(e2)) return void k("Email");
          let r2, i2, n2, a2, s2, o2, l2;
          if ("string" == typeof t2 ? r2 = t2 : t2 && "object" == typeof t2 && (r2 = t2.ip_address, i2 = t2.timeout, n2 = t2.activityData, a2 = t2.verifyPlus, s2 = t2.domainInfo, o2 = t2.greylistProcessing, l2 = t2.callbackUrl), null != i2 && (i2 < 3 || i2 > 60)) return void A("timeout", "Must be between 3 and 60 seconds.");
          const u2 = {};
          if (null != n2 && (u2.activity_data = D(n2, "activityData")), null != a2 && (u2.verify_plus = D(a2, "verifyPlus")), null != s2 && (u2.domain_info = D(s2, "domainInfo")), null != o2 && (u2.greylist_processing = D(o2, "greylistProcessing")), null != l2 && "true" !== u2.greylist_processing) return void A("callbackUrl", "Requires greylistProcessing: true.");
          if (null != l2 && "" === String(l2).trim()) return void k("callbackUrl");
          const _2 = { api_key: this._api_key, email: e2 };
          return null != r2 && (_2.ip_address = r2), null != i2 && (_2.timeout = i2), Object.assign(_2, u2), null != l2 && (_2.callback_url = l2), (d2 = t2 && "object" == typeof t2 && "POST" === t2.method ? await T({ requestType: "POST", path: "/validate", body: new URLSearchParams(_2), params: {}, apiBaseURL: this._api_base_url }) : await T({ requestType: "GET", params: _2, path: "/validate", apiBaseURL: this._api_base_url })) && "object" == typeof d2 && !Array.isArray(d2) && void 0 === d2.message && "string" == typeof d2.Message && (d2.message = d2.Message), d2;
          var d2;
        }
        async getApiUsage(e2, t2) {
          if (this._initialized) if (O(e2)) k("Start date", "Format: YYYY-MM-DD");
          else {
            if (!O(t2)) return T({ requestType: "GET", params: { api_key: this._api_key, start_date: z(e2), end_date: z(t2) }, path: "/getapiusage", apiBaseURL: this._api_base_url });
            k("End date", "Format: YYYY-MM-DD");
          }
          else U();
        }
        async validateBatch(e2, t2 = null) {
          if (!this._initialized) return void U();
          if (null == e2) return void k("Email list");
          let r2, i2, n2;
          if (t2 && "object" == typeof t2 && (r2 = t2.timeout, i2 = t2.activityData, n2 = t2.verifyPlus), null != r2 && (r2 < 10 || r2 > 120)) return void A("timeout", "Must be between 10 and 120 seconds.");
          const a2 = { api_key: this._api_key, email_batch: e2 };
          return null != r2 && (a2.timeout = String(r2)), null != i2 && (a2.activity_data = i2), null != n2 && (a2.verify_plus = n2), T({ requestType: "POST", path: "/validatebatch", jsonBody: a2, apiBaseURL: this._api_base_url });
        }
        async getEmailActivity(e2) {
          if (this._initialized) {
            if (!O(e2)) return T({ requestType: "GET", params: { api_key: this._api_key, email: e2 }, path: "/activity", apiBaseURL: this._api_base_url });
            k("Email");
          } else U();
        }
        async scoreEmail(e2, t2 = null) {
          if (!this._initialized) return void U();
          if (O(e2)) return void k("Email");
          const r2 = { api_key: this._api_key, email: e2 };
          return T(t2 && "object" == typeof t2 && "POST" === t2.method ? { requestType: "POST", path: "/scoring", body: new URLSearchParams(r2), params: {}, apiBaseURL: this._api_base_url } : { requestType: "GET", params: r2, path: "/scoring", apiBaseURL: this._api_base_url });
        }
        async sendFile({ file: e2, email_address_column: t2, first_name_column: r2 = false, return_url: i2 = false, last_name_column: n2 = false, gender_column: a2 = false, ip_address_column: s2 = false, has_header_row: o2 = false, remove_duplicate: l2 = false, allowPhase2: u2 = null }) {
          if (!this._initialized) return void U();
          if (!e2) return void k("file");
          if (O(t2)) return void k("email_address_column");
          const _2 = new FormData();
          return i2 && _2.append("return_url", i2), r2 && _2.append("first_name_column", r2), n2 && _2.append("last_name_column", n2), a2 && _2.append("gender_column", a2), s2 && _2.append("ip_address_column", s2), _2.append("email_address_column", t2), _2.append("file", e2), _2.append("has_header_row", D(o2, "has_header_row", false)), _2.append("remove_duplicate", D(l2, "remove_duplicate", false)), _2.append("api_key", this._api_key), null != u2 && _2.append("allow_phase_2", D(u2, "allowPhase2")), T({ requestType: "POST", path: "/sendfile", body: _2, batch: true, apiBaseURL: this._api_base_url });
        }
        async sendFileStream(e2, t2, { email_address_column: r2, first_name_column: i2 = false, return_url: n2 = false, last_name_column: a2 = false, gender_column: s2 = false, ip_address_column: o2 = false, has_header_row: l2 = false, remove_duplicate: u2 = false, allowPhase2: _2 = null } = {}) {
          if (!this._initialized) return void U();
          if (!e2) return void k("fileStreamOrBlob");
          if (O(t2)) return void k("fileName");
          if (O(r2)) return void k("email_address_column");
          const d2 = new FormData();
          return n2 && d2.append("return_url", n2), i2 && d2.append("first_name_column", i2), a2 && d2.append("last_name_column", a2), s2 && d2.append("gender_column", s2), o2 && d2.append("ip_address_column", o2), d2.append("email_address_column", r2), d2.append("file", e2, t2), d2.append("has_header_row", D(l2, "has_header_row", false)), d2.append("remove_duplicate", D(u2, "remove_duplicate", false)), d2.append("api_key", this._api_key), null != _2 && d2.append("allow_phase_2", D(_2, "allowPhase2")), T({ requestType: "POST", path: "/sendfile", body: d2, batch: true, apiBaseURL: this._api_base_url });
        }
        async sendScoringFile({ file: e2, email_address_column: t2, return_url: r2 = false, has_header_row: i2 = false, remove_duplicate: n2 = false }) {
          if (!this._initialized) return void U();
          if (!e2) return void k("file: File");
          if (O(t2)) return void k("email_address_column: number");
          const a2 = new FormData();
          return r2 && a2.append("return_url", r2), a2.append("file", e2), a2.append("email_address_column", t2), a2.append("has_header_row", D(i2, "has_header_row", false)), a2.append("api_key", this._api_key), a2.append("remove_duplicate", D(n2, "remove_duplicate", false)), T({ requestType: "POST", path: "/scoring/sendfile", body: a2, batch: true, apiBaseURL: this._api_base_url });
        }
        async sendScoringFileStream(e2, t2, { email_address_column: r2, return_url: i2 = false, has_header_row: n2 = false, remove_duplicate: a2 = false } = {}) {
          if (!this._initialized) return void U();
          if (!e2) return void k("fileStreamOrBlob");
          if (O(t2)) return void k("fileName");
          if (O(r2)) return void k("email_address_column");
          const s2 = new FormData();
          return i2 && s2.append("return_url", i2), s2.append("file", e2, t2), s2.append("email_address_column", r2), s2.append("has_header_row", D(n2, "has_header_row", false)), s2.append("api_key", this._api_key), s2.append("remove_duplicate", D(a2, "remove_duplicate", false)), T({ requestType: "POST", path: "/scoring/sendfile", body: s2, batch: true, apiBaseURL: this._api_base_url });
        }
        async _getStatusUtil(e2, t2, { bulkRoot: r2 = false, baseURL: i2 = null } = {}) {
          if (this._initialized) {
            if (!O(e2)) return T({ requestType: "GET", params: { api_key: this._api_key, file_id: e2 }, path: t2, batch: true, bulkBase: r2 ? "root" : "v2", apiBaseURL: this._api_base_url, baseURL: i2 });
            k("File id");
          } else U();
        }
        async _sendBulkRootFormPost(e2, t2) {
          const r2 = { api_key: this._api_key, ...t2 };
          return T({ requestType: "POST", path: e2, body: new URLSearchParams(r2), params: {}, batch: true, bulkBase: "root", apiBaseURL: this._api_base_url });
        }
        async getFileStatus(e2) {
          return this._getStatusUtil(e2, "/filestatus");
        }
        async getScoringFileStatus(e2) {
          return this._getStatusUtil(e2, "/scoring/filestatus");
        }
        async _getFileUtil(e2, t2, r2 = false, i2 = null, { bulkRoot: n2 = false, baseURL: a2 = null } = {}) {
          if (!this._initialized) return void U();
          if (O(e2)) return void k("File id");
          const s2 = { api_key: this._api_key, file_id: e2 };
          return null != i2 && "object" == typeof i2 && (null != i2.downloadType && (s2.download_type = i2.downloadType), r2 || null == i2.activityData || (s2.activity_data = D(i2.activityData, "activityData"))), T({ requestType: "GET", params: s2, path: t2, batch: true, bulkBase: n2 ? "root" : "v2", returnText: true, scoring: r2, apiBaseURL: this._api_base_url, baseURL: a2 });
        }
        async getFile(e2, t2 = null) {
          return this._getFileUtil(e2, "/getfile", false, t2);
        }
        async getScoringFile(e2, t2 = null) {
          return this._getFileUtil(e2, "/scoring/getfile", true, t2);
        }
        async _deleteFileUtil(e2, t2, r2 = false, { bulkRoot: i2 = false, baseURL: n2 = null } = {}) {
          if (this._initialized) {
            if (!O(e2)) return T({ requestType: "GET", params: { api_key: this._api_key, file_id: e2 }, path: t2, batch: true, bulkBase: i2 ? "root" : "v2", scoring: r2, apiBaseURL: this._api_base_url, baseURL: n2 });
            k("File id");
          } else U();
        }
        async _sendBulkRootMultipartFile(e2, { file: t2, fileName: r2 = null, fields: i2 = {}, baseURL: n2 = null }) {
          const a2 = new FormData();
          for (const [e3, t3] of Object.entries(i2)) null != t3 && a2.append(e3, "boolean" == typeof t3 ? j(t3) : t3);
          return null != r2 ? a2.append("file", t2, r2) : a2.append("file", t2), a2.append("api_key", this._api_key), T({ requestType: "POST", path: e2, body: a2, batch: true, bulkBase: "root", apiBaseURL: this._api_base_url, baseURL: n2 });
        }
        async deleteFile(e2) {
          return this._deleteFileUtil(e2, "/deletefile");
        }
        async deleteScoringFile(e2) {
          return this._deleteFileUtil(e2, "/scoring/deletefile", true);
        }
        async sendEmailFinderFile({ file: e2, domain_column: t2, first_name_column: r2 = false, last_name_column: i2 = false, middle_name_column: n2 = false, full_name_column: a2 = false, has_header_row: s2 = false }) {
          if (this._initialized) if (e2) if (O(t2)) k("domain_column");
          else {
            if (r2 || a2) return this._sendBulkRootMultipartFile("/sendfile", { file: e2, baseURL: this._email_finder_base_url, fields: { domain_column: t2, first_name_column: I(r2), last_name_column: I(i2), middle_name_column: I(n2), full_name_column: I(a2), has_header_row: D(s2, "has_header_row", false) } });
            k("first_name_column", "Send first_name_column or full_name_column.");
          }
          else k("file");
          else U();
        }
        async sendEmailFinderFileStream(e2, t2, { domain_column: r2, first_name_column: i2 = false, last_name_column: n2 = false, middle_name_column: a2 = false, full_name_column: s2 = false, has_header_row: o2 = false } = {}) {
          if (this._initialized) if (e2) if (O(t2)) k("fileName");
          else if (O(r2)) k("domain_column");
          else {
            if (i2 || s2) return this._sendBulkRootMultipartFile("/sendfile", { file: e2, fileName: t2, baseURL: this._email_finder_base_url, fields: { domain_column: r2, first_name_column: I(i2), last_name_column: I(n2), middle_name_column: I(a2), full_name_column: I(s2), has_header_row: D(o2, "has_header_row", false) } });
            k("first_name_column", "Send first_name_column or full_name_column.");
          }
          else k("fileStreamOrBlob");
          else U();
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
        async sendDomainSearchFile({ file: e2, domain_column: t2, has_header_row: r2 = false }) {
          if (this._initialized) if (e2) {
            if (!O(t2)) return this._sendBulkRootMultipartFile("/sendfile", { file: e2, baseURL: this._domain_search_base_url, fields: { domain_column: t2, has_header_row: D(r2, "has_header_row", false) } });
            k("domain_column");
          } else k("file");
          else U();
        }
        async sendDomainSearchFileStream(e2, t2, { domain_column: r2, has_header_row: i2 = false } = {}) {
          if (this._initialized) if (e2) if (O(t2)) k("fileName");
          else {
            if (!O(r2)) return this._sendBulkRootMultipartFile("/sendfile", { file: e2, fileName: t2, baseURL: this._domain_search_base_url, fields: { domain_column: r2, has_header_row: D(i2, "has_header_row", false) } });
            k("domain_column");
          }
          else k("fileStreamOrBlob");
          else U();
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
          if (!this._initialized) return void U();
          if (!e2) return void k("file");
          if (O(t2)) return void k("email_address_column");
          const r2 = new FormData();
          return r2.append("file", e2), r2.append("email_address_column", t2), r2.append("api_key", this._api_key), T({ requestType: "POST", path: "/", body: r2, apiBaseURL: this._list_evaluator_base_url });
        }
        async sendListEvaluatorFileStream(e2, t2, { email_address_column: r2 } = {}) {
          if (!this._initialized) return void U();
          if (!e2) return void k("fileStreamOrBlob");
          if (O(t2)) return void k("fileName");
          if (O(r2)) return void k("email_address_column");
          const i2 = new FormData();
          return i2.append("file", e2, t2), i2.append("email_address_column", r2), i2.append("api_key", this._api_key), T({ requestType: "POST", path: "/", body: i2, apiBaseURL: this._list_evaluator_base_url });
        }
        async getListEvaluatorResult(e2) {
          if (this._initialized) {
            if (!O(e2)) return T({ requestType: "GET", params: { api_key: this._api_key }, path: `/${encodeURIComponent(e2)}/`, apiBaseURL: this._list_evaluator_base_url });
            k("File id");
          } else U();
        }
        async sendEvaluatedFile(e2) {
          if (!this._initialized) return void U();
          const t2 = "object" == typeof e2 && null !== e2 ? e2.file_id : e2;
          if (O(t2)) return void k("File id");
          const r2 = new FormData();
          return r2.append("api_key", this._api_key), r2.append("file_id", String(t2)), T({ requestType: "POST", path: "/send-evaluated-file/", body: r2, batch: true, secrets: [this._api_key], apiBaseURL: this._api_base_url, regionalWarningState: this._regional_warning });
        }
        async addFilter({ rule: e2, target: t2, value: r2 }) {
          if (!this._initialized) return void U();
          if (O(e2)) return void k("rule");
          if (!N.includes(e2)) return void A("rule", `Must be one of ${N.join(", ")}.`);
          if (O(t2)) return void k("target");
          if (!x.includes(t2)) return void A("target", `Must be one of ${x.join(", ")}.`);
          if (O(r2)) return void k("value");
          const i2 = { api_key: this._api_key, rule: e2, target: t2, value: r2 };
          return T({ requestType: "POST", path: "/filters/add", body: new URLSearchParams(i2), params: {}, apiBaseURL: this._api_base_url });
        }
        async listFilters(e2 = null) {
          if (!this._initialized) return void U();
          const t2 = { api_key: this._api_key };
          return T(e2 && "object" == typeof e2 && "POST" === e2.method ? { requestType: "POST", path: "/filters/list", body: new URLSearchParams(t2), params: {}, apiBaseURL: this._api_base_url } : { requestType: "GET", params: t2, path: "/filters/list", apiBaseURL: this._api_base_url });
        }
        async deleteFilter({ rule: e2, target: t2, value: r2 }) {
          if (!this._initialized) return void U();
          if (O(e2)) return void k("rule");
          if (!N.includes(e2)) return void A("rule", `Must be one of ${N.join(", ")}.`);
          if (O(t2)) return void k("target");
          if (!x.includes(t2)) return void A("target", `Must be one of ${x.join(", ")}.`);
          if (O(r2)) return void k("value");
          const i2 = { api_key: this._api_key, rule: e2, target: t2, value: r2 };
          return T({ requestType: "POST", path: "/filters/delete", body: new URLSearchParams(i2), params: {}, apiBaseURL: this._api_base_url });
        }
        async listS3files({ bucket: e2 = null, search: t2 = null } = {}) {
          if (!this._initialized) return void U();
          const r2 = { api_key: this._api_key };
          return null != e2 && (r2.bucket = e2), null != t2 && (r2.search = t2), T({ requestType: "GET", params: r2, path: "/listS3files", batch: true, bulkBase: "root", apiBaseURL: this._api_base_url });
        }
        async validateS3file(e2) {
          return this._bulkRootFileJob("/validateS3file", e2 || {});
        }
        async scoreS3file(e2) {
          return this._bulkRootFileJob("/scoreS3file", e2 || {});
        }
        async exportS3file({ file_id: e2, export_bucket: t2 = null } = {}) {
          if (!this._initialized) return void U();
          if (O(e2)) return void k("file_id");
          if (null != t2 && "" === String(t2).trim()) return void k("export_bucket");
          const r2 = { file_id: e2 };
          return null != t2 && (r2.export_bucket = t2), this._sendBulkRootFormPost("/exportS3file", r2);
        }
        async _bulkRootFileJob(e2, { file_name: t2, has_header_row: r2, remove_duplicates: i2, return_url: n2 }) {
          if (!this._initialized) return void U();
          if (O(t2) || "" === String(t2).trim()) return void k("file_name");
          if (null == r2) return void k("has_header_row");
          if (O(n2) || "" === String(n2).trim()) return void k("return_url", "The API rejects a job without it.");
          const a2 = { file_name: t2, has_header_row: D(r2, "has_header_row"), return_url: n2 };
          return null != i2 && (a2.remove_duplicates = D(i2, "remove_duplicates")), this._sendBulkRootFormPost(e2, a2);
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
          if (!this._initialized) return void U();
          if (O(e2)) return void k("file_id");
          if (null != t2 && "" === String(t2).trim()) return void k("export_path");
          const r2 = { file_id: e2 };
          return null != t2 && (r2.export_path = t2), this._sendBulkRootFormPost("/exportSFTPfile", r2);
        }
        _iptRequest(e2, t2, { params: r2 = null, jsonBody: i2 = null } = {}) {
          return T({ requestType: e2, path: t2, params: r2, jsonBody: i2, bearerToken: this._api_key, secrets: [this._api_key], apiBaseURL: this._api_base_url, baseURL: this._inbox_placement_base_url, regionalWarningState: this._regional_warning });
        }
        async getInboxPlacementProviders() {
          if (this._initialized) return this._iptRequest("GET", "/providers");
          U();
        }
        async getInboxPlacementTestTypes() {
          if (this._initialized) return this._iptRequest("GET", "/test-types");
          U();
        }
        async createInboxPlacementTest({ name: e2, testType: t2 = null, senderEmail: r2 = null, providerIds: i2 = null, seedIds: n2 = null, providers: a2 = null, webhookUrl: s2 = null } = {}) {
          if (!this._initialized) return void U();
          if (O(e2)) return void k("name");
          if (String(e2).length > 64) return void A("name", "Must be at most 64 characters.");
          if (null != t2 && ![1, 2, 3].includes(t2)) return void A("testType", "Must be 1, 2 or 3.");
          if (1 === t2 && O(r2)) return void k("senderEmail", "Required when testType is 1.");
          for (const e3 of a2 || []) {
            if (!e3 || "object" != typeof e3 || null == e3.id) return void A("providers", "Each entry needs an id.");
            if (null != e3.maxSeeds && e3.maxSeeds < 1) return void A("providers", "maxSeeds must be at least 1.");
          }
          const o2 = { name: e2 };
          return null != t2 && (o2.testType = t2), null != r2 && (o2.senderEmail = r2), null != i2 && (o2.providerIds = i2), null != n2 && (o2.seedIds = n2), null != a2 && (o2.providers = a2), null != s2 && (o2.webhookUrl = s2), this._iptRequest("POST", "/test", { jsonBody: o2 });
        }
        async getInboxPlacementTest(e2) {
          if (this._initialized) {
            if (!O(e2)) return this._iptRequest("GET", `/test/${encodeURIComponent(String(e2).trim())}`);
            k("testId");
          } else U();
        }
        async listInboxPlacementTests({ status: e2 = null, createdAfter: t2 = null, createdBefore: r2 = null, page: i2 = null, pageSize: n2 = null } = {}) {
          if (!this._initialized) return void U();
          if (null != e2 && !["running", "finished"].includes(e2)) return void A("status", "Must be running or finished.");
          if (null != i2 && i2 < 1) return void A("page", "Must be at least 1.");
          if (null != n2 && (n2 < 1 || n2 > 100)) return void A("pageSize", "Must be between 1 and 100.");
          const a2 = {};
          return null != e2 && (a2.status = e2), null != t2 && (a2.createdAfter = t2), null != r2 && (a2.createdBefore = r2), null != i2 && (a2.page = i2), null != n2 && (a2.page_size = n2), this._iptRequest("GET", "/tests", { params: a2 });
        }
        async deleteInboxPlacementTest(e2) {
          if (this._initialized) {
            if (!O(e2)) return this._iptRequest("DELETE", `/test/${encodeURIComponent(String(e2).trim())}`);
            k("testId");
          } else U();
        }
        async getInboxPlacementWebhook() {
          if (this._initialized) return this._iptRequest("GET", "/webhook");
          U();
        }
        async setInboxPlacementWebhook(e2) {
          if (this._initialized) {
            if (!O(e2)) return this._iptRequest("PUT", "/webhook", { jsonBody: { webhookUrl: e2 } });
            k("webhookUrl");
          } else U();
        }
        async findEmailByDomain({ domain: e2, first_name: t2, middle_name: r2 = null, last_name: i2 = null }) {
          return this._findEmail({ domain: e2, first_name: t2, middle_name: r2, last_name: i2 });
        }
        async findEmailByCompanyName({ company_name: e2, first_name: t2, middle_name: r2 = null, last_name: i2 = null }) {
          return this._findEmail({ company_name: e2, first_name: t2, middle_name: r2, last_name: i2 });
        }
        async _findEmail({ domain: e2 = null, company_name: t2 = null, first_name: r2 = null, middle_name: i2 = null, last_name: n2 = null }) {
          if (!this._initialized) return void U();
          if (O(e2) && O(t2)) return k("domain"), void k("company_name");
          const a2 = { api_key: this._api_key };
          return O(r2) || (a2.first_name = r2), O(i2) || (a2.middle_name = i2), O(n2) || (a2.last_name = n2), null != e2 ? a2.domain = e2 : null != t2 && (a2.company_name = t2), T({ requestType: "GET", params: a2, path: "/guessformat", apiBaseURL: this._api_base_url, messageOnlyIsFailure: true });
        }
        async findEmailFormatByDomain({ domain: e2 }) {
          return this._findEmailFormat({ domain: e2 });
        }
        async findEmailFormatByCompanyName({ company_name: e2 }) {
          return this._findEmailFormat({ company_name: e2 });
        }
        async _findEmailFormat({ domain: e2 = null, company_name: t2 = null }) {
          if (!this._initialized) return void U();
          if (O(e2) && O(t2)) return k("domain"), void k("company_name");
          const r2 = { api_key: this._api_key };
          return null != e2 ? r2.domain = e2 : null != t2 && (r2.company_name = t2), T({ requestType: "GET", params: r2, path: "/guessformat", apiBaseURL: this._api_base_url, messageOnlyIsFailure: true });
        }
        async guessFormat({ domain: e2, first_name: t2 = null, middle_name: r2 = null, last_name: i2 = null }) {
          if (console.warn("guessFormat() is deprecated. Use findEmail for Email Finder API, or findEmailFormat for Domain Search API."), !this._initialized) return void U();
          if (O(e2)) return void k("domain");
          const n2 = { api_key: this._api_key, domain: e2 };
          return O(t2) || (n2.first_name = t2), O(r2) || (n2.middle_name = r2), O(i2) || (n2.last_name = i2), T({ requestType: "GET", params: n2, path: "/guessformat", apiBaseURL: this._api_base_url, messageOnlyIsFailure: true });
        }
      }
      const $ = "https://warmup-api.zerobounce.net", M = ["self_managed", "zb_managed"], q = ["transactional", "newsletter", "marketing"], G = [0, 4], Z = [0, 8], J = /^[A-Za-z0-9.\-_@+]*$/, W = /^\d{4}-\d{2}-\d{2}$/;
      function Y(e2) {
        return new Error(`ZeroBounce: ${e2}`);
      }
      function H(e2, t2) {
        if (null == e2 || !String(e2).trim()) throw Y(`${t2} parameter is missing.`);
        return e2;
      }
      function K(e2, [t2, r2], i2) {
        if ("number" != typeof e2 || !Number.isInteger(e2) || e2 < t2 || e2 > r2) throw Y(`${i2} parameter is invalid. Must be ${t2} to ${r2}.`);
        return e2;
      }
      function X(e2, t2) {
        if (e2 instanceof Date) return e2.toISOString().slice(0, 10);
        if ("string" != typeof e2 || !W.test(e2)) throw Y(`${t2} parameter is invalid. Expected YYYY-MM-DD.`);
        return e2;
      }
      function V() {
        if ("undefined" != typeof AbortSignal && "function" == typeof AbortSignal.timeout) return AbortSignal.timeout(12e4);
      }
      class Q {
        static DEFAULT_BASE_URL = $;
        constructor(e2, t2 = $) {
          u(e2, "Warmup api key");
          const r2 = a(t2 || $, "baseURL");
          Object.defineProperty(this, "_api_key", { value: e2, writable: true, enumerable: false }), this._root = `${s(r2)}/api/v1/warmup`;
        }
        async _send(e2, t2, { params: r2 = null, jsonBody: i2 = null, secrets: s2 = [] } = {}) {
          const o2 = r2 && Object.keys(r2).length ? `?${new URLSearchParams(r2)}` : "", l2 = `${this._root}${t2}${o2}`;
          a(l2, "request URL");
          const u2 = [this._api_key, ...s2], d2 = { "API-Key": this._api_key, Accept: "application/json" };
          let c2;
          null != i2 && (d2["Content-Type"] = "application/json");
          try {
            c2 = await fetch(l2, { method: e2, headers: d2, body: null != i2 ? JSON.stringify(i2) : void 0, signal: V(), redirect: "error" });
          } catch (e3) {
            const t3 = e3 && e3.name ? e3.name : "Error", r3 = e3 && e3.message ? e3.message : String(e3);
            throw new Error(_(`${t3}: ${r3}`, u2));
          }
          const m2 = "number" == typeof c2.status ? c2.status : 200;
          if (m2 >= 300 && m2 < 400) throw n("ZeroBounce returned a redirect, which this client does not follow.", m2);
          const p2 = "function" == typeof c2.text ? await c2.text() : "";
          if (m2 > 299) throw n(_(te(p2, m2), u2), m2);
          return { status: m2, body: p2, response: c2 };
        }
        async _json(e2, t2, r2 = {}) {
          const { status: i2, body: a2 } = await this._send(e2, t2, r2);
          if (204 === i2 || !String(a2).trim()) return null;
          try {
            return JSON.parse(a2);
          } catch {
            throw n(_(te(a2, i2), [this._api_key, ...r2.secrets || []]), i2);
          }
        }
        async _csv(e2, t2 = null) {
          const { status: r2, body: i2, response: a2 } = await this._send("GET", e2, { params: t2 }), s2 = a2 && a2.headers && "function" == typeof a2.headers.get ? String(a2.headers.get("content-type") || "").toLowerCase() : "";
          if (!String(i2).trim() || s2.includes("application/json")) throw n(_(te(i2, r2), [this._api_key]), r2);
          return i2;
        }
        async listSendingAccounts() {
          return this._json("GET", "/sending-accounts");
        }
        async getSendingAccount(e2) {
          return this._json("GET", "/sending-account", { params: { from_address: H(e2, "from_address") } });
        }
        async addSendingAccount({ fromAddress: e2, onboardingModel: t2, engagementRuleId: r2 = null, ignoreConflict: i2 = null, emailContent: n2 = null, managedSending: a2 = null } = {}) {
          if (H(e2, "from_address"), !M.includes(t2)) throw Y("onboarding_model parameter is invalid. Must be self_managed or zb_managed.");
          const s2 = { from_address: e2, onboarding_model: t2 };
          if ("self_managed" === t2) {
            if (null == r2) throw Y("engagement_rule_id parameter is missing. Required for self_managed.");
            if (s2.engagement_rule_id = K(r2, G, "engagement_rule_id"), null != n2 || null != a2) throw Y("email_content and managed_sending are for zb_managed.");
          } else if (null != r2) throw Y("engagement_rule_id is for self_managed.");
          if (null != i2 && (s2.ignore_conflict = l(i2, "ignore_conflict")), null != n2) {
            const e3 = { ...n2 }, t3 = e3.types_of_emails;
            if (null != t3 && (!Array.isArray(t3) || t3.some((e4) => !q.includes(e4)))) throw Y("types_of_emails parameter is invalid. transactional, newsletter and/or marketing.");
            s2.email_content = e3;
          }
          if (null != a2) {
            const e3 = { ...a2 }, t3 = e3.timezone_offset;
            if (null != t3 && ("number" != typeof t3 || t3 < -11 || t3 > 14)) throw Y("timezone_offset parameter is invalid. Must be -11 to 14.");
            null != e3.warmup_start_date && (e3.warmup_start_date = X(e3.warmup_start_date, "warmup_start_date")), s2.managed_sending = e3;
          }
          return this._json("POST", "/sending-accounts", { jsonBody: s2 });
        }
        async updateSendingAccount({ fromAddress: e2, engagementRuleId: t2, statusId: r2, autoEnable: i2 } = {}) {
          if (H(e2, "from_address"), "boolean" != typeof i2) throw Y("auto_enable parameter is missing. Must be true or false.");
          return this._json("PUT", "/sending-accounts", { jsonBody: { team_id: 1, from_address: e2, engagement_rule_id: K(t2, G, "engagement_rule_id"), status_id: K(r2, Z, "status_id"), auto_enable: i2 } });
        }
        async deleteSendingAccount(e2) {
          return this._json("DELETE", "/sending-accounts", { params: { from_address: H(e2, "from_address") } });
        }
        async changeFromAddress(e2, t2) {
          return this._json("PUT", "/smtp-credentials", { jsonBody: { team_id: 1, old_from_address: H(e2, "old_from_address"), new_from_address: H(t2, "new_from_address") } });
        }
        async listFromAddresses({ searchFrom: e2 = null, offset: t2 = null, limit: r2 = null } = {}) {
          const i2 = {};
          if (null != e2) {
            if (!J.test(e2)) throw Y("search_from parameter is invalid. Letters, digits and . - _ @ + only.");
            i2.search_from = e2;
          }
          for (const [e3, n2] of [["offset", t2], ["limit", r2]]) if (null != n2) {
            if ("number" != typeof n2 || !Number.isInteger(n2) || n2 < 0) throw Y(`${e3} parameter is invalid. Must be a non-negative integer.`);
            i2[e3] = String(n2);
          }
          return this._json("GET", "/from-addresses", { params: i2 });
        }
        async getEngagementRules() {
          return this._json("GET", "/engagement-rules");
        }
        async setEngagementRule(e2, t2) {
          return H(e2, "c_from"), this._json("PUT", "/engagement-rule", { params: { c_from: e2 }, jsonBody: { rule_id: K(t2, G, "rule_id") } });
        }
        async getCustomEngagement(e2) {
          return this._json("GET", `/custom-engagement/${(function(e3, t2) {
            const r2 = null == e3 ? "" : String(e3).trim();
            if (!r2) throw new Error(`ZeroBounce: ${t2} parameter is missing.`);
            if ("." === r2 || ".." === r2) throw new Error(`ZeroBounce: ${t2} parameter is invalid.`);
            return encodeURIComponent(r2);
          })(e2, "c_from")}`);
        }
        async createCustomEngagement({ cFrom: e2, replyPct: t2, importantPct: r2, clickPct: i2 } = {}) {
          return this._json("POST", "/custom-engagement", { jsonBody: ee(e2, t2, r2, i2) });
        }
        async updateCustomEngagement({ cFrom: e2, replyPct: t2, importantPct: r2, clickPct: i2 } = {}) {
          return this._json("PUT", "/custom-engagement", { jsonBody: ee(e2, t2, r2, i2) });
        }
        async deleteCustomEngagement(e2, t2) {
          return this._json("DELETE", "/custom-engagement", { jsonBody: { c_from: H(e2, "c_from"), engagement_rule_id: K(t2, [1, 4], "engagement_rule_id") } });
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
          return this._json("GET", "/statistics", { params: { from_address: H(e2, "from_address") } });
        }
        async getStatisticsPerDay({ fromAddress: e2, startDate: t2, endDate: r2 } = {}) {
          H(e2, "from_address");
          const i2 = X(t2, "start_date"), n2 = X(r2, "end_date");
          if (i2 > n2) throw Y("start_date parameter is invalid. It is later than end_date.");
          return this._json("GET", "/statistics-per-day", { params: { from_address: e2, start_date: i2, end_date: n2 } });
        }
        async getStatisticsDetailed(e2) {
          return this._json("GET", "/statistics-detailed", { params: { c_from: H(e2, "c_from") } });
        }
        async downloadStatistics(e2) {
          return this._csv("/statistics/download", { c_from: H(e2, "c_from") });
        }
        async getFromAddressStatistics(e2) {
          return this._json("GET", "/from-address-statistics", { params: { from_address: H(e2, "from_address") } });
        }
        async checkDomainDmarc(e2, t2 = null) {
          if (H(e2, "from_address"), !String(e2).includes("@")) throw Y("from_address parameter is invalid. Pass an email address, e.g. sender@example.com.");
          const r2 = { from_address: e2 };
          return null != t2 && (r2.dkim_selector = H(t2, "dkim_selector")), this._json("GET", "/check-domain-dmarc", { params: r2 });
        }
        async testSmtpConfiguration({ fromAddress: e2, username: t2, password: r2, server: i2, port: n2 } = {}) {
          if ("number" != typeof n2 || !Number.isInteger(n2) || n2 < 1 || n2 > 65535) throw Y("port parameter is invalid. Must be 1 to 65535.");
          const a2 = { from_address: H(e2, "from_address"), username: H(t2, "username"), password: H(r2, "password"), server: H(i2, "server"), port: n2 };
          return this._json("POST", "/test-smtp-configuration", { jsonBody: a2, secrets: [r2, t2] });
        }
      }
      function ee(e2, t2, r2, i2) {
        if (H(e2, "c_from"), K(t2, [5, 45], "reply_pct"), K(r2, [5, 40], "important_pct"), K(i2, [0, 70], "click_pct"), i2 > 1.75 * r2) throw Y("click_pct parameter is invalid. At most important_pct x 1.75.");
        return { c_from: e2, reply_pct: t2, important_pct: r2, click_pct: i2 };
      }
      function te(e2, t2) {
        const r2 = String(e2 || "").trim();
        if (!r2) return `Empty response from ZeroBounce (HTTP ${t2})`;
        const i2 = r2.slice(0, 2e3).toLowerCase();
        if (i2.includes("<!doctype html") || i2.includes("<html")) return "ZeroBounce returned an HTML error page instead of an API response.";
        if (r2.startsWith("{") || r2.startsWith("[")) {
          let e3;
          try {
            e3 = JSON.parse(r2);
          } catch {
            return "ZeroBounce returned a response that is not valid JSON.";
          }
          if (Array.isArray(e3)) {
            const t3 = e3.find((e4) => "string" == typeof e4 && e4.trim());
            if (t3) return t3.trim();
          } else if (e3 && "object" == typeof e3) for (const t3 of ["message", "error", "error_message", "detail"]) {
            const r3 = e3[t3];
            if ("string" == typeof r3 && r3.trim()) return r3.trim();
            if (Array.isArray(r3) && r3.length) {
              const e4 = r3.filter((e5) => "string" == typeof e5 && e5.trim());
              if (e4.length) return e4.join("; ");
              const t4 = r3[0];
              if (t4 && "object" == typeof t4 && t4.msg) {
                const e5 = Array.isArray(t4.loc) ? t4.loc.slice(1).join(".") : "";
                return e5 ? `${e5}: ${t4.msg}` : String(t4.msg);
              }
            }
          }
          return `ZeroBounce returned an error (HTTP ${t2}).`;
        }
        return r2.length > 1e3 ? "ZeroBounce returned a response that is not valid JSON." : r2;
      }
      C.Warmup = Q, C.ZeroBounceWarmup = Q, C.ZBApiError = i, C.ZeroBounceSDK = C, C.default = C;
      const re = C;
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
function validateBulkReturnUrl(returnUrl, fieldName = "returnUrl") {
  let parsed;
  try {
    parsed = new URL(returnUrl);
  } catch {
    throw new Error(`${fieldName} must be a valid URL`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${fieldName} must use HTTPS`);
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

// src/zerobounce-client.ts
function isEmptySuccessBody(error) {
  const status = error?.statusCode;
  if (typeof status !== "number" || status < 200 || status >= 300) {
    return false;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /^Empty response from ZeroBounce/.test(message.trim());
}
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
  apiKey;
  baseUrl;
  // Use official ZeroBounce SDK for core endpoints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk;
  warmupClient;
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.zerobounce.net/v2";
    this.sdk = new zeroBounceSDK_default();
    this.sdk.init(this.apiKey, this.baseUrl);
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
  /** Whether this client can serve Warmup calls. */
  get hasWarmup() {
    return this.warmupClient !== void 0;
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
    try {
      const result = await this.sdk.deleteInboxPlacementTest(testId);
      if (result == null) {
        return { success: true, message: `Inbox placement test ${testId} deleted` };
      }
      return result;
    } catch (error) {
      if (isEmptySuccessBody(error)) {
        return { success: true, message: `Inbox placement test ${testId} deleted` };
      }
      throw error;
    }
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
function optionalString(value) {
  return typeof value === "string" && value ? value : void 0;
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
      const emailAddressColumn = optionalNumber(args.emailAddressColumn, "emailAddressColumn");
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
        const emailAddressColumn = config.supportsEmailAddressColumn ? optionalNumber(args.emailAddressColumn, "emailAddressColumn") : void 0;
        const domainColumn = config.supportsDomainColumn ? optionalNumber(args.domainColumn, "domainColumn") : void 0;
        const companyNameColumn = config.supportsCompanyNameColumn ? optionalNumber(args.companyNameColumn, "companyNameColumn") : void 0;
        const fullNameColumn = config.supportsFullNameColumn ? optionalNumber(args.fullNameColumn, "fullNameColumn") : void 0;
        const firstNameColumn = config.supportsFirstNameColumn ? optionalNumber(args.firstNameColumn, "firstNameColumn") : void 0;
        const middleNameColumn = config.supportsMiddleNameColumn ? optionalNumber(args.middleNameColumn, "middleNameColumn") : void 0;
        const lastNameColumn = config.supportsLastNameColumn ? optionalNumber(args.lastNameColumn, "lastNameColumn") : void 0;
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
  sendFileMethod: (client, fileContent, fileName, _returnUrl, _emailCol, domainColumn, _c, full, first, middle, last) => client.bulkEmailFinderSendFile(fileContent, fileName, domainColumn ?? 0, {
    fullNameColumn: full,
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
      const emailAddressColumn = optionalNumber(args.emailAddressColumn, "emailAddressColumn") ?? 0;
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
  validateBulkReturnUrl(webhookUrl, fieldName);
  return webhookUrl;
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
      const senderEmail = optionalString(args.senderEmail);
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
      const status = optionalString(args.status);
      if (status !== void 0) {
        if (!TEST_STATUSES.includes(status)) {
          throw new Error(`status must be one of ${TEST_STATUSES.join(", ")}`);
        }
        options.status = status;
      }
      const createdAfter = optionalString(args.createdAfter);
      if (createdAfter !== void 0) {
        options.createdAfter = createdAfter;
      }
      const createdBefore = optionalString(args.createdBefore);
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
        searchFrom: optionalString(args.searchFrom) ?? null,
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
        optionalString(args.dkimSelector) ?? null
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

// src/index.ts
var API_KEY_HEADER = "x-zerobounce-api-key";
var WARMUP_API_KEY_HEADER = "x-zerobounce-warmup-api-key";
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
function resolveWarmupBaseUrl(value) {
  const raw = value?.trim();
  if (!raw) return DEFAULT_WARMUP_BASE_URL;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`Invalid Warmup API URL: ${raw}. Use an https:// URL.`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`The Warmup API URL must use https, got: ${raw}`);
  }
  return raw.replace(/\/+$/, "");
}
var SERVER_VERSION = true ? "0.3.0" : "0.0.0-dev";
var ZeroBounceMCPServer = class {
  server;
  client;
  config;
  constructor(config) {
    this.config = config;
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
                  apiKeyConfigured: !!this.config.apiKey,
                  warmupBaseUrl: this.config.warmupBaseUrl,
                  warmupApiKeyConfigured: !!this.config.warmupApiKey
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
function headerValue(req, name) {
  const header = req.headers[name];
  const value = Array.isArray(header) ? header[0] : header;
  return value?.trim() ?? "";
}
function getRequestApiKey(req) {
  const value = headerValue(req, API_KEY_HEADER);
  if (value) {
    return value;
  }
  const authorization = req.headers.authorization;
  return typeof authorization === "string" ? bearerToken(authorization) : "";
}
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
  const apiKey = getRequestApiKey(req);
  if (!apiKey) {
    sendJsonRpcError(
      res,
      401,
      `ZeroBounce API key is required. Send it in the X-ZeroBounce-Api-Key header or as Authorization: Bearer <key>.`
    );
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
async function runHttp(host, port, baseUrl, warmupBaseUrl) {
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
    handleMcpRequest(req, res, baseUrl, warmupBaseUrl).catch((error) => {
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
    warmupApiKey: "",
    transport: process.env.MCP_TRANSPORT?.trim() === "http" ? "http" : "stdio",
    // Loopback by default; hosted deployments must opt in to 0.0.0.0 explicitly.
    host: process.env.MCP_HOST?.trim() || "127.0.0.1",
    port: Number(process.env.PORT) || 3e3,
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
  if (!config.warmupApiKey) {
    config.warmupApiKey = process.env.ZEROBOUNCE_WARMUP_API_KEY?.trim() ?? "";
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
      await runHttp(config.host, config.port, config.baseUrl, config.warmupBaseUrl);
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
  console.error("Fatal error:", error);
  process.exit(1);
});

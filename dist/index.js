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
    !(function(e, i) {
      "object" == typeof exports && "object" == typeof module ? module.exports = i() : "function" == typeof define && define.amd ? define([], i) : "object" == typeof exports ? exports.ZeroBounceSDK = i() : e.ZeroBounceSDK = i();
    })(exports, () => (() => {
      "use strict";
      var e = { d: (i2, a2) => {
        for (var t2 in a2) e.o(a2, t2) && !e.o(i2, t2) && Object.defineProperty(i2, t2, { enumerable: true, get: a2[t2] });
      }, o: (e2, i2) => Object.prototype.hasOwnProperty.call(e2, i2) }, i = {};
      e.d(i, { default: () => m });
      const a = { Accept: "*/*", "Accept-Encoding": "gzip, deflate, br", Connection: "keep-alive" };
      function t(e2, i2) {
        const a2 = e2[i2];
        return null != a2 && ("string" == typeof a2 ? "" !== a2.trim() : !!Array.isArray(a2) && a2.some((e3) => "string" == typeof e3 && "" !== e3.trim()));
      }
      function n() {
        return "undefined" != typeof window && "undefined" != typeof document && "function" == typeof document.createElement;
      }
      function r(e2, i2, a2) {
        const r2 = (i2.headers.get("content-type") || "").toLowerCase(), s2 = e2.trim();
        if (r2.includes("application/json") || s2.startsWith("{") || s2.startsWith("[")) try {
          const i3 = JSON.parse(e2);
          if ((function(e3) {
            return !(!e3 || "object" != typeof e3 || Array.isArray(e3)) && (!(!(i4 = e3) || "object" != typeof i4 || Array.isArray(i4) || !(Object.prototype.hasOwnProperty.call(i4, "success") && null != i4.success && (false === i4.success || "False" === i4.success || "false" === i4.success) || t(i4, "message") || t(i4, "error") || t(i4, "error_message"))) || Object.prototype.hasOwnProperty.call(e3, "success"));
            var i4;
          })(i3)) return i3;
        } catch {
        }
        if (!i2.ok) try {
          return JSON.parse(e2);
        } catch {
          throw new Error(e2 || `HTTP ${i2.status}`);
        }
        return n() ? (function(e3, i3) {
          if (!n()) throw new Error("saveFile is only available in browser environments");
          if (!window.navigator.msSaveOrOpenBlob) {
            const a3 = document.createElement("a");
            document.body.appendChild(a3);
            const t2 = window.URL.createObjectURL(e3);
            return a3.href = t2, a3.download = i3, a3.click(), setTimeout(() => {
              window.URL.revokeObjectURL(t2), document.body.removeChild(a3);
            }, 0), i3;
          }
          window.navigator.msSaveOrOpenBlob(e3, i3);
        })(new Blob([e2], { type: "text/csv" }), `result${a2 ? "-scoring" : ""}.csv`) : e2;
      }
      async function s({ requestType: e2, body: i2 = null, params: t2 = null, path: n2, batch: s2 = false, returnText: l2 = false, scoring: _2 = false, apiBaseURL: o2 }) {
        const d2 = `${s2 ? "https://bulkapi.zerobounce.net/v2" : o2}${n2}?${new URLSearchParams(t2)}`;
        try {
          const t3 = await fetch(d2, { method: e2, headers: a, body: i2 });
          if (l2) return r(await t3.text(), t3, _2);
          if (403 === t3.status) throw new Error("[Error]: api_key is invalid");
          return await t3.json();
        } catch (e3) {
          throw new Error(e3);
        }
      }
      function l() {
        console.error("ZeroBounce: Call init function first with a valid api key.");
      }
      function _(e2, i2 = "") {
        console.error(`ZeroBounce: ${e2} parameter is missing. ${i2}`);
      }
      const o = Object.freeze({ NONE: "", VALID: "valid", INVALID: "invalid", CATCH_ALL: "catch-all", UNKNOWN: "unknown", SPAMTRAP: "spamtrap", ABUSE: "abuse", DO_NOT_MAIL: "do_not_mail" }), d = Object.freeze({ NONE: "", ANTISPAM_SYSTEM: "antispam_system", GREYLISTED: "greylisted", MAIL_SERVER_TEMPORARY_ERROR: "mail_server_temporary_error", FORCIBLE_DISCONNECT: "forcible_disconnect", MAIL_SERVER_DID_NOT_RESPOND: "mail_server_did_not_respond", TIMEOUT_EXCEEDED: "timeout_exceeded", FAILED_SMTP_CONNECTION: "failed_smtp_connection", MAILBOX_QUOTA_EXCEEDED: "mailbox_quota_exceeded", EXCEPTION_OCCURRED: "exception_occurred", POSSIBLE_TRAP: "possible_trap", ROLE_BASED: "role_based", GLOBAL_SUPPRESSION: "global_suppression", MAILBOX_NOT_FOUND: "mailbox_not_found", NO_DNS_ENTRIES: "no_dns_entries", FAILED_SYNTAX_CHECK: "failed_syntax_check", POSSIBLE_TYPO: "possible_typo", UNROUTABLE_IP_ADDRESS: "unroutable_ip_address", LEADING_PERIOD_REMOVED: "leading_period_removed", DOES_NOT_ACCEPT_MAIL: "does_not_accept_mail", ALIAS_ADDRESS: "alias_address", ROLE_BASED_CATCH_ALL: "role_based_catch_all", DISPOSABLE: "disposable", TOXIC: "toxic", ALTERNATE: "alternate", MX_FORWARD: "mx_forward", BLOCKED: "blocked", ALLOWED: "allowed", ACCEPT_ALL: "accept_all", ROLE_BASED_ACCEPT_ALL: "role_based_accept_all", GOLD: "gold" }), p = Object.freeze({ PHASE_1: "phase_1", PHASE_2: "phase_2", COMBINED: "combined" });
      class u {
        static ApiURL = Object.freeze({ DEFAULT_API_URL: "https://api.zerobounce.net/v2", USA_API_URL: "https://api-us.zerobounce.net/v2", EU_API_URL: "https://api-eu.zerobounce.net/v2" });
        static ZBValidateStatus = o;
        static ZBValidateSubStatus = d;
        static ZBDownloadType = p;
        constructor() {
          this._initialized = false, this._api_key = null, this._api_base_url = u.ApiURL.DEFAULT_API_URL;
        }
        init(e2, i2 = u.ApiURL.DEFAULT_API_URL) {
          e2 ? (this._api_key = e2, this._api_base_url = i2, this._initialized = true) : _("Api key", "Please provide a valid API key.");
        }
        getCredits() {
          if (this._initialized) return s({ requestType: "GET", params: { api_key: this._api_key }, path: "/getcredits", apiBaseURL: this._api_base_url });
          l();
        }
        validateEmail(e2, i2 = null) {
          if (!this._initialized) return void l();
          if (!e2) return void _("Email");
          let a2, t2;
          if ("string" == typeof i2 ? a2 = i2 : i2 && "object" == typeof i2 && (a2 = i2.ip_address, t2 = i2.timeout), null != t2 && (t2 < 3 || t2 > 60)) return void (function(e3, i3 = "") {
            console.error(`ZeroBounce: ${e3} parameter is invalid. ${i3}`);
          })("timeout", "Must be between 3 and 60 seconds.");
          const n2 = { api_key: this._api_key, email: e2 };
          return null != a2 && (n2.ip_address = a2), null != t2 && (n2.timeout = t2), s({ requestType: "GET", params: n2, path: "/validate", apiBaseURL: this._api_base_url });
        }
        getApiUsage(e2, i2) {
          if (this._initialized) if (e2) {
            if (i2) return s({ requestType: "GET", params: { api_key: this._api_key, start_date: e2, end_date: i2 }, path: "/getapiusage", apiBaseURL: this._api_base_url });
            _("End date", "Format: YYYY-MM-DD");
          } else _("Start date", "Format: YYYY-MM-DD");
          else l();
        }
        validateBatch(e2) {
          if (!this._initialized) return void l();
          if (!e2) return void _("Email list");
          const i2 = { api_key: this._api_key, email_batch: e2 };
          return s({ requestType: "POST", path: "/validatebatch", body: JSON.stringify(i2), batch: true, apiBaseURL: this._api_base_url });
        }
        getEmailActivity(e2) {
          if (this._initialized) {
            if (e2) return s({ requestType: "GET", params: { api_key: this._api_key, email: e2 }, path: "/activity", apiBaseURL: this._api_base_url });
            _("Email");
          } else l();
        }
        sendFile({ file: e2, email_address_column: i2, first_name_column: a2 = false, return_url: t2 = false, last_name_column: n2 = false, gender_column: r2 = false, ip_address_column: o2 = false, has_header_row: d2 = false, remove_duplicate: p2 = false, allowPhase2: u2 = null }) {
          if (!this._initialized) return void l();
          if (!e2) return void _("file");
          if (!i2) return void _("email_address_column");
          const m2 = new FormData();
          return t2 && m2.append("return_url", t2), a2 && m2.append("first_name_column", a2), n2 && m2.append("last_name_column", n2), r2 && m2.append("gender_column", r2), o2 && m2.append("ip_address_column", o2), m2.append("email_address_column", i2), m2.append("file", e2), m2.append("has_header_row", d2), m2.append("remove_duplicate", p2), m2.append("api_key", this._api_key), null != u2 && m2.append("allow_phase_2", String(u2)), s({ requestType: "POST", path: "/sendfile", body: m2, batch: true, apiBaseURL: this._api_base_url });
        }
        sendFileStream(e2, i2, { email_address_column: a2, first_name_column: t2 = false, return_url: n2 = false, last_name_column: r2 = false, gender_column: o2 = false, ip_address_column: d2 = false, has_header_row: p2 = false, remove_duplicate: u2 = false, allowPhase2: m2 = null } = {}) {
          if (!this._initialized) return void l();
          if (!e2) return void _("fileStreamOrBlob");
          if (!i2) return void _("fileName");
          if (!a2) return void _("email_address_column");
          const c = new FormData();
          return n2 && c.append("return_url", n2), t2 && c.append("first_name_column", t2), r2 && c.append("last_name_column", r2), o2 && c.append("gender_column", o2), d2 && c.append("ip_address_column", d2), c.append("email_address_column", a2), c.append("file", e2, i2), c.append("has_header_row", p2), c.append("remove_duplicate", u2), c.append("api_key", this._api_key), null != m2 && c.append("allow_phase_2", String(m2)), s({ requestType: "POST", path: "/sendfile", body: c, batch: true, apiBaseURL: this._api_base_url });
        }
        sendScoringFile({ file: e2, email_address_column: i2, return_url: a2 = false, has_header_row: t2 = false, remove_duplicate: n2 = false }) {
          if (!this._initialized) return void l();
          if (!e2) return void _("file: File");
          if (!i2) return void _("email_address_column: number");
          const r2 = new FormData();
          return a2 && r2.append("return_url", a2), r2.append("file", e2), r2.append("email_address_column", i2), r2.append("has_header_row", t2), r2.append("api_key", this._api_key), r2.append("remove_duplicate", n2), s({ requestType: "POST", path: "/scoring/sendfile", body: r2, batch: true, apiBaseURL: this._api_base_url });
        }
        sendScoringFileStream(e2, i2, { email_address_column: a2, return_url: t2 = false, has_header_row: n2 = false, remove_duplicate: r2 = false } = {}) {
          if (!this._initialized) return void l();
          if (!e2) return void _("fileStreamOrBlob");
          if (!i2) return void _("fileName");
          if (!a2) return void _("email_address_column");
          const o2 = new FormData();
          return t2 && o2.append("return_url", t2), o2.append("file", e2, i2), o2.append("email_address_column", a2), o2.append("has_header_row", n2), o2.append("api_key", this._api_key), o2.append("remove_duplicate", r2), s({ requestType: "POST", path: "/scoring/sendfile", body: o2, batch: true, apiBaseURL: this._api_base_url });
        }
        _getStatusUtil(e2, i2) {
          if (this._initialized) {
            if (e2) return s({ requestType: "GET", params: { api_key: this._api_key, file_id: e2 }, path: i2, batch: true, apiBaseURL: this._api_base_url });
            _("File id");
          } else l();
        }
        getFileStatus(e2) {
          return this._getStatusUtil(e2, "/filestatus");
        }
        getScoringFileStatus(e2) {
          return this._getStatusUtil(e2, "/scoring/filestatus");
        }
        _getFileUtil(e2, i2, a2 = false, t2 = null) {
          if (!this._initialized) return void l();
          if (!e2) return void _("File id");
          const n2 = { api_key: this._api_key, file_id: e2 };
          return null != t2 && "object" == typeof t2 && (null != t2.downloadType && (n2.download_type = t2.downloadType), a2 || null == t2.activityData || (n2.activity_data = t2.activityData ? "true" : "false")), s({ requestType: "GET", params: n2, path: i2, batch: true, returnText: true, scoring: a2, apiBaseURL: this._api_base_url });
        }
        getFile(e2, i2 = null) {
          return this._getFileUtil(e2, "/getfile", false, i2);
        }
        getScoringFile(e2, i2 = null) {
          return this._getFileUtil(e2, "/scoring/getfile", true, i2);
        }
        _deleteFileUtil(e2, i2, a2 = false) {
          if (this._initialized) {
            if (e2) return s({ requestType: "GET", params: { api_key: this._api_key, file_id: e2 }, path: i2, batch: true, scoring: a2, apiBaseURL: this._api_base_url });
            _("File id");
          } else l();
        }
        deleteFile(e2) {
          return this._deleteFileUtil(e2, "/deletefile");
        }
        deleteScoringFile(e2) {
          return this._deleteFileUtil(e2, "/scoring/deletefile", true);
        }
        findEmailByDomain({ domain: e2, first_name: i2, middle_name: a2 = null, last_name: t2 = null }) {
          return this._findEmail({ domain: e2, first_name: i2, middle_name: a2, last_name: t2 });
        }
        findEmailByCompanyName({ company_name: e2, first_name: i2, middle_name: a2 = null, last_name: t2 = null }) {
          return this._findEmail({ company_name: e2, first_name: i2, middle_name: a2, last_name: t2 });
        }
        _findEmail({ domain: e2 = null, company_name: i2 = null, first_name: a2, middle_name: t2 = null, last_name: n2 = null }) {
          if (!this._initialized) return void l();
          if (!e2 && !i2) return _("domain"), void _("company_name");
          if (!a2) return void _("first_name");
          const r2 = { api_key: this._api_key, first_name: a2, middle_name: t2, last_name: n2 };
          return null != e2 ? r2.domain = e2 : null != i2 && (r2.company_name = i2), s({ requestType: "GET", params: r2, path: "/guessformat", apiBaseURL: this._api_base_url });
        }
        findEmailFormatByDomain({ domain: e2 }) {
          return this._findEmailFormat({ domain: e2 });
        }
        findEmailFormatByCompanyName({ company_name: e2 }) {
          return this._findEmailFormat({ company_name: e2 });
        }
        _findEmailFormat({ domain: e2 = null, company_name: i2 = null }) {
          if (!this._initialized) return void l();
          if (!e2 && !i2) return _("domain"), void _("company_name");
          const a2 = { api_key: this._api_key };
          return null != e2 ? a2.domain = e2 : null != i2 && (a2.company_name = i2), s({ requestType: "GET", params: a2, path: "/guessformat", apiBaseURL: this._api_base_url });
        }
        guessFormat({ domain: e2, first_name: i2 = null, middle_name: a2 = null, last_name: t2 = null }) {
          if (console.warn("guessFormat() is deprecated. Use findEmail for Email Finder API, or findEmailFormat for Domain Search API."), this._initialized) {
            if (e2) return s({ requestType: "GET", params: { api_key: this._api_key, domain: e2, first_name: i2, middle_name: a2, last_name: t2 }, path: "/guessformat", apiBaseURL: this._api_base_url });
            _("domain");
          } else l();
        }
      }
      const m = u;
      return i.default;
    })());
  }
});

// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// src/zerobounce-client.ts
var import_zero_bounce_sdk = __toESM(require_zeroBounceSDK(), 1);
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
  async validateEmail(email, ipAddress) {
    const result = await this.sdk.validateEmail(email, ipAddress ?? null);
    return result;
  }
  /**
   * Validate multiple email addresses in batch
   * Note: ZeroBounce batch API typically requires file upload, but this implementation
   * uses the real-time batch API on the bulk endpoint
   */
  async validateBatch(emails, _emailAddressColumn) {
    const emailBatch = emails.map((email) => ({
      email_address: email
    }));
    const result = await this.sdk.validateBatch(emailBatch);
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
  // ========== List Evaluator Operations ==========
  /**
   * Evaluate the quality of an email list
   * Requires file upload (multipart/form-data) with CSV file containing emails
   */
  async evaluateList(_fileContent, _fileName, _emailAddressColumn) {
    throw new Error(
      "List Evaluator is not available via the official ZeroBounce Node SDK."
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
  const errorMessage = error instanceof Error ? error.message : String(error);
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
        }
      },
      required: ["email"]
    }
  },
  handler: async (client, args) => {
    try {
      const email = requireString(args.email, "email");
      const ipAddress = optionalString(args.ipAddress);
      const result = await client.validateEmail(email, ipAddress);
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
          description: "Optional column index if emails are in CSV format (default: 0)"
        }
      },
      required: ["emails"]
    }
  },
  handler: async (client, args) => {
    try {
      const emails = requireArray(args.emails, "emails");
      const emailAddressColumn = optionalNumber(args.emailAddressColumn);
      const result = await client.validateBatch(emails, emailAddressColumn);
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
      description: "Optional callback URL to be notified when processing is complete"
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
        const fileName = requireString(args.fileName, "fileName");
        const returnUrl = optionalString(args.returnUrl);
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
    definition: {
      name: `${config.name}_delete_file`,
      description: `Delete a bulk ${config.description} file from your account.`,
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

// src/tools/index.ts
function getAllTools() {
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
    // Email Finder
    findEmailTool,
    // Domain Search
    domainSearchTool,
    // Activity Data
    getActivityDataTool
  ];
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
var ZeroBounceMCPServer = class {
  server;
  client;
  config;
  constructor(config) {
    this.config = config;
    this.client = new ZeroBounceClient({
      apiKey: config.apiKey
    });
    this.server = new Server(
      {
        name: "zerobounce-mcp",
        version: "0.1.0"
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
                  baseUrl: "https://api.zerobounce.net/v2",
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
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("ZeroBounce MCP server running on stdio");
  }
};
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    apiKey: ""
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
      config.apiKey = arg.split("=")[1];
    }
  }
  if (!config.apiKey) {
    throw new Error(
      "ZeroBounce API key is required. Provide it via --api-key flag."
    );
  }
  return config;
}
async function main() {
  try {
    const config = parseArgs();
    const server = new ZeroBounceMCPServer(config);
    await server.run();
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

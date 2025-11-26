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
    })(exports, (() => (() => {
      "use strict";
      var e = { d: (i2, t2) => {
        for (var a2 in t2) e.o(t2, a2) && !e.o(i2, a2) && Object.defineProperty(i2, a2, { enumerable: true, get: t2[a2] });
      }, o: (e2, i2) => Object.prototype.hasOwnProperty.call(e2, i2) }, i = {};
      e.d(i, { default: () => s });
      const t = { Accept: "*/*", "Accept-Encoding": "gzip, deflate, br", Connection: "keep-alive" };
      async function a({ requestType: e2, body: i2 = null, params: a2 = null, path: r2, batch: n2 = false, returnText: s2 = false, scoring: l = false }) {
        const o = `${n2 ? "https://bulkapi.zerobounce.net/v2" : "https://api.zerobounce.net/v2"}${r2}?${new URLSearchParams(a2)}`;
        try {
          const a3 = await fetch(o, { method: e2, headers: t, body: i2 });
          if (s2) {
            const e3 = await a3.text();
            return e3.includes('"success":"False"') ? JSON.parse(e3) : (function(e4, i3) {
              if (!window.navigator.msSaveOrOpenBlob) {
                const t2 = document.createElement("a");
                document.body.appendChild(t2);
                const a4 = window.URL.createObjectURL(e4);
                return t2.href = a4, t2.download = i3, t2.click(), setTimeout((() => {
                  window.URL.revokeObjectURL(a4), document.body.removeChild(t2);
                }), 0), i3;
              }
              window.navigator.msSaveOrOpenBlob(e4, i3);
            })(new Blob([e3], { type: "application/json" }), `result${l ? "-scoring" : ""}.csv`);
          }
          if (403 === a3.status) throw new Error("[Error]: api_key is invalid");
          return await a3.json();
        } catch (e3) {
          throw new Error(e3);
        }
      }
      function r() {
        console.error("ZeroBounce: Call init function first with a valid api key.");
      }
      function n(e2, i2 = "") {
        console.error(`ZeroBounce: ${e2} parameter is missing. ${i2}`);
      }
      const s = class {
        constructor() {
          this._initialized = false, this._api_key = null;
        }
        init(e2) {
          e2 ? (this._api_key = e2, this._initialized = true) : n("Api key", "Please provide a valid API key.");
        }
        getCredits() {
          if (this._initialized) return a({ requestType: "GET", params: { api_key: this._api_key }, path: "/getcredits" });
          r();
        }
        validateEmail(e2, i2 = null) {
          if (this._initialized) {
            if (e2) return a({ requestType: "GET", params: { api_key: this._api_key, email: e2, ip_address: i2 }, path: "/validate" });
            n("Email");
          } else r();
        }
        getApiUsage(e2, i2) {
          if (this._initialized) if (e2) {
            if (i2) return a({ requestType: "GET", params: { api_key: this._api_key, start_date: e2, end_date: i2 }, path: "/getapiusage" });
            n("End date", "Format: YYYY-MM-DD");
          } else n("Start date", "Format: YYYY-MM-DD");
          else r();
        }
        validateBatch(e2) {
          if (!this._initialized) return void r();
          if (!e2) return void n("Email list");
          const i2 = { api_key: this._api_key, email_batch: e2 };
          return a({ requestType: "POST", path: "/validatebatch", body: JSON.stringify(i2), batch: true });
        }
        getEmailActivity(e2) {
          if (this._initialized) {
            if (e2) return a({ requestType: "GET", params: { api_key: this._api_key, email: e2 }, path: "/activity" });
            n("Email");
          } else r();
        }
        sendFile({ file: e2, email_address_column: i2, first_name_column: t2 = false, return_url: s2 = false, last_name_column: l = false, gender_column: o = false, ip_address_column: d = false, has_header_row: p = false, remove_duplicate: u = false }) {
          if (!this._initialized) return void r();
          if (!e2) return void n("file");
          if (!i2) return void n("email_address_column");
          const _ = new FormData();
          return s2 && _.append("return_url", s2), t2 && _.append("first_name_column", t2), l && _.append("last_name_column", l), o && _.append("gender_column", o), d && _.append("ip_address_column", d), _.append("email_address_column", i2), _.append("file", e2), _.append("has_header_row", p), _.append("remove_duplicate", u), _.append("api_key", this._api_key), a({ requestType: "POST", path: "/sendfile", body: _, batch: true });
        }
        sendScoringFile({ file: e2, email_address_column: i2, return_url: t2 = false, has_header_row: s2 = false, remove_duplicate: l = false }) {
          if (!this._initialized) return void r();
          if (!e2) return void n("file: File");
          if (!i2) return void n("email_address_column: number");
          const o = new FormData();
          return t2 && o.append("return_url", t2), o.append("file", e2), o.append("email_address_column", i2), o.append("has_header_row", s2), o.append("api_key", this._api_key), o.append("remove_duplicate", l), a({ requestType: "POST", path: "/scoring/sendfile", body: o, batch: true });
        }
        _getStatusUtil(e2, i2) {
          if (this._initialized) {
            if (e2) return a({ requestType: "GET", params: { api_key: this._api_key, file_id: e2 }, path: i2, batch: true });
            n("File id");
          } else r();
        }
        getFileStatus(e2) {
          return this._getStatusUtil(e2, "/filestatus");
        }
        getScoringFileStatus(e2) {
          return this._getStatusUtil(e2, "/scoring/filestatus");
        }
        _getFileUtil(e2, i2, t2 = false) {
          if (this._initialized) {
            if (e2) return a({ requestType: "GET", params: { api_key: this._api_key, file_id: e2 }, path: i2, batch: true, returnText: true, scoring: t2 });
            n("File id");
          } else r();
        }
        getFile(e2) {
          return this._getFileUtil(e2, "/getfile");
        }
        getScoringFile(e2) {
          return this._getFileUtil(e2, "/scoring/getfile", true);
        }
        _deleteFileUtil(e2, i2, t2 = false) {
          if (this._initialized) {
            if (e2) return a({ requestType: "GET", params: { api_key: this._api_key, file_id: e2 }, path: i2, batch: true, scoring: t2 });
            n("File id");
          } else r();
        }
        deleteFile(e2) {
          return this._deleteFileUtil(e2, "/deletefile");
        }
        deleteScoringFile(e2) {
          return this._deleteFileUtil(e2, "/scoring/deletefile", true);
        }
        guessFormat({ domain: e2, first_name: i2 = null, middle_name: t2 = null, last_name: s2 = null }) {
          if (this._initialized) {
            if (e2) return a({ requestType: "GET", params: { api_key: this._api_key, domain: e2, first_name: i2, middle_name: t2, last_name: s2 }, path: "/guessformat" });
            n("domain");
          } else r();
        }
      };
      return i.default;
    })()));
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
    this.sdk.init(this.apiKey);
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
    const file = fileContent instanceof Blob ? new File([fileContent], fileName, { type: "text/csv" }) : new File([fileContent], fileName, { type: "text/csv" });
    const result = await this.sdk.sendFile({
      file,
      // ZeroBounce docs are 1-based; default to 1 for first column when not provided
      email_address_column: emailAddressColumn !== void 0 ? emailAddressColumn : 1,
      return_url: returnUrl || false
    });
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
    return result;
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
    const file = fileContent instanceof Blob ? new File([fileContent], fileName, { type: "text/csv" }) : new File([fileContent], fileName, { type: "text/csv" });
    const result = await this.sdk.sendScoringFile({
      file,
      email_address_column: emailAddressColumn !== void 0 ? emailAddressColumn : 1,
      return_url: returnUrl || false
    });
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
    return result;
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
    if (!request.domain) {
      throw new Error('The published ZeroBounce SDK requires "domain" for email finder.');
    }
    const result = await this.sdk.guessFormat({
      domain: request.domain,
      first_name: request.first_name ?? null,
      middle_name: request.middle_name ?? null,
      last_name: request.last_name ?? null
    });
    return result;
  }
  // ========== Domain Search Operations ==========
  /**
   * Search for emails in a domain
   */
  async domainSearch(request) {
    const result = await this.sdk.guessFormat({
      domain: request.domain,
      first_name: request.first_name ?? null,
      middle_name: null,
      last_name: request.last_name ?? null
    });
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
  async evaluateList(fileContent, fileName, emailAddressColumn) {
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
    description: "Find an email address based on domain, name, and/or company.",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Domain to search for email addresses"
        },
        firstName: {
          type: "string",
          description: "First name of the person"
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
      required: []
    }
  },
  handler: async (client, args) => {
    try {
      const domain = optionalString(args.domain);
      const firstName = optionalString(args.firstName);
      const middleName = optionalString(args.middleName);
      const lastName = optionalString(args.lastName);
      const company = optionalString(args.company);
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
    description: "Search for email addresses in a domain.",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Domain to search"
        },
        firstName: {
          type: "string",
          description: "Optional first name"
        },
        lastName: {
          type: "string",
          description: "Optional last name"
        },
        company: {
          type: "string",
          description: "Optional company name"
        }
      },
      required: ["domain"]
    }
  },
  handler: async (client, args) => {
    try {
      const domain = requireString(args.domain, "domain");
      const firstName = optionalString(args.firstName);
      const lastName = optionalString(args.lastName);
      const company = optionalString(args.company);
      const result = await client.domainSearch({
        domain,
        first_name: firstName,
        last_name: lastName,
        company
      });
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

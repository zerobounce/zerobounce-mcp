/**
 * Helper functions for bulk file operations
 * Applies DRY principle for common bulk file operations
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  optionalString,
  optionalNumber,
  optionalBoolean,
} from './types.js';
import {
  assertBulkFileContentWithinLimit,
  validateBulkReturnUrl,
} from '../security/bulk-input.js';

/** Optional send-file settings, each sent only when the caller sets it. */
export interface BulkSendFileOptions {
  hasHeaderRow?: boolean;
  removeDuplicate?: boolean;
  genderColumn?: number;
  ipAddressColumn?: number;
  allowPhase2?: boolean;
}

export interface BulkFileToolConfig {
  name: string;
  description: string;
  sendFileMethod: (
    client: ZeroBounceClient,
    fileContent: string,
    fileName: string,
    returnUrl?: string,
    emailAddressColumn?: number,
    domainColumn?: number,
    companyNameColumn?: number,
    fullNameColumn?: number,
    firstNameColumn?: number,
    middleNameColumn?: number,
    lastNameColumn?: number,
    options?: BulkSendFileOptions
  ) => Promise<unknown>;
  getStatusMethod: (client: ZeroBounceClient, fileId: string) => Promise<unknown>;
  getFileMethod: (client: ZeroBounceClient, fileId: string) => Promise<unknown>;
  deleteFileMethod: (client: ZeroBounceClient, fileId: string) => Promise<unknown>;
  /** SDK methods the four tools need; see ToolHandler.sdkMethods. */
  sdkMethods?: string[];
  supportsEmailAddressColumn?: boolean;
  supportsDomainColumn?: boolean;
  supportsCompanyNameColumn?: boolean;
  supportsFullNameColumn?: boolean;
  supportsFirstNameColumn?: boolean;
  supportsMiddleNameColumn?: boolean;
  supportsLastNameColumn?: boolean;
  supportsGenderColumn?: boolean;
  supportsIpAddressColumn?: boolean;
  /** `return_url`; the email finder and domain search sendfile endpoints take none. */
  supportsReturnUrl?: boolean;
  supportsRemoveDuplicate?: boolean;
  supportsAllowPhase2?: boolean;
}

export function createBulkFileTools(config: BulkFileToolConfig): {
  sendFile: ToolHandler;
  fileStatus: ToolHandler;
  getFile: ToolHandler;
  deleteFile: ToolHandler;
} {
  const sendFileProperties: Record<string, object> = {
    fileContent: {
      type: 'string',
      description: 'CSV file content as a string',
    },
    fileName: {
      type: 'string',
      description: 'Name of the file',
    },
    hasHeaderRow: {
      type: 'boolean',
      description: 'Whether the first row of the file is a header row. Sent as false when not given.',
    },
  };

  if (config.supportsReturnUrl !== false) {
    sendFileProperties.returnUrl = {
      type: 'string',
      description:
        'Optional HTTPS callback URL when processing completes. Only use trusted URLs you control; an attacker-controlled URL can receive bulk results.',
    };
  }
  if (config.supportsRemoveDuplicate) {
    sendFileProperties.removeDuplicate = {
      type: 'boolean',
      description:
        'Whether to remove duplicate emails (sent as remove_duplicate). Left out, it is sent as false.',
    };
  }
  if (config.supportsAllowPhase2) {
    sendFileProperties.allowPhase2 = {
      type: 'boolean',
      description: 'Whether to allow phase 2 processing (sent as allow_phase_2). Sent only when given.',
    };
  }

  if (config.supportsEmailAddressColumn) {
    sendFileProperties.emailAddressColumn = {
      type: 'number',
      description: 'Column index (0-based) containing email addresses. Defaults to 0 (first column).',
    };
  }
  if (config.supportsDomainColumn) {
    sendFileProperties.domainColumn = {
      type: 'number',
      description: 'Column index (0-based) containing domain names. Defaults to 0 (first column).',
    };
  }
  if (config.supportsCompanyNameColumn) {
    sendFileProperties.companyNameColumn = {
      type: 'number',
      description: 'Column index (0-based) containing company names. Defaults to 0 (first column).',
    };
  }
  if (config.supportsFullNameColumn) {
    sendFileProperties.fullNameColumn = {
      type: 'number',
      description:
        'Column index (0-based) containing full name values.' +
        (config.supportsFirstNameColumn ? ' Give this or firstNameColumn.' : ''),
    };
  }
  if (config.supportsFirstNameColumn) {
    sendFileProperties.firstNameColumn = {
      type: 'number',
      description:
        'Column index (0-based) containing first names.' +
        (config.supportsFullNameColumn ? ' Give this or fullNameColumn.' : ''),
    };
  }
  if (config.supportsMiddleNameColumn) {
    sendFileProperties.middleNameColumn = {
      type: 'number',
      description: 'Column index (0-based) containing middle names.',
    };
  }
  if (config.supportsLastNameColumn) {
    sendFileProperties.lastNameColumn = {
      type: 'number',
      description: 'Column index (0-based) containing last names.',
    };
  }
  if (config.supportsGenderColumn) {
    sendFileProperties.genderColumn = {
      type: 'number',
      description: 'Column index (0-based) containing gender values.',
    };
  }
  if (config.supportsIpAddressColumn) {
    sendFileProperties.ipAddressColumn = {
      type: 'number',
      description: 'Column index (0-based) containing IP addresses.',
    };
  }

  const sendFileTool: ToolHandler = {
    sdkMethods: config.sdkMethods,
    definition: {
      name: `${config.name}_send_file`,
      description: `Send a CSV file for bulk ${config.description}. Returns a file ID for tracking.`,
      inputSchema: {
        type: 'object',
        properties: sendFileProperties,
        required: ['fileContent', 'fileName'],
      },
    },
    handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
      try {
        const fileContent = requireString(args.fileContent, 'fileContent');
        assertBulkFileContentWithinLimit(fileContent);
        const fileName = requireString(args.fileName, 'fileName');
        const returnUrl =
          config.supportsReturnUrl !== false ? optionalString(args.returnUrl, 'returnUrl') : undefined;
        if (returnUrl) {
          validateBulkReturnUrl(returnUrl);
        }
        const emailAddressColumn = config.supportsEmailAddressColumn ? optionalNumber(args.emailAddressColumn, 'emailAddressColumn') : undefined;
        const domainColumn = config.supportsDomainColumn ? optionalNumber(args.domainColumn, 'domainColumn') : undefined;
        const companyNameColumn = config.supportsCompanyNameColumn ? optionalNumber(args.companyNameColumn, 'companyNameColumn') : undefined;
        const fullNameColumn = config.supportsFullNameColumn ? optionalNumber(args.fullNameColumn, 'fullNameColumn') : undefined;
        const firstNameColumn = config.supportsFirstNameColumn ? optionalNumber(args.firstNameColumn, 'firstNameColumn') : undefined;
        const middleNameColumn = config.supportsMiddleNameColumn ? optionalNumber(args.middleNameColumn, 'middleNameColumn') : undefined;
        const lastNameColumn = config.supportsLastNameColumn ? optionalNumber(args.lastNameColumn, 'lastNameColumn') : undefined;
        const options: BulkSendFileOptions = {
          hasHeaderRow: optionalBoolean(args.hasHeaderRow, 'hasHeaderRow'),
          removeDuplicate: config.supportsRemoveDuplicate ? optionalBoolean(args.removeDuplicate, 'removeDuplicate') : undefined,
          genderColumn: config.supportsGenderColumn ? optionalNumber(args.genderColumn, 'genderColumn') : undefined,
          ipAddressColumn: config.supportsIpAddressColumn ? optionalNumber(args.ipAddressColumn, 'ipAddressColumn') : undefined,
          allowPhase2: config.supportsAllowPhase2 ? optionalBoolean(args.allowPhase2, 'allowPhase2') : undefined,
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
    },
  };

  const fileStatusTool: ToolHandler = {
    sdkMethods: config.sdkMethods,
    definition: {
      name: `${config.name}_file_status`,
      description: `Get the status of a bulk ${config.description} file upload.`,
      inputSchema: {
        type: 'object',
        properties: {
          fileId: {
            type: 'string',
            description: `File ID returned from ${config.name}_send_file`,
          },
        },
        required: ['fileId'],
      },
    },
    handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
      try {
        const fileId = requireString(args.fileId, 'fileId');

        const result = await config.getStatusMethod(client, fileId);
        return createSuccessResponse(result);
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  };

  const getFileTool: ToolHandler = {
    sdkMethods: config.sdkMethods,
    definition: {
      name: `${config.name}_get_file`,
      description: `Get the results of a completed bulk ${config.description} file.`,
      inputSchema: {
        type: 'object',
        properties: {
          fileId: {
            type: 'string',
            description: `File ID returned from ${config.name}_send_file`,
          },
        },
        required: ['fileId'],
      },
    },
    handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
      try {
        const fileId = requireString(args.fileId, 'fileId');

        const result = await config.getFileMethod(client, fileId);
        return createSuccessResponse(result);
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  };

  const deleteFileTool: ToolHandler = {
    sdkMethods: config.sdkMethods,
    definition: {
      name: `${config.name}_delete_file`,
      description: `Delete a bulk ${config.description} file from your account.`,
      annotations: { destructiveHint: true, readOnlyHint: false },
      inputSchema: {
        type: 'object',
        properties: {
          fileId: {
            type: 'string',
            description: 'File ID to delete',
          },
        },
        required: ['fileId'],
      },
    },
    handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
      try {
        const fileId = requireString(args.fileId, 'fileId');

        const result = await config.deleteFileMethod(client, fileId);
        return createSuccessResponse(result);
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  };

  return {
    sendFile: sendFileTool,
    fileStatus: fileStatusTool,
    getFile: getFileTool,
    deleteFile: deleteFileTool,
  };
}

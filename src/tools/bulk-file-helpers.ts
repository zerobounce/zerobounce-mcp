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
  optionalColumn,
  optionalBoolean,
} from './types.js';
import { describeTool, type ToolName } from './catalog.js';
import type { BulkGetFileOptions } from '../zerobounce-client.js';
import {
  assertBulkFileContentWithinLimit,
  validateBulkReturnUrl,
  assertSafeFileName,
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
  /** The four tools' names, as the hosted server names them. */
  names: { sendFile: ToolName; fileStatus: ToolName; getFile: ToolName; deleteFile: ToolName };
  /** The optional getfile query values this download takes. */
  getFileOptions?: { downloadType?: boolean; activityData?: boolean };
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
  getFileMethod: (
    client: ZeroBounceClient,
    fileId: string,
    options?: BulkGetFileOptions
  ) => Promise<unknown>;
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

/** The bulk getfile `download_type` values. */
const DOWNLOAD_TYPES = ['phase_1', 'phase_2', 'combined'];

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

  const getFileProperties: Record<string, object> = {
    fileId: {
      type: 'string',
      description: `File ID returned from ${config.names.sendFile}`,
    },
  };
  if (config.getFileOptions?.downloadType) {
    getFileProperties.downloadType = {
      type: 'string',
      enum: DOWNLOAD_TYPES,
      description: 'Which results to download: phase_1, phase_2 or combined (sent as download_type).',
    };
  }
  if (config.getFileOptions?.activityData) {
    getFileProperties.activityData = {
      type: 'boolean',
      description: 'Include activity data columns (sent as activity_data).',
    };
  }

  const sendFileTool: ToolHandler = {
    sdkMethods: config.sdkMethods,
    definition: {
      ...describeTool(config.names.sendFile),
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
        assertSafeFileName(fileName);
        let returnUrl =
          config.supportsReturnUrl !== false ? optionalString(args.returnUrl, 'returnUrl') : undefined;
        if (returnUrl) {
          returnUrl = validateBulkReturnUrl(returnUrl);
        }
        const emailAddressColumn = config.supportsEmailAddressColumn ? optionalColumn(args.emailAddressColumn, 'emailAddressColumn') : undefined;
        const domainColumn = config.supportsDomainColumn ? optionalColumn(args.domainColumn, 'domainColumn') : undefined;
        const companyNameColumn = config.supportsCompanyNameColumn ? optionalColumn(args.companyNameColumn, 'companyNameColumn') : undefined;
        const fullNameColumn = config.supportsFullNameColumn ? optionalColumn(args.fullNameColumn, 'fullNameColumn') : undefined;
        const firstNameColumn = config.supportsFirstNameColumn ? optionalColumn(args.firstNameColumn, 'firstNameColumn') : undefined;
        const middleNameColumn = config.supportsMiddleNameColumn ? optionalColumn(args.middleNameColumn, 'middleNameColumn') : undefined;
        const lastNameColumn = config.supportsLastNameColumn ? optionalColumn(args.lastNameColumn, 'lastNameColumn') : undefined;
        const options: BulkSendFileOptions = {
          hasHeaderRow: optionalBoolean(args.hasHeaderRow, 'hasHeaderRow'),
          removeDuplicate: config.supportsRemoveDuplicate ? optionalBoolean(args.removeDuplicate, 'removeDuplicate') : undefined,
          genderColumn: config.supportsGenderColumn ? optionalColumn(args.genderColumn, 'genderColumn') : undefined,
          ipAddressColumn: config.supportsIpAddressColumn ? optionalColumn(args.ipAddressColumn, 'ipAddressColumn') : undefined,
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
      ...describeTool(config.names.fileStatus),
      inputSchema: {
        type: 'object',
        properties: {
          fileId: {
            type: 'string',
            description: `File ID returned from ${config.names.sendFile}`,
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
      ...describeTool(config.names.getFile),
      inputSchema: {
        type: 'object',
        properties: getFileProperties,
        required: ['fileId'],
      },
    },
    handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
      try {
        const fileId = requireString(args.fileId, 'fileId');
        const options: BulkGetFileOptions = {};
        if (config.getFileOptions?.downloadType) {
          const downloadType = optionalString(args.downloadType, 'downloadType');
          if (downloadType !== undefined && !DOWNLOAD_TYPES.includes(downloadType)) {
            throw new Error(`downloadType must be one of ${DOWNLOAD_TYPES.join(', ')}`);
          }
          options.downloadType = downloadType;
        }
        if (config.getFileOptions?.activityData) {
          options.activityData = optionalBoolean(args.activityData, 'activityData');
        }

        const result = await config.getFileMethod(client, fileId, options);
        return createSuccessResponse(result);
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  };

  const deleteFileTool: ToolHandler = {
    sdkMethods: config.sdkMethods,
    definition: {
      ...describeTool(config.names.deleteFile),
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

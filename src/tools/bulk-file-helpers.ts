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
} from './types.js';

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
    lastNameColumn?: number
  ) => Promise<unknown>;
  getStatusMethod: (client: ZeroBounceClient, fileId: string) => Promise<unknown>;
  getFileMethod: (client: ZeroBounceClient, fileId: string) => Promise<unknown>;
  deleteFileMethod: (client: ZeroBounceClient, fileId: string) => Promise<unknown>;
  supportsEmailAddressColumn?: boolean;
  supportsDomainColumn?: boolean;
  supportsCompanyNameColumn?: boolean;
  supportsFullNameColumn?: boolean;
  supportsFirstNameColumn?: boolean;
  supportsMiddleNameColumn?: boolean;
  supportsLastNameColumn?: boolean;
}

export function createBulkFileTools(config: BulkFileToolConfig): {
  sendFile: ToolHandler;
  fileStatus: ToolHandler;
  getFile: ToolHandler;
  deleteFile: ToolHandler;
} {
  const sendFileProperties: Record<string, unknown> = {
    fileContent: {
      type: 'string',
      description: 'CSV file content as a string',
    },
    fileName: {
      type: 'string',
      description: 'Name of the file',
    },
    returnUrl: {
      type: 'string',
      description: 'Optional callback URL to be notified when processing is complete',
    },
  };

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
      description: 'Column index (0-based) containing full name values.',
    };
  }
  if (config.supportsFirstNameColumn) {
    sendFileProperties.firstNameColumn = {
      type: 'number',
      description: 'Column index (0-based) containing first names.',
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

  const sendFileTool: ToolHandler = {
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
        const fileName = requireString(args.fileName, 'fileName');
        const returnUrl = optionalString(args.returnUrl);
        const emailAddressColumn = config.supportsEmailAddressColumn ? optionalNumber(args.emailAddressColumn) : undefined;
        const domainColumn = config.supportsDomainColumn ? optionalNumber(args.domainColumn) : undefined;
        const companyNameColumn = config.supportsCompanyNameColumn ? optionalNumber(args.companyNameColumn) : undefined;
        const fullNameColumn = config.supportsFullNameColumn ? optionalNumber(args.fullNameColumn) : undefined;
        const firstNameColumn = config.supportsFirstNameColumn ? optionalNumber(args.firstNameColumn) : undefined;
        const middleNameColumn = config.supportsMiddleNameColumn ? optionalNumber(args.middleNameColumn) : undefined;
        const lastNameColumn = config.supportsLastNameColumn ? optionalNumber(args.lastNameColumn) : undefined;

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
    },
  };

  const fileStatusTool: ToolHandler = {
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
    definition: {
      name: `${config.name}_delete_file`,
      description: `Delete a bulk ${config.description} file from your account.`,
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

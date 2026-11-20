import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  optionalColumn,
} from './types.js';
import { assertBulkFileContentWithinLimit, assertSafeFileName } from '../security/bulk-input.js';
import { describeTool } from './catalog.js';

export const listEvaluatorSendFileTool: ToolHandler = {
  sdkMethods: ['sendListEvaluatorFileStream'],
  definition: {
    ...describeTool('send_list_evaluator_file'),
    inputSchema: {
      type: 'object',
      properties: {
        fileContent: { type: 'string', description: 'CSV file content' },
        fileName: { type: 'string', description: 'File name' },
        emailAddressColumn: {
          type: 'number',
          description: '0-based column index for email addresses',
        },
      },
      required: ['fileContent', 'fileName'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const fileContent = requireString(args.fileContent, 'fileContent');
      assertBulkFileContentWithinLimit(fileContent);
      const fileName = requireString(args.fileName, 'fileName');
      assertSafeFileName(fileName);
      const emailAddressColumn = optionalColumn(args.emailAddressColumn, 'emailAddressColumn') ?? 0;
      const result = await client.sendListEvaluatorFile(fileContent, fileName, emailAddressColumn);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const listEvaluatorResultTool: ToolHandler = {
  sdkMethods: ['getListEvaluatorResult'],
  definition: {
    ...describeTool('get_list_evaluator_result'),
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'File ID from send_file' },
      },
      required: ['fileId'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const fileId = requireString(args.fileId, 'fileId');
      const result = await client.getListEvaluatorResult(fileId);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

/**
 * Op 15. The public docs describe a file upload; the live API wants the List
 * Evaluator's `file_id` in a form field and answers an upload with
 * "file_id: This field is required".
 */
export const sendEvaluatedFileTool: ToolHandler = {
  sdkMethods: ['sendEvaluatedFile'],
  definition: {
    ...describeTool('send_evaluated_file'),
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'file_id returned by list_evaluator_send_file',
        },
      },
      required: ['fileId'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.sendEvaluatedFile(requireString(args.fileId, 'fileId'));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

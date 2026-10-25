import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  optionalNumber,
} from './types.js';
import { assertBulkFileContentWithinLimit } from '../security/bulk-input.js';

export const listEvaluatorSendFileTool: ToolHandler = {
  sdkMethods: ['sendListEvaluatorFileStream'],
  definition: {
    name: 'list_evaluator_send_file',
    description: 'Upload a CSV for list evaluator (bulkapi listevaluator)',
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
      const emailAddressColumn = optionalNumber(args.emailAddressColumn) ?? 0;
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
    name: 'list_evaluator_result',
    description: 'Get list evaluator job status/result by file_id',
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

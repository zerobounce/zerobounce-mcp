import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  optionalString,
} from './types.js';

export const listS3FilesTool: ToolHandler = {
  definition: {
    name: 'list_s3_files',
    description: 'List S3 bucket files available for validation or scoring (GET /listS3files)',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Input bucket (optional if configured in UI)' },
        search: { type: 'string', description: 'Filter results by file name' },
      },
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.listS3Files({
        bucket: optionalString(args.bucket),
        search: optionalString(args.search),
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const validateS3FileTool: ToolHandler = {
  definition: {
    name: 'validate_s3_file',
    description: 'Submit an S3 object for bulk validation (validateS3file)',
    inputSchema: {
      type: 'object',
      properties: {
        fileName: { type: 'string', description: 'S3 object key/path' },
      },
      required: ['fileName'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.validateS3File({
        file_name: requireString(args, 'fileName'),
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const scoreS3FileTool: ToolHandler = {
  definition: {
    name: 'score_s3_file',
    description: 'Submit an S3 object for bulk AI scoring (scoreS3file)',
    inputSchema: {
      type: 'object',
      properties: {
        fileName: { type: 'string' },
      },
      required: ['fileName'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.scoreS3File({
        file_name: requireString(args, 'fileName'),
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const exportS3FileTool: ToolHandler = {
  definition: {
    name: 'export_s3_file',
    description: 'Export a completed bulk job to an S3 bucket (exportS3file)',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string' },
        exportBucket: { type: 'string' },
      },
      required: ['fileId', 'exportBucket'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.exportS3File(
        requireString(args, 'fileId'),
        requireString(args, 'exportBucket')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

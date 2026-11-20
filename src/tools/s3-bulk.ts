import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  optionalString,
} from './types.js';
import { createBulkRootJobTool } from './bulk-root-job-helpers.js';
import { describeTool } from './catalog.js';

export const listS3FilesTool: ToolHandler = {
  sdkMethods: ['listS3files'],
  definition: {
    ...describeTool('list_s3files'),
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
        bucket: optionalString(args.bucket, 'bucket'),
        search: optionalString(args.search, 'search'),
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const validateS3FileTool = createBulkRootJobTool({
  name: 'validate_s3file',
  source: 'S3',
  sdkMethods: ['validateS3file'],
  jobMethod: (client, request) => client.validateS3File(request),
});

export const scoreS3FileTool = createBulkRootJobTool({
  name: 'score_s3file',
  source: 'S3',
  sdkMethods: ['scoreS3file', '_bulkRootFileJob'],
  jobMethod: (client, request) => client.scoreS3File(request),
});

export const emailFinderS3FileTool = createBulkRootJobTool({
  name: 'email_finder_s3file',
  source: 'S3',
  sdkMethods: ['emailFinderS3file'],
  jobMethod: (client, request) => client.emailFinderS3File(request),
});

export const domainSearchS3FileTool = createBulkRootJobTool({
  name: 'domain_search_s3file',
  source: 'S3',
  sdkMethods: ['domainSearchS3file'],
  jobMethod: (client, request) => client.domainSearchS3File(request),
});

export const exportS3FileTool: ToolHandler = {
  sdkMethods: ['exportS3file', '_sendBulkRootFormPost'],
  definition: {
    ...describeTool('export_s3file'),
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'File ID of the completed bulk job' },
        exportBucket: {
          type: 'string',
          description:
            'Destination bucket. Optional: without it the output bucket configured on your ' +
            'ZeroBounce account is used.',
        },
      },
      required: ['fileId'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.exportS3File(
        requireString(args.fileId, 'fileId'),
        optionalString(args.exportBucket, 'exportBucket')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

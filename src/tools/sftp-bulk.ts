/**
 * SFTP/FTP bulk file jobs (ops 36-40). The server, path and protocol come from
 * the account's ZeroBounce settings; only the file name travels with the request.
 */

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

export const validateSftpFileTool = createBulkRootJobTool({
  name: 'validate_sftpfile',
  source: 'SFTP/FTP',
  sdkMethods: ['validateSFTPfile'],
  jobMethod: (client, request) => client.validateSftpFile(request),
});

export const scoreSftpFileTool = createBulkRootJobTool({
  name: 'score_sftpfile',
  source: 'SFTP/FTP',
  sdkMethods: ['scoreSFTPfile'],
  jobMethod: (client, request) => client.scoreSftpFile(request),
});

export const emailFinderSftpFileTool = createBulkRootJobTool({
  name: 'email_finder_sftpfile',
  source: 'SFTP/FTP',
  sdkMethods: ['emailFinderSFTPfile'],
  jobMethod: (client, request) => client.emailFinderSftpFile(request),
});

export const domainSearchSftpFileTool = createBulkRootJobTool({
  name: 'domain_search_sftpfile',
  source: 'SFTP/FTP',
  sdkMethods: ['domainSearchSFTPfile'],
  jobMethod: (client, request) => client.domainSearchSftpFile(request),
});

export const exportSftpFileTool: ToolHandler = {
  sdkMethods: ['exportSFTPfile'],
  definition: {
    ...describeTool('export_sftpfile'),
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'File ID of the completed bulk job' },
        exportPath: {
          type: 'string',
          description:
            'Destination path on the server. Optional: without it the export path configured ' +
            'on your ZeroBounce account is used.',
        },
      },
      required: ['fileId'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.exportSftpFile(
        requireString(args.fileId, 'fileId'),
        optionalString(args.exportPath, 'exportPath')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

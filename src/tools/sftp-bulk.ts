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

export const validateSftpFileTool = createBulkRootJobTool({
  name: 'validate_sftp_file',
  endpoint: 'validateSFTPfile',
  description: 'bulk validation',
  source: 'SFTP/FTP',
  sdkMethods: ['validateSFTPfile'],
  jobMethod: (client, request) => client.validateSftpFile(request),
});

export const scoreSftpFileTool = createBulkRootJobTool({
  name: 'score_sftp_file',
  endpoint: 'scoreSFTPfile',
  description: 'bulk AI scoring',
  source: 'SFTP/FTP',
  sdkMethods: ['scoreSFTPfile'],
  jobMethod: (client, request) => client.scoreSftpFile(request),
});

export const emailFinderSftpFileTool = createBulkRootJobTool({
  name: 'email_finder_sftp_file',
  endpoint: 'emailFinderSFTPfile',
  description: 'bulk email finder',
  source: 'SFTP/FTP',
  sdkMethods: ['emailFinderSFTPfile'],
  jobMethod: (client, request) => client.emailFinderSftpFile(request),
});

export const domainSearchSftpFileTool = createBulkRootJobTool({
  name: 'domain_search_sftp_file',
  endpoint: 'domainSearchSFTPfile',
  description: 'bulk domain search',
  source: 'SFTP/FTP',
  sdkMethods: ['domainSearchSFTPfile'],
  jobMethod: (client, request) => client.domainSearchSftpFile(request),
});

export const exportSftpFileTool: ToolHandler = {
  sdkMethods: ['exportSFTPfile'],
  definition: {
    name: 'export_sftp_file',
    description: 'Export a completed bulk job back to your SFTP/FTP server (POST /exportSFTPfile)',
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
        optionalString(args.exportPath)
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

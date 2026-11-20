/**
 * Shared shape for the eight S3 / SFTP bulk file jobs on the bulkapi root.
 *
 * All eight take the same four documented fields -- file_name, has_header_row,
 * remove_duplicates and return_url -- and differ only in the endpoint they post to.
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import type { BulkRootFileJobRequest, BulkRootJobResponse } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  optionalBoolean,
} from './types.js';
import { assertSafeFileName, validateBulkReturnUrl } from '../security/bulk-input.js';
import { describeTool, type ToolName } from './catalog.js';

export interface BulkRootJobToolConfig {
  /** MCP tool name, e.g. `validate_s3file`. */
  name: ToolName;
  /** Where the file comes from, for argument descriptions. */
  source: 'S3' | 'SFTP/FTP';
  sdkMethods: string[];
  jobMethod: (
    client: ZeroBounceClient,
    request: BulkRootFileJobRequest
  ) => Promise<BulkRootJobResponse>;
}

export function createBulkRootJobTool(config: BulkRootJobToolConfig): ToolHandler {
  const location =
    config.source === 'S3'
      ? 'Path/key of the object in your configured S3 bucket'
      : 'Path of the file on your configured SFTP/FTP server';

  return {
    sdkMethods: config.sdkMethods,
    definition: {
      ...describeTool(config.name),
      inputSchema: {
        type: 'object',
        properties: {
          fileName: { type: 'string', description: location },
          returnUrl: {
            type: 'string',
            description:
              'HTTPS callback URL notified when the job completes. Required: the API refuses ' +
              'a job without one. Only use trusted URLs you control; an attacker-controlled ' +
              'URL can receive bulk results.',
          },
          hasHeaderRow: {
            type: 'boolean',
            description: 'Whether the first row is a header row. Defaults to false.',
          },
          removeDuplicates: {
            type: 'boolean',
            description: 'Whether to drop duplicate rows before processing.',
          },
        },
        required: ['fileName', 'returnUrl'],
      },
    },
    handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
      try {
        const fileName = requireString(args.fileName, 'fileName');
        assertSafeFileName(fileName);
        const returnUrl = validateBulkReturnUrl(requireString(args.returnUrl, 'returnUrl'));
        const result = await config.jobMethod(client, {
          fileName,
          returnUrl,
          hasHeaderRow: optionalBoolean(args.hasHeaderRow, 'hasHeaderRow') ?? false,
          removeDuplicates: optionalBoolean(args.removeDuplicates, 'removeDuplicates'),
        });
        return createSuccessResponse(result);
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  };
}

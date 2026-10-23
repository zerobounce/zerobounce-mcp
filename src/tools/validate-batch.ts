/**
 * Tool: validate_batch
 * Validate multiple email addresses in batch
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireArray,
  optionalNumber,
  optionalBoolean,
} from './types.js';

export const validateBatchTool: ToolHandler = {
  definition: {
    name: 'validate_batch',
    description:
      'Validate multiple email addresses in batch. More efficient for validating multiple emails at once.',
    inputSchema: {
      type: 'object',
      properties: {
        emails: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Array of email addresses to validate',
        },
        emailAddressColumn: {
          type: 'number',
          description:
            'Optional 0-based column index when each entry is a CSV row; the email is read from that column. Omit when entries are plain email addresses.',
        },
        timeout: {
          type: 'number',
          description: 'Batch validation timeout in seconds (10–120)',
        },
        activityData: {
          type: 'boolean',
          description: 'Include activity data on each validation result',
        },
        verifyPlus: {
          type: 'boolean',
          description: 'Use Verify+ validation for this batch',
        },
      },
      required: ['emails'],
    },
  },
  handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
    try {
      const emails = requireArray<string>(args.emails, 'emails');
      const emailAddressColumn = optionalNumber(args.emailAddressColumn);
      const timeout = optionalNumber(args.timeout);
      const activityData = optionalBoolean(args.activityData);
      const verifyPlus = optionalBoolean(args.verifyPlus);

      const result = await client.validateBatch(emails, {
        emailAddressColumn,
        timeout,
        activityData,
        verifyPlus,
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

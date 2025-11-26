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
          description: 'Optional column index if emails are in CSV format (default: 0)',
        },
      },
      required: ['emails'],
    },
  },
  handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
    try {
      const emails = requireArray<string>(args.emails, 'emails');
      const emailAddressColumn = optionalNumber(args.emailAddressColumn);

      const result = await client.validateBatch(emails, emailAddressColumn);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

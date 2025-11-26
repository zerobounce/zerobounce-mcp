/**
 * Tool: get_api_usage
 * Get API usage statistics for a date range
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import { ToolHandler, createSuccessResponse, createErrorResponse, requireString } from './types.js';

export const getApiUsageTool: ToolHandler = {
  definition: {
    name: 'get_api_usage',
    description:
      'Get API usage statistics for a date range. Shows validation counts by status and sub-status.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
      },
      required: ['startDate', 'endDate'],
    },
  },
  handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
    try {
      const startDate = requireString(args.startDate, 'startDate');
      const endDate = requireString(args.endDate, 'endDate');

      const result = await client.getApiUsage(startDate, endDate);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

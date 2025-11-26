/**
 * Tool: get_activity_data
 * Get activity data for an email address
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import { ToolHandler, createSuccessResponse, createErrorResponse, requireString } from './types.js';

export const getActivityDataTool: ToolHandler = {
  definition: {
    name: 'get_activity_data',
    description: 'Get activity data for an email address to see if it has been active recently.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address to get activity data for',
        },
      },
      required: ['email'],
    },
  },
  handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
    try {
      const email = requireString(args.email, 'email');

      const result = await client.getActivityData(email);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

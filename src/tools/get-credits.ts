/**
 * Tool: get_credits
 * Get the number of credits remaining in your ZeroBounce account
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import { ToolHandler, createSuccessResponse, createErrorResponse } from './types.js';

export const getCreditsTool: ToolHandler = {
  definition: {
    name: 'get_credits',
    description: 'Get the number of credits remaining in your ZeroBounce account.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      const result = await client.getCredits();
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

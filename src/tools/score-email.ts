/**
 * Tool: score_email
 * Real-time AI scoring for a single email (GET/POST /v2/scoring)
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  optionalBoolean,
} from './types.js';

export const scoreEmailTool: ToolHandler = {
  definition: {
    name: 'score_email',
    description:
      'Real-time AI scoring for a single email address (ZeroBounce GET or POST /v2/scoring). Returns email and numeric score.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address to score',
        },
        usePost: {
          type: 'boolean',
          description: 'When true, uses POST with form-encoded api_key and email',
        },
      },
      required: ['email'],
    },
  },
  handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
    try {
      const email = requireString(args.email, 'email');
      const usePost = optionalBoolean(args.usePost) ?? false;

      const result = await client.scoreEmail(email, { usePost });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

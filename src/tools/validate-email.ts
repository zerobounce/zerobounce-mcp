/**
 * Tool: validate_email
 * Validate a single email address using ZeroBounce API
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  optionalString,
} from './types.js';

export const validateEmailTool: ToolHandler = {
  definition: {
    name: 'validate_email',
    description:
      'Validate a single email address using ZeroBounce API. Returns detailed validation results including status, sub-status, and additional metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'The email address to validate',
        },
        ipAddress: {
          type: 'string',
          description: 'Optional IP address of the user (helps improve accuracy)',
        },
      },
      required: ['email'],
    },
  },
  handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
    try {
      const email = requireString(args.email, 'email');
      const ipAddress = optionalString(args.ipAddress);

      const result = await client.validateEmail(email, ipAddress);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

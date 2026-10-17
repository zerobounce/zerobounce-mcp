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
  optionalNumber,
  optionalBoolean,
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
        timeout: {
          type: 'number',
          description: 'Validation timeout in seconds (3–60)',
        },
        activityData: {
          type: 'boolean',
          description: 'Include activity data on the validation result',
        },
        verifyPlus: {
          type: 'boolean',
          description: 'Use Verify+ validation for this request',
        },
        usePost: {
          type: 'boolean',
          description: 'When true, uses POST /validate with form-encoded body (same parameters as GET)',
        },
      },
      required: ['email'],
    },
  },
  handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
    try {
      const email = requireString(args.email, 'email');
      const ipAddress = optionalString(args.ipAddress);
      const timeout = optionalNumber(args.timeout);
      const activityData = optionalBoolean(args.activityData);
      const verifyPlus = optionalBoolean(args.verifyPlus);
      const usePost = optionalBoolean(args.usePost) ?? false;

      const result = await client.validateEmail(email, {
        ipAddress,
        timeout,
        activityData,
        verifyPlus,
        usePost,
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

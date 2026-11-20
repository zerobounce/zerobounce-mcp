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
  assertEmailLength,
} from './types.js';
import { describeTool } from './catalog.js';

export const validateEmailTool: ToolHandler = {
  definition: {
    ...describeTool('validate'),
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
        domainInfo: {
          type: 'boolean',
          description:
            'Add domain_website_exists and domain_registrant_company_name (WHOIS) for the domain',
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
      assertEmailLength(email, 'email');
      const ipAddress = optionalString(args.ipAddress, 'ipAddress');
      const timeout = optionalNumber(args.timeout, 'timeout');
      const activityData = optionalBoolean(args.activityData, 'activityData');
      const verifyPlus = optionalBoolean(args.verifyPlus, 'verifyPlus');
      const domainInfo = optionalBoolean(args.domainInfo, 'domainInfo');
      const usePost = optionalBoolean(args.usePost, 'usePost') ?? false;

      const result = await client.validateEmail(email, {
        ipAddress,
        timeout,
        activityData,
        verifyPlus,
        domainInfo,
        usePost,
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

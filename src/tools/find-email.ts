/**
 * Tool: find_email
 * Find an email address based on domain, name, and/or company
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  optionalString,
} from './types.js';

export const findEmailTool: ToolHandler = {
  definition: {
    name: 'find_email',
    description: 'Find an email address based on domain, name, and/or company.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Domain to search for email addresses',
        },
        firstName: {
          type: 'string',
          description: 'First name of the person',
        },
        middleName: {
          type: 'string',
          description: 'Middle name of the person',
        },
        lastName: {
          type: 'string',
          description: 'Last name of the person',
        },
        company: {
          type: 'string',
          description: 'Company name',
        },
      },
      required: [],
    },
  },
  handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
    try {
      const domain = optionalString(args.domain);
      const firstName = optionalString(args.firstName);
      const middleName = optionalString(args.middleName);
      const lastName = optionalString(args.lastName);
      const company = optionalString(args.company);

      // Per ZeroBounce docs, at least a domain or company is required
      if (!domain && !company) {
        throw new Error('Either "domain" or "company" is required');
      }

      const result = await client.findEmail({
        domain,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        company,
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

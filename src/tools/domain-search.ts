/**
 * Tool: domain_search
 * Search for email addresses in a domain
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  optionalString,
} from './types.js';

export const domainSearchTool: ToolHandler = {
  definition: {
    name: 'domain_search',
    description: 'Search for email addresses in a domain.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Domain to search',
        },
        firstName: {
          type: 'string',
          description: 'Optional first name',
        },
        lastName: {
          type: 'string',
          description: 'Optional last name',
        },
        company: {
          type: 'string',
          description: 'Optional company name',
        },
      },
      required: ['domain'],
    },
  },
  handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
    try {
      const domain = requireString(args.domain, 'domain');
      const firstName = optionalString(args.firstName);
      const lastName = optionalString(args.lastName);
      const company = optionalString(args.company);

      const result = await client.domainSearch({
        domain,
        first_name: firstName,
        last_name: lastName,
        company,
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

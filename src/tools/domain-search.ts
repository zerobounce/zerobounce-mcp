/**
 * Tool: domain_search
 * Get likely email format for a domain or company
 */

import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  optionalString,
} from './types.js';

export const domainSearchTool: ToolHandler = {
  definition: {
    name: 'domain_search',
    description:
      'Get the likely email address format for a domain or company (Domain Search API).',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Domain to look up (e.g. example.com)',
        },
        company: {
          type: 'string',
          description: 'Company name to look up (alternative to domain)',
        },
      },
      required: [],
    },
  },
  handler: async (client: ZeroBounceClient, args: Record<string, unknown>) => {
    try {
      const domain = optionalString(args.domain);
      const company = optionalString(args.company);

      if (!domain && !company) {
        throw new Error('Either "domain" or "company" is required');
      }

      const result = await client.domainSearch({ domain, company });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

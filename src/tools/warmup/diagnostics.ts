/**
 * Warmup domain diagnostics (operation 73). The SMTP configuration test (74) is not
 * exposed: it takes the mailbox's SMTP password, which would pass through the conversation.
 */

import type { ZeroBounceClient } from '../../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireEmail,
  optionalString,
} from '../types.js';
import { describeTool } from '../catalog.js';

export const warmupCheckDomainDmarcTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['checkDomainDmarc'],
  definition: {
    ...describeTool('warmup_check_domain_dmarc'),
    inputSchema: {
      type: 'object',
      properties: {
        fromAddress: {
          type: 'string',
          description: 'An email address, not a bare domain (e.g. sender@example.com)',
        },
        dkimSelector: { type: 'string', description: 'DKIM selector to look up' },
      },
      required: ['fromAddress'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.checkDomainDmarc(
        requireEmail(args.fromAddress, 'fromAddress'),
        optionalString(args.dkimSelector, 'dkimSelector') ?? null
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};


/**
 * Warmup domain and SMTP diagnostics (operations 73-74).
 */

import type { ZeroBounceClient } from '../../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  requireNumber,
  optionalString,
} from '../types.js';

export const warmupCheckDomainDmarcTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['checkDomainDmarc'],
  definition: {
    name: 'warmup_check_domain_dmarc',
    description:
      "Check the SPF, DKIM and DMARC records of a from-address's domain. fromAddress must be a " +
      'full email address such as sender@example.com: the live API rejects a bare domain, ' +
      'although the public docs describe one.',
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
        requireString(args.fromAddress, 'fromAddress'),
        optionalString(args.dkimSelector) ?? null
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupTestSmtpConfigurationTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['testSmtpConfiguration'],
  definition: {
    name: 'warmup_test_smtp_configuration',
    description:
      'Check that SMTP credentials connect and hand off a message. Nothing is stored, and the ' +
      'test message goes to a ZeroBounce test recipient rather than fromAddress. The live API ' +
      'answers a failed SMTP login with HTTP 500; the username and password are masked in ' +
      'every error from this call.',
    inputSchema: {
      type: 'object',
      properties: {
        fromAddress: { type: 'string', description: 'The from-address being configured' },
        username: { type: 'string', description: 'SMTP username' },
        password: { type: 'string', description: 'SMTP password' },
        server: { type: 'string', description: 'SMTP server hostname' },
        port: { type: 'number', description: 'SMTP port, 1-65535' },
      },
      required: ['fromAddress', 'username', 'password', 'server', 'port'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.testSmtpConfiguration({
        fromAddress: requireString(args.fromAddress, 'fromAddress'),
        username: requireString(args.username, 'username'),
        password: requireString(args.password, 'password'),
        server: requireString(args.server, 'server'),
        port: requireNumber(args.port, 'port'),
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

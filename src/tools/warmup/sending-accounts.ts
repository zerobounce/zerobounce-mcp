/**
 * Warmup sending-account tools (operations 49-55).
 *
 * Every tool here needs the Warmup API key, not the validation key, so they all
 * carry `requiresWarmupKey` and stay unregistered without one.
 */

import type { ZeroBounceClient } from '../../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  requireEmail,
  requireNumber,
  requireBoolean,
  optionalString,
  optionalNumber,
  optionalBoolean,
  optionalObject,
} from '../types.js';
import { describeTool } from '../catalog.js';

export const warmupListSendingAccountsTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['listSendingAccounts'],
  definition: {
    ...describeTool('warmup_list_sending_accounts'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      return createSuccessResponse(await client.warmup.listSendingAccounts());
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupGetSendingAccountTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getSendingAccount'],
  definition: {
    ...describeTool('warmup_get_sending_account'),
    inputSchema: {
      type: 'object',
      properties: {
        fromAddress: { type: 'string', description: 'The account from-address' },
      },
      required: ['fromAddress'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.getSendingAccount(
        requireEmail(args.fromAddress, 'fromAddress')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupAddSendingAccountTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['addSendingAccount'],
  definition: {
    ...describeTool('warmup_add_sending_account'),
    inputSchema: {
      type: 'object',
      properties: {
        fromAddress: { type: 'string', description: 'The from-address to warm up' },
        onboardingModel: {
          type: 'string',
          enum: ['self_managed', 'zb_managed'],
          description: 'Who runs the mailbox',
        },
        engagementRuleId: {
          type: 'number',
          description:
            'Standard engagement rule, 0-4 (0 Default, 1 Slow Pace, 2 Repair, 3 Boost, 4 Protect). Required for self_managed.',
        },
        ignoreConflict: {
          type: 'boolean',
          description: 'Accept the address even if it conflicts with an existing one',
        },
        emailContent: {
          type: 'object',
          description:
            'zb_managed only: company_name, company_website, company_description, types_of_emails (transactional/newsletter/marketing), example_email',
        },
        managedSending: {
          type: 'object',
          description:
            'zb_managed only: weekdays_only, timezone, timezone_offset (-11 to 14), warmup_start_date (YYYY-MM-DD)',
        },
      },
      required: ['fromAddress', 'onboardingModel'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.addSendingAccount({
        fromAddress: requireEmail(args.fromAddress, 'fromAddress'),
        onboardingModel: requireString(args.onboardingModel, 'onboardingModel') as
          | 'self_managed'
          | 'zb_managed',
        engagementRuleId: optionalNumber(args.engagementRuleId, 'engagementRuleId') ?? null,
        ignoreConflict: optionalBoolean(args.ignoreConflict, 'ignoreConflict') ?? null,
        emailContent: optionalObject(args.emailContent, 'emailContent') ?? null,
        managedSending: optionalObject(args.managedSending, 'managedSending') ?? null,
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupUpdateSendingAccountTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['updateSendingAccount'],
  definition: {
    ...describeTool('warmup_update_sending_account'),
    inputSchema: {
      type: 'object',
      properties: {
        fromAddress: { type: 'string', description: 'The account from-address' },
        engagementRuleId: { type: 'number', description: 'Standard engagement rule, 0-4' },
        statusId: { type: 'number', description: 'Status, 0-8 (4 Paused, 5 Disabled)' },
        autoEnable: {
          type: 'boolean',
          description: 'Accepted as true only for an account that is not active',
        },
      },
      required: ['fromAddress', 'engagementRuleId', 'statusId', 'autoEnable'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.updateSendingAccount({
        fromAddress: requireEmail(args.fromAddress, 'fromAddress'),
        engagementRuleId: requireNumber(args.engagementRuleId, 'engagementRuleId'),
        statusId: requireNumber(args.statusId, 'statusId'),
        autoEnable: requireBoolean(args.autoEnable, 'autoEnable'),
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupDeleteSendingAccountTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['deleteSendingAccount'],
  definition: {
    ...describeTool('warmup_delete_sending_account'),
    inputSchema: {
      type: 'object',
      properties: {
        fromAddress: { type: 'string', description: 'The account from-address' },
      },
      required: ['fromAddress'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.deleteSendingAccount(
        requireEmail(args.fromAddress, 'fromAddress')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupChangeFromAddressTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['changeFromAddress'],
  definition: {
    ...describeTool('warmup_change_from_address'),
    inputSchema: {
      type: 'object',
      properties: {
        oldFromAddress: { type: 'string', description: 'The current from-address' },
        newFromAddress: { type: 'string', description: 'The replacement from-address' },
      },
      required: ['oldFromAddress', 'newFromAddress'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.changeFromAddress(
        requireEmail(args.oldFromAddress, 'oldFromAddress'),
        requireEmail(args.newFromAddress, 'newFromAddress')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupListFromAddressesTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['listFromAddresses'],
  definition: {
    ...describeTool('warmup_list_from_addresses'),
    inputSchema: {
      type: 'object',
      properties: {
        searchFrom: {
          type: 'string',
          description: 'Filter text. Letters, digits and . - _ @ + only.',
        },
        offset: { type: 'number', description: 'Non-negative offset; the API defaults to 0' },
        limit: { type: 'number', description: 'Page size; the API defaults to 100' },
      },
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.listFromAddresses({
        searchFrom: optionalString(args.searchFrom, 'searchFrom') ?? null,
        offset: optionalNumber(args.offset, 'offset') ?? null,
        limit: optionalNumber(args.limit, 'limit') ?? null,
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

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
  requireNumber,
  requireBoolean,
  optionalString,
  optionalNumber,
  optionalBoolean,
  optionalObject,
} from '../types.js';

export const warmupListSendingAccountsTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['listSendingAccounts'],
  definition: {
    name: 'warmup_list_sending_accounts',
    description: "List every ZeroBounce Warmup sending account belonging to the Warmup key's team.",
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
    name: 'warmup_get_sending_account',
    description: 'Get one ZeroBounce Warmup sending account by its from-address.',
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
        requireString(args.fromAddress, 'fromAddress')
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
    name: 'warmup_add_sending_account',
    description:
      'Add a from-address to ZeroBounce Warmup. "self_managed" runs your own mailbox and ' +
      'requires engagementRuleId (0-4). "zb_managed" has ZeroBounce provision the mailbox and ' +
      'takes emailContent and managedSending instead; it rejects engagementRuleId.',
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
        fromAddress: requireString(args.fromAddress, 'fromAddress'),
        onboardingModel: requireString(args.onboardingModel, 'onboardingModel') as
          | 'self_managed'
          | 'zb_managed',
        engagementRuleId: optionalNumber(args.engagementRuleId) ?? null,
        ignoreConflict: optionalBoolean(args.ignoreConflict) ?? null,
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
    name: 'warmup_update_sending_account',
    description:
      "Update a ZeroBounce Warmup sending account's engagement rule, status and auto-enable flag.",
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
        fromAddress: requireString(args.fromAddress, 'fromAddress'),
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
    name: 'warmup_delete_sending_account',
    description:
      'Remove a sending account from ZeroBounce Warmup. Destructive: the account and its ' +
      'warmup history are deleted.',
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
        requireString(args.fromAddress, 'fromAddress')
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
    name: 'warmup_change_from_address',
    description:
      'Move a ZeroBounce Warmup account and its history to a new from-address. Despite the ' +
      'underlying /smtp-credentials path, no SMTP credentials are stored.',
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
        requireString(args.oldFromAddress, 'oldFromAddress'),
        requireString(args.newFromAddress, 'newFromAddress')
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
    name: 'warmup_list_from_addresses',
    description: 'List the from-addresses registered with ZeroBounce Warmup.',
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
        searchFrom: optionalString(args.searchFrom) ?? null,
        offset: optionalNumber(args.offset) ?? null,
        limit: optionalNumber(args.limit) ?? null,
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

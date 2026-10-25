/**
 * Warmup engagement-rule tools (operations 56-61).
 */

import type { ZeroBounceClient } from '../../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  requireNumber,
} from '../types.js';

export const warmupGetEngagementRulesTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getEngagementRules'],
  definition: {
    name: 'warmup_get_engagement_rules',
    description:
      'List the ZeroBounce Warmup engagement rule catalogue: -1 Custom, 0 Default, 1 Slow Pace, ' +
      '2 Repair, 3 Boost, 4 Protect.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      return createSuccessResponse(await client.warmup.getEngagementRules());
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupSetEngagementRuleTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['setEngagementRule'],
  definition: {
    name: 'warmup_set_engagement_rule',
    description: 'Set a standard ZeroBounce Warmup engagement rule (0-4) on an address.',
    inputSchema: {
      type: 'object',
      properties: {
        cFrom: { type: 'string', description: 'The warmup address identifier (c_from)' },
        ruleId: { type: 'number', description: 'Standard engagement rule, 0-4' },
      },
      required: ['cFrom', 'ruleId'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.setEngagementRule(
        requireString(args.cFrom, 'cFrom'),
        requireNumber(args.ruleId, 'ruleId')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupGetCustomEngagementTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getCustomEngagement'],
  definition: {
    name: 'warmup_get_custom_engagement',
    description:
      "Get an address's custom ZeroBounce Warmup engagement rule, including can_update and " +
      'remaining_seconds of the update cooldown.',
    inputSchema: {
      type: 'object',
      properties: {
        cFrom: { type: 'string', description: 'The warmup address identifier (c_from)' },
      },
      required: ['cFrom'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.getCustomEngagement(requireString(args.cFrom, 'cFrom'));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupCreateCustomEngagementTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['createCustomEngagement'],
  definition: {
    name: 'warmup_create_custom_engagement',
    description:
      'Create a custom ZeroBounce Warmup engagement rule. Starts a 7-day cooldown before the ' +
      'rule can be updated again.',
    inputSchema: {
      type: 'object',
      properties: {
        cFrom: { type: 'string', description: 'The warmup address identifier (c_from)' },
        replyPct: { type: 'number', description: 'Reply percentage, 5-45' },
        importantPct: { type: 'number', description: 'Mark-as-important percentage, 5-40' },
        clickPct: {
          type: 'number',
          description: 'Click percentage, 0-70 and at most importantPct x 1.75',
        },
      },
      required: ['cFrom', 'replyPct', 'importantPct', 'clickPct'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.createCustomEngagement({
        cFrom: requireString(args.cFrom, 'cFrom'),
        replyPct: requireNumber(args.replyPct, 'replyPct'),
        importantPct: requireNumber(args.importantPct, 'importantPct'),
        clickPct: requireNumber(args.clickPct, 'clickPct'),
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupUpdateCustomEngagementTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['updateCustomEngagement'],
  definition: {
    name: 'warmup_update_custom_engagement',
    description:
      'Update a custom ZeroBounce Warmup engagement rule. During the 7-day cooldown the API ' +
      'answers with HTTP 429.',
    inputSchema: {
      type: 'object',
      properties: {
        cFrom: { type: 'string', description: 'The warmup address identifier (c_from)' },
        replyPct: { type: 'number', description: 'Reply percentage, 5-45' },
        importantPct: { type: 'number', description: 'Mark-as-important percentage, 5-40' },
        clickPct: {
          type: 'number',
          description: 'Click percentage, 0-70 and at most importantPct x 1.75',
        },
      },
      required: ['cFrom', 'replyPct', 'importantPct', 'clickPct'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.updateCustomEngagement({
        cFrom: requireString(args.cFrom, 'cFrom'),
        replyPct: requireNumber(args.replyPct, 'replyPct'),
        importantPct: requireNumber(args.importantPct, 'importantPct'),
        clickPct: requireNumber(args.clickPct, 'clickPct'),
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupDeleteCustomEngagementTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['deleteCustomEngagement'],
  definition: {
    name: 'warmup_delete_custom_engagement',
    description:
      'Delete a custom ZeroBounce Warmup engagement rule and fall back to a standard rule (1-4).',
    inputSchema: {
      type: 'object',
      properties: {
        cFrom: { type: 'string', description: 'The warmup address identifier (c_from)' },
        engagementRuleId: {
          type: 'number',
          description: 'Standard rule to fall back to, 1-4',
        },
      },
      required: ['cFrom', 'engagementRuleId'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.deleteCustomEngagement(
        requireString(args.cFrom, 'cFrom'),
        requireNumber(args.engagementRuleId, 'engagementRuleId')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

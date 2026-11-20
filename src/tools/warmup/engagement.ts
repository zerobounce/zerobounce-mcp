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
import { describeTool } from '../catalog.js';

export const warmupGetEngagementRulesTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getEngagementRules'],
  definition: {
    ...describeTool('warmup_get_engagement_rules'),
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
    ...describeTool('warmup_set_engagement_rule'),
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
    ...describeTool('warmup_get_custom_engagement'),
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
    ...describeTool('warmup_create_custom_engagement'),
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
    ...describeTool('warmup_update_custom_engagement'),
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
    ...describeTool('warmup_delete_custom_engagement'),
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

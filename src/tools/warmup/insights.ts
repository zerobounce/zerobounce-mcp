/**
 * Warmup seed, progress and statistics tools (operations 62-72).
 *
 * `warmup_download_seeds` and `warmup_download_statistics` answer with CSV text,
 * not JSON, so they return it as-is rather than through JSON.stringify.
 */

import type { ZeroBounceClient } from '../../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createTextResponse,
  createErrorResponse,
  requireString,
  requireEmail,
} from '../types.js';
import { describeTool } from '../catalog.js';

export const warmupGetSeedsTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getSeeds'],
  definition: {
    ...describeTool('warmup_get_seeds'),
    inputSchema: { type: 'object', properties: {} },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      return createSuccessResponse(await client.warmup.getSeeds());
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupDownloadSeedsTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['downloadSeeds'],
  definition: {
    ...describeTool('warmup_download_seeds'),
    inputSchema: { type: 'object', properties: {} },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      return createTextResponse(await client.warmup.downloadSeeds());
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupGetSeedCountTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getSeedCount'],
  definition: {
    ...describeTool('warmup_get_seed_count'),
    inputSchema: { type: 'object', properties: {} },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      return createSuccessResponse(await client.warmup.getSeedCount());
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupGetProgressTodayTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getProgressToday'],
  definition: {
    ...describeTool('warmup_get_progress_today'),
    inputSchema: { type: 'object', properties: {} },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      return createSuccessResponse(await client.warmup.getProgressToday());
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupGetSentTodayTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getSentToday'],
  definition: {
    ...describeTool('warmup_get_sent_today'),
    inputSchema: { type: 'object', properties: {} },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      return createSuccessResponse(await client.warmup.getSentToday());
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupGetEmailsPerDayTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getEmailsPerDay'],
  definition: {
    ...describeTool('warmup_get_emails_per_day'),
    inputSchema: { type: 'object', properties: {} },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      return createSuccessResponse(await client.warmup.getEmailsPerDay());
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupGetStatisticsTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getStatistics'],
  definition: {
    ...describeTool('warmup_get_statistics'),
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
      const result = await client.warmup.getStatistics(
        requireEmail(args.fromAddress, 'fromAddress')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupGetStatisticsPerDayTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getStatisticsPerDay'],
  definition: {
    ...describeTool('warmup_get_statistics_per_day'),
    inputSchema: {
      type: 'object',
      properties: {
        fromAddress: { type: 'string', description: 'The account from-address' },
        startDate: { type: 'string', description: 'Start date, YYYY-MM-DD' },
        endDate: { type: 'string', description: 'End date, YYYY-MM-DD' },
      },
      required: ['fromAddress', 'startDate', 'endDate'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.warmup.getStatisticsPerDay({
        fromAddress: requireEmail(args.fromAddress, 'fromAddress'),
        startDate: requireString(args.startDate, 'startDate'),
        endDate: requireString(args.endDate, 'endDate'),
      });
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupGetStatisticsDetailedTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getStatisticsDetailed'],
  definition: {
    ...describeTool('warmup_get_statistics_detailed'),
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
      const result = await client.warmup.getStatisticsDetailed(requireString(args.cFrom, 'cFrom'));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupDownloadStatisticsTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['downloadStatistics'],
  definition: {
    ...describeTool('warmup_download_statistics'),
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
      const csv = await client.warmup.downloadStatistics(requireString(args.cFrom, 'cFrom'));
      return createTextResponse(csv);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const warmupGetFromAddressStatisticsTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getFromAddressStatistics'],
  definition: {
    ...describeTool('warmup_get_from_address_statistics'),
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
      const result = await client.warmup.getFromAddressStatistics(
        requireEmail(args.fromAddress, 'fromAddress')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

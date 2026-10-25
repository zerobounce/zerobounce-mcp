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
} from '../types.js';

export const warmupGetSeedsTool: ToolHandler = {
  requiresWarmupKey: true,
  warmupMethods: ['getSeeds'],
  definition: {
    name: 'warmup_get_seeds',
    description: 'List the ZeroBounce Warmup seed accounts.',
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
    name: 'warmup_download_seeds',
    description:
      'Download the ZeroBounce Warmup seed list as CSV text (columns seed,provider). Returns ' +
      'the CSV itself, not JSON.',
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
    name: 'warmup_get_seed_count',
    description: 'Get the number of ZeroBounce Warmup seed accounts.',
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
    name: 'warmup_get_progress_today',
    description: "Get today's ZeroBounce Warmup progress.",
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
    name: 'warmup_get_sent_today',
    description: 'Get the number of ZeroBounce Warmup messages sent today.',
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
    name: 'warmup_get_emails_per_day',
    description: 'Get the current ZeroBounce Warmup daily sending volume.',
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
    name: 'warmup_get_statistics',
    description:
      'Get ZeroBounce Warmup statistics for a from-address. An address with no history returns zeros.',
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
        requireString(args.fromAddress, 'fromAddress')
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
    name: 'warmup_get_statistics_per_day',
    description: 'Get daily ZeroBounce Warmup statistics between two dates, inclusive.',
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
        fromAddress: requireString(args.fromAddress, 'fromAddress'),
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
    name: 'warmup_get_statistics_detailed',
    description: 'Get detailed ZeroBounce Warmup statistics for an address.',
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
    name: 'warmup_download_statistics',
    description:
      "Download an address's ZeroBounce Warmup statistics as CSV text. Returns the CSV itself, " +
      'not JSON.',
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
    name: 'warmup_get_from_address_statistics',
    description: 'Get ZeroBounce Warmup statistics for one from-address.',
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
        requireString(args.fromAddress, 'fromAddress')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

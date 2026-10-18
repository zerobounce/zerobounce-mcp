import type { ZeroBounceClient } from '../zerobounce-client.js';
import { ToolHandler, createSuccessResponse, createErrorResponse, requireString } from './types.js';

export const addFilterTool: ToolHandler = {
  sdkMethods: ['addFilter'],
  definition: {
    name: 'add_filter',
    description: 'Add a custom allow/block list filter',
    inputSchema: {
      type: 'object',
      properties: {
        rule: { type: 'string' },
        target: { type: 'string' },
        value: { type: 'string' },
      },
      required: ['rule', 'target', 'value'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.addFilter(
        requireString(args.rule, 'rule'),
        requireString(args.target, 'target'),
        requireString(args.value, 'value')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const listFiltersTool: ToolHandler = {
  sdkMethods: ['listFilters'],
  definition: {
    name: 'list_filters',
    description: 'List custom filters (GET by default; set usePost for POST)',
    inputSchema: {
      type: 'object',
      properties: {
        usePost: { type: 'boolean' },
      },
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const usePost = Boolean(args.usePost);
      const result = await client.listFilters(usePost);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const deleteFilterTool: ToolHandler = {
  sdkMethods: ['deleteFilter'],
  definition: {
    name: 'delete_filter',
    description: 'Delete a custom filter',
    inputSchema: {
      type: 'object',
      properties: {
        rule: { type: 'string' },
        target: { type: 'string' },
        value: { type: 'string' },
      },
      required: ['rule', 'target', 'value'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.deleteFilter(
        requireString(args.rule, 'rule'),
        requireString(args.target, 'target'),
        requireString(args.value, 'value')
      );
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

import type { ZeroBounceClient } from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  optionalBoolean,
  requireString,
} from './types.js';
import { describeTool } from './catalog.js';

export const addFilterTool: ToolHandler = {
  sdkMethods: ['addFilter'],
  definition: {
    ...describeTool('add_filter'),
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
    ...describeTool('list_filters'),
    inputSchema: {
      type: 'object',
      properties: {
        usePost: { type: 'boolean' },
      },
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const usePost = optionalBoolean(args.usePost, 'usePost') ?? false;
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
    ...describeTool('delete_filter'),
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

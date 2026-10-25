/**
 * Inbox Placement Tester tools (bulkapi.zerobounce.net/api/ipt).
 *
 * This API is its own service behind the bulk host: it authenticates with
 * `Authorization: Bearer`, never an `api_key` query parameter, and it mixes
 * naming conventions on `GET /tests` -- `page_size` is snake_case while
 * `createdAfter`/`createdBefore` are camelCase. The SDK sends exactly those
 * spellings; the API silently ignores the other ones, so a renamed parameter
 * reads as "the filter did nothing" rather than as an error.
 */

import type {
  CreateInboxPlacementTestOptions,
  InboxPlacementProviderSelection,
  ListInboxPlacementTestsOptions,
  ZeroBounceClient,
} from '../zerobounce-client.js';
import {
  ToolHandler,
  createSuccessResponse,
  createErrorResponse,
  requireString,
  optionalString,
  optionalNumber,
} from './types.js';
import { validateBulkReturnUrl } from '../security/bulk-input.js';

/** Longest test name the API accepts. */
const MAX_TEST_NAME_LENGTH = 64;
const TEST_TYPES = [1, 2, 3] as const;
const TEST_STATUSES = ['running', 'finished'] as const;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

/**
 * Test ids are integers in the API's URLs, so callers reasonably send either
 * `"123"` or `123`. Both become the same path segment.
 */
function requireTestId(value: unknown, fieldName = 'testId'): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return requireString(value, fieldName).trim();
}

function optionalIdArray(value: unknown, fieldName: string): number[] | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array of ids`);
  }
  return value.map((item, index) => {
    const id = optionalNumber(item);
    if (id === undefined || !Number.isInteger(id)) {
      throw new Error(`${fieldName}[${index}] must be an integer id`);
    }
    return id;
  });
}

function optionalProviderSelections(value: unknown): InboxPlacementProviderSelection[] | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new Error('providers must be an array of { id, maxSeeds } objects');
  }
  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`providers[${index}] must be an object with an id`);
    }
    const entry = item as Record<string, unknown>;
    const id = optionalNumber(entry.id);
    if (id === undefined || !Number.isInteger(id)) {
      throw new Error(`providers[${index}].id must be an integer id`);
    }
    const maxSeeds = optionalNumber(entry.maxSeeds);
    if (maxSeeds !== undefined && (!Number.isInteger(maxSeeds) || maxSeeds < 1)) {
      throw new Error(`providers[${index}].maxSeeds must be an integer of at least 1`);
    }
    return maxSeeds === undefined ? { id } : { id, maxSeeds };
  });
}

function requireWebhookUrl(value: unknown, fieldName = 'webhookUrl'): string {
  const webhookUrl = requireString(value, fieldName);
  // ZeroBounce POSTs the finished result here, so hold it to the same bar as a
  // bulk returnUrl: HTTPS only, never a private or loopback target.
  validateBulkReturnUrl(webhookUrl, fieldName);
  return webhookUrl;
}

export const getInboxPlacementProvidersTool: ToolHandler = {
  sdkMethods: ['getInboxPlacementProviders'],
  definition: {
    name: 'get_inbox_placement_providers',
    description:
      'List the seed providers (mailbox providers and their seed addresses) available for inbox placement tests (GET /api/ipt/providers)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      const result = await client.getInboxPlacementProviders();
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const getInboxPlacementTestTypesTool: ToolHandler = {
  sdkMethods: ['getInboxPlacementTestTypes'],
  definition: {
    name: 'get_inbox_placement_test_types',
    description:
      'List the supported inbox placement test types and which one is the default (GET /api/ipt/test-types)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      const result = await client.getInboxPlacementTestTypes();
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const createInboxPlacementTestTool: ToolHandler = {
  sdkMethods: ['createInboxPlacementTest'],
  definition: {
    name: 'create_inbox_placement_test',
    description:
      'Start an inbox placement test: ZeroBounce returns seed addresses to send your campaign to, then reports where each copy landed (POST /api/ipt/test)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: `Unique test name, at most ${MAX_TEST_NAME_LENGTH} characters`,
        },
        testType: {
          type: 'number',
          enum: [1, 2, 3],
          description: '1 = Email (requires senderEmail), 2 = Unique ID, 3 = Auto Alias',
        },
        senderEmail: {
          type: 'string',
          description: 'The From address to match. Required when testType is 1.',
        },
        providerIds: {
          type: 'array',
          items: { type: 'number' },
          description:
            'Use every active seed of these providers (ids from get_inbox_placement_providers)',
        },
        seedIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Use these specific seed mailboxes',
        },
        providers: {
          type: 'array',
          description: 'Per-provider seed caps',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Provider id' },
              maxSeeds: { type: 'number', description: 'Seed cap for this provider, at least 1' },
            },
            required: ['id'],
          },
        },
        webhookUrl: {
          type: 'string',
          description: 'HTTPS URL the finished result is posted to',
        },
      },
      required: ['name'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const name = requireString(args.name, 'name');
      if (name.length > MAX_TEST_NAME_LENGTH) {
        throw new Error(`name must be at most ${MAX_TEST_NAME_LENGTH} characters`);
      }

      const testType = optionalNumber(args.testType);
      if (testType !== undefined && !TEST_TYPES.includes(testType as 1 | 2 | 3)) {
        throw new Error(`testType must be one of ${TEST_TYPES.join(', ')}`);
      }

      const senderEmail = optionalString(args.senderEmail);
      if (testType === 1 && !senderEmail) {
        throw new Error('senderEmail is required when testType is 1');
      }

      const options: CreateInboxPlacementTestOptions = { name };
      if (testType !== undefined) {
        options.testType = testType as 1 | 2 | 3;
      }
      if (senderEmail) {
        options.senderEmail = senderEmail;
      }
      const providerIds = optionalIdArray(args.providerIds, 'providerIds');
      if (providerIds) {
        options.providerIds = providerIds;
      }
      const seedIds = optionalIdArray(args.seedIds, 'seedIds');
      if (seedIds) {
        options.seedIds = seedIds;
      }
      const providers = optionalProviderSelections(args.providers);
      if (providers) {
        options.providers = providers;
      }
      if (args.webhookUrl !== null && args.webhookUrl !== undefined) {
        options.webhookUrl = requireWebhookUrl(args.webhookUrl);
      }

      const result = await client.createInboxPlacementTest(options);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const getInboxPlacementTestTool: ToolHandler = {
  sdkMethods: ['getInboxPlacementTest'],
  definition: {
    name: 'get_inbox_placement_test',
    description:
      'Get one inbox placement test and its results: inbox, spam, and missing counts per provider (GET /api/ipt/test/{id})',
    inputSchema: {
      type: 'object',
      properties: {
        testId: { type: 'string', description: 'Test id from create_inbox_placement_test' },
      },
      required: ['testId'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.getInboxPlacementTest(requireTestId(args.testId, 'testId'));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const listInboxPlacementTestsTool: ToolHandler = {
  sdkMethods: ['listInboxPlacementTests'],
  definition: {
    name: 'list_inbox_placement_tests',
    description: 'List inbox placement tests, newest first (GET /api/ipt/tests)',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['running', 'finished'],
          description: 'Only tests in this state',
        },
        createdAfter: {
          type: 'string',
          description: 'ISO 8601 date or datetime; only tests created at or after it',
        },
        createdBefore: {
          type: 'string',
          description: 'ISO 8601 date or datetime; only tests created at or before it',
        },
        page: { type: 'number', description: 'Page number, from 1' },
        pageSize: {
          type: 'number',
          description: `Tests per page, ${MIN_PAGE_SIZE} to ${MAX_PAGE_SIZE} (sent as page_size)`,
        },
      },
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const options: ListInboxPlacementTestsOptions = {};

      const status = optionalString(args.status);
      if (status !== undefined) {
        if (!TEST_STATUSES.includes(status as 'running' | 'finished')) {
          throw new Error(`status must be one of ${TEST_STATUSES.join(', ')}`);
        }
        options.status = status as 'running' | 'finished';
      }

      const createdAfter = optionalString(args.createdAfter);
      if (createdAfter !== undefined) {
        options.createdAfter = createdAfter;
      }
      const createdBefore = optionalString(args.createdBefore);
      if (createdBefore !== undefined) {
        options.createdBefore = createdBefore;
      }

      const page = optionalNumber(args.page);
      if (page !== undefined) {
        if (!Number.isInteger(page) || page < 1) {
          throw new Error('page must be an integer of at least 1');
        }
        options.page = page;
      }

      const pageSize = optionalNumber(args.pageSize);
      if (pageSize !== undefined) {
        if (!Number.isInteger(pageSize) || pageSize < MIN_PAGE_SIZE || pageSize > MAX_PAGE_SIZE) {
          throw new Error(
            `pageSize must be an integer between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}`
          );
        }
        options.pageSize = pageSize;
      }

      const result = await client.listInboxPlacementTests(options);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const deleteInboxPlacementTestTool: ToolHandler = {
  sdkMethods: ['deleteInboxPlacementTest'],
  definition: {
    name: 'delete_inbox_placement_test',
    description:
      'Delete a finished inbox placement test. A running test cannot be deleted. (DELETE /api/ipt/test/{id})',
    inputSchema: {
      type: 'object',
      properties: {
        testId: { type: 'string', description: 'Test id to delete' },
      },
      required: ['testId'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.deleteInboxPlacementTest(requireTestId(args.testId, 'testId'));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const getInboxPlacementWebhookTool: ToolHandler = {
  sdkMethods: ['getInboxPlacementWebhook'],
  definition: {
    name: 'get_inbox_placement_webhook',
    description:
      'Get the webhook URL finished inbox placement results are posted to for this API key (GET /api/ipt/webhook)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  handler: async (client: ZeroBounceClient) => {
    try {
      const result = await client.getInboxPlacementWebhook();
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const setInboxPlacementWebhookTool: ToolHandler = {
  sdkMethods: ['setInboxPlacementWebhook'],
  definition: {
    name: 'set_inbox_placement_webhook',
    description:
      'Save the webhook URL finished inbox placement results are posted to for this API key (PUT /api/ipt/webhook)',
    inputSchema: {
      type: 'object',
      properties: {
        webhookUrl: { type: 'string', description: 'HTTPS URL to post finished results to' },
      },
      required: ['webhookUrl'],
    },
  },
  handler: async (client: ZeroBounceClient, args) => {
    try {
      const result = await client.setInboxPlacementWebhook(requireWebhookUrl(args.webhookUrl));
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  },
};

export const inboxPlacementTools = {
  providers: getInboxPlacementProvidersTool,
  testTypes: getInboxPlacementTestTypesTool,
  createTest: createInboxPlacementTestTool,
  getTest: getInboxPlacementTestTool,
  listTests: listInboxPlacementTestsTool,
  deleteTest: deleteInboxPlacementTestTool,
  getWebhook: getInboxPlacementWebhookTool,
  setWebhook: setInboxPlacementWebhookTool,
};

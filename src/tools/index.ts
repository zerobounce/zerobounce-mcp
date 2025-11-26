/**
 * Tools Index
 * Exports all tools for use in the MCP server
 */

import { ToolHandler } from './types.js';

// Validation tools
import { validateEmailTool } from './validate-email.js';
import { validateBatchTool } from './validate-batch.js';

// Account tools
import { getCreditsTool } from './get-credits.js';
import { getApiUsageTool } from './get-api-usage.js';

// Bulk validation tools
import { bulkValidateTools } from './bulk-validate.js';

// AI Scoring tools
import { bulkAIScoringTools } from './bulk-ai-scoring.js';

// Email Finder tools
import { findEmailTool } from './find-email.js';

// Domain Search tools
import { domainSearchTool } from './domain-search.js';

// Activity Data tools
import { getActivityDataTool } from './activity-data.js';

// Re-export all tools
export {
  validateEmailTool,
  validateBatchTool,
  getCreditsTool,
  getApiUsageTool,
  bulkValidateTools,
  bulkAIScoringTools,
  findEmailTool,
  domainSearchTool,
  getActivityDataTool,
};

/**
 * Get all tools as an array
 */
export function getAllTools(): ToolHandler[] {
  return [
    // Validation
    validateEmailTool,
    validateBatchTool,
    // Account
    getCreditsTool,
    getApiUsageTool,
    // Bulk Validation
    bulkValidateTools.sendFile,
    bulkValidateTools.fileStatus,
    bulkValidateTools.getFile,
    bulkValidateTools.deleteFile,
    // AI Scoring
    bulkAIScoringTools.sendFile,
    bulkAIScoringTools.fileStatus,
    bulkAIScoringTools.getFile,
    bulkAIScoringTools.deleteFile,
    // Email Finder
    findEmailTool,
    // Domain Search
    domainSearchTool,
    // Activity Data
    getActivityDataTool,
  ];
}

/**
 * Get tool registry (map of tool name to handler)
 */
export function getToolRegistry(): Map<string, ToolHandler['handler']> {
  const registry = new Map<string, ToolHandler['handler']>();
  const allTools = getAllTools();

  for (const tool of allTools) {
    registry.set(tool.definition.name, tool.handler);
  }

  return registry;
}

/**
 * Tools Index
 * Exports all tools for use in the MCP server
 */

import { ToolHandler } from './types.js';
import { isSdkMethodAvailable } from '../zerobounce-client.js';

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
import { scoreEmailTool } from './score-email.js';

// Email Finder tools
import { findEmailTool } from './find-email.js';

// Domain Search tools
import { domainSearchTool } from './domain-search.js';

// Activity Data tools
import { getActivityDataTool } from './activity-data.js';

// Priority 3 tools
import { bulkEmailFinderTools } from './bulk-email-finder.js';
import { bulkDomainSearchTools } from './bulk-domain-search.js';
import {
  listEvaluatorSendFileTool,
  listEvaluatorResultTool,
  sendEvaluatedFileTool,
} from './list-evaluator.js';
import { addFilterTool, listFiltersTool, deleteFilterTool } from './filters.js';
import {
  listS3FilesTool,
  validateS3FileTool,
  scoreS3FileTool,
  emailFinderS3FileTool,
  domainSearchS3FileTool,
  exportS3FileTool,
} from './s3-bulk.js';
import {
  validateSftpFileTool,
  scoreSftpFileTool,
  emailFinderSftpFileTool,
  domainSearchSftpFileTool,
  exportSftpFileTool,
} from './sftp-bulk.js';

// Re-export all tools
export {
  validateEmailTool,
  validateBatchTool,
  getCreditsTool,
  getApiUsageTool,
  bulkValidateTools,
  bulkAIScoringTools,
  scoreEmailTool,
  findEmailTool,
  domainSearchTool,
  getActivityDataTool,
};

/**
 * Get all tools as an array
 */
function listTools(): ToolHandler[] {
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
    scoreEmailTool,
    // Email Finder
    findEmailTool,
    // Domain Search
    domainSearchTool,
    // Activity Data
    getActivityDataTool,
    bulkEmailFinderTools.sendFile,
    bulkEmailFinderTools.fileStatus,
    bulkEmailFinderTools.getFile,
    bulkEmailFinderTools.deleteFile,
    bulkDomainSearchTools.sendFile,
    bulkDomainSearchTools.fileStatus,
    bulkDomainSearchTools.getFile,
    bulkDomainSearchTools.deleteFile,
    listEvaluatorSendFileTool,
    listEvaluatorResultTool,
    sendEvaluatedFileTool,
    addFilterTool,
    listFiltersTool,
    deleteFilterTool,
    listS3FilesTool,
    validateS3FileTool,
    scoreS3FileTool,
    emailFinderS3FileTool,
    domainSearchS3FileTool,
    exportS3FileTool,
    // SFTP/FTP bulk
    validateSftpFileTool,
    scoreSftpFileTool,
    emailFinderSftpFileTool,
    domainSearchSftpFileTool,
    exportSftpFileTool,
  ];
}

/**
 * Get every tool the installed ZeroBounce SDK can serve
 */
export function getAllTools(): ToolHandler[] {
  return listTools().filter((tool) => (tool.sdkMethods ?? []).every(isSdkMethodAvailable));
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

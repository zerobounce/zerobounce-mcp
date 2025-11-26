/**
 * Bulk AI Scoring File Tools
 * Created using DRY helper functions
 */

import { createBulkFileTools } from './bulk-file-helpers.js';

export const bulkAIScoringTools = createBulkFileTools({
  name: 'bulk_ai_scoring',
  description: 'AI email scoring',
  sendFileMethod: (client, fileContent, fileName, returnUrl, emailAddressColumn) =>
    client.bulkAIScoringSendFile(fileContent, fileName, returnUrl, emailAddressColumn),
  getStatusMethod: (client, fileId) => client.bulkAIScoringFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkAIScoringGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkAIScoringDeleteFile(fileId),
  supportsEmailAddressColumn: true,
});

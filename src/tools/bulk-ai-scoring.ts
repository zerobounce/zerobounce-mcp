/**
 * Bulk AI Scoring File Tools
 * Created using DRY helper functions
 */

import { createBulkFileTools } from './bulk-file-helpers.js';

export const bulkAIScoringTools = createBulkFileTools({
  name: 'bulk_ai_scoring',
  description: 'AI email scoring',
  sendFileMethod: (
    client,
    fileContent,
    fileName,
    returnUrl,
    emailAddressColumn,
    _domainColumn,
    _companyNameColumn,
    _fullNameColumn,
    _firstNameColumn,
    _middleNameColumn,
    _lastNameColumn,
    options
  ) =>
    client.bulkAIScoringSendFile(fileContent, fileName, returnUrl, emailAddressColumn, {
      hasHeaderRow: options?.hasHeaderRow,
      removeDuplicate: options?.removeDuplicate,
    }),
  getStatusMethod: (client, fileId) => client.bulkAIScoringFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkAIScoringGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkAIScoringDeleteFile(fileId),
  supportsEmailAddressColumn: true,
  supportsRemoveDuplicate: true,
});

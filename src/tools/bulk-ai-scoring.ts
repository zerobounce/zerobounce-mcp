/**
 * Bulk AI Scoring File Tools
 * Created using DRY helper functions
 */

import { createBulkFileTools } from './bulk-file-helpers.js';

export const bulkAIScoringTools = createBulkFileTools({
  names: {
    sendFile: 'scoring_send_file',
    fileStatus: 'scoring_file_status',
    getFile: 'scoring_get_file',
    deleteFile: 'scoring_delete_file',
  },
  getFileOptions: { downloadType: true },
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
  getFileMethod: (client, fileId, options) => client.bulkAIScoringGetFile(fileId, options),
  deleteFileMethod: (client, fileId) => client.bulkAIScoringDeleteFile(fileId),
  supportsEmailAddressColumn: true,
  supportsRemoveDuplicate: true,
});

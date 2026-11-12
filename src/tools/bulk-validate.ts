/**
 * Bulk Validation File Tools
 * Created using DRY helper functions
 */

import { createBulkFileTools } from './bulk-file-helpers.js';

export const bulkValidateTools = createBulkFileTools({
  name: 'bulk_validate',
  description: 'email validation',
  sendFileMethod: (
    client,
    fileContent,
    fileName,
    returnUrl,
    emailAddressColumn,
    _domainColumn,
    _companyNameColumn,
    _fullNameColumn,
    firstNameColumn,
    _middleNameColumn,
    lastNameColumn,
    options
  ) =>
    client.bulkValidateSendFile(fileContent, fileName, returnUrl, emailAddressColumn, {
      ...options,
      firstNameColumn,
      lastNameColumn,
    }),
  getStatusMethod: (client, fileId) => client.bulkValidateFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkValidateGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkValidateDeleteFile(fileId),
  supportsEmailAddressColumn: true,
  supportsFirstNameColumn: true,
  supportsLastNameColumn: true,
  supportsGenderColumn: true,
  supportsIpAddressColumn: true,
  supportsRemoveDuplicate: true,
  supportsAllowPhase2: true,
});

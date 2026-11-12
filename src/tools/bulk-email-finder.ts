import { createBulkFileTools } from './bulk-file-helpers.js';

export const bulkEmailFinderTools = createBulkFileTools({
  name: 'bulk_email_finder',
  description: 'bulk email finder',
  sendFileMethod: (
    client,
    fileContent,
    fileName,
    _returnUrl,
    _emailCol,
    domainColumn,
    _c,
    full,
    first,
    middle,
    last,
    options
  ) =>
    client.bulkEmailFinderSendFile(fileContent, fileName, domainColumn ?? 0, {
      fullNameColumn: full,
      firstNameColumn: first,
      middleNameColumn: middle,
      lastNameColumn: last,
      hasHeaderRow: options?.hasHeaderRow,
    }),
  getStatusMethod: (client, fileId) => client.bulkEmailFinderFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkEmailFinderGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkEmailFinderDeleteFile(fileId),
  sdkMethods: [
    'sendEmailFinderFileStream',
    'getEmailFinderFileStatus',
    'getEmailFinderFile',
    'deleteEmailFinderFile',
  ],
  // The email finder sendfile endpoint takes no return_url.
  supportsReturnUrl: false,
  supportsDomainColumn: true,
  // The API needs a name to work from: firstNameColumn or fullNameColumn.
  supportsFullNameColumn: true,
  supportsFirstNameColumn: true,
  supportsMiddleNameColumn: true,
  supportsLastNameColumn: true,
});

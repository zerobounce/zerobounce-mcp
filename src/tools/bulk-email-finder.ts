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
    _f,
    first,
    middle,
    last
  ) =>
    client.bulkEmailFinderSendFile(fileContent, fileName, domainColumn ?? 0, {
      firstNameColumn: first,
      middleNameColumn: middle,
      lastNameColumn: last,
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
  supportsDomainColumn: true,
  supportsFirstNameColumn: true,
  supportsMiddleNameColumn: true,
  supportsLastNameColumn: true,
});

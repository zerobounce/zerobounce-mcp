import { createBulkFileTools } from './bulk-file-helpers.js';

export const bulkDomainSearchTools = createBulkFileTools({
  name: 'bulk_domain_search',
  description: 'bulk domain search',
  sendFileMethod: (client, fileContent, fileName, _returnUrl, _emailCol, domainColumn) =>
    client.bulkDomainSearchSendFile(fileContent, fileName, domainColumn ?? 0),
  getStatusMethod: (client, fileId) => client.bulkDomainSearchFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkDomainSearchGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkDomainSearchDeleteFile(fileId),
  supportsDomainColumn: true,
});

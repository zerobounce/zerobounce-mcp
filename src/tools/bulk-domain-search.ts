import { createBulkFileTools } from './bulk-file-helpers.js';

export const bulkDomainSearchTools = createBulkFileTools({
  name: 'bulk_domain_search',
  description: 'bulk domain search',
  sendFileMethod: (
    client,
    fileContent,
    fileName,
    _returnUrl,
    _emailCol,
    domainColumn,
    _c,
    _full,
    _first,
    _middle,
    _last,
    options
  ) => client.bulkDomainSearchSendFile(fileContent, fileName, domainColumn ?? 0, options?.hasHeaderRow),
  getStatusMethod: (client, fileId) => client.bulkDomainSearchFileStatus(fileId),
  getFileMethod: (client, fileId) => client.bulkDomainSearchGetFile(fileId),
  deleteFileMethod: (client, fileId) => client.bulkDomainSearchDeleteFile(fileId),
  sdkMethods: [
    'sendDomainSearchFileStream',
    'getDomainSearchFileStatus',
    'getDomainSearchFile',
    'deleteDomainSearchFile',
  ],
  // The domain search sendfile endpoint takes no return_url.
  supportsReturnUrl: false,
  supportsDomainColumn: true,
});

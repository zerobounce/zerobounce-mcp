import { createBulkFileTools } from './bulk-file-helpers.js';

export const bulkDomainSearchTools = createBulkFileTools({
  names: {
    sendFile: 'send_domain_search_file',
    fileStatus: 'domain_search_file_status',
    getFile: 'domain_search_get_file',
    deleteFile: 'domain_search_delete_file',
  },
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

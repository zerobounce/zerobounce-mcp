/**
 * Every tool's name, title, description and annotations, in one place.
 *
 * Names, titles and hints match the hosted ZeroBounce MCP server
 * (mcp.zerobounce.net), so a tool is called the same and behaves the same for
 * the model whichever server it is connected to. Descriptions follow the hosted
 * server's shape -- what the tool does, when to use it, its parameters, and
 * whether it spends credits or changes the account -- with this server's own
 * parameter names.
 *
 * Tool files take their definition from here: `{ ...describeTool('validate'), inputSchema }`.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * - `read`: reads account data, spends nothing.
 * - `credits`: spends credits, changes nothing else.
 * - `write`: changes account data.
 * - `write+credits`: changes account data and spends credits.
 * - `warmup-read` / `warmup-write`: the same on the Warmup API (no validation credits).
 */
type ToolKind = 'read' | 'credits' | 'write' | 'write+credits' | 'warmup-read' | 'warmup-write';

interface CatalogEntry {
  title: string;
  kind: ToolKind;
  summary: string;
  when: string;
  params?: string;
  /** Deletes or overwrites account data that cannot be restored. */
  destructive?: boolean;
}

const READ_ONLY_CREDITS = 'CREDITS: Does not spend validation credits.';
const WARMUP_READ_CREDITS = 'CREDITS: Does not spend validation credits (Warmup API).';
const CREDIT_WARNING =
  'CREDITS: Each successful call spends ZeroBounce account credits. Confirm with the user before ' +
  'calling unless they explicitly asked for validation, enrichment, or activity data.';
const WRITE_WARNING =
  'WRITE: Changes ZeroBounce account data (uploads, deletes, filters, tests, batch validation, ' +
  'warmup settings). Confirm with the user before calling.';

const VALIDATE_OPTIONS =
  'ipAddress (optional) — subscriber IP if known; timeout (optional, 3-60) — seconds ZeroBounce ' +
  'may spend before answering unknown; activityData (optional) — include activity data; ' +
  'verifyPlus (optional) — deeper verification where available; domainInfo (optional) — website ' +
  'availability and WHOIS registrant for the domain; usePost (optional) — send as POST.';

const SEND_FILE_COMMON =
  'fileContent — CSV text; fileName — e.g. list.csv; hasHeaderRow (optional)';

function cloudJob(action: string, source: 'S3' | 'SFTP'): Omit<CatalogEntry, 'title'> {
  const storage = source === 'S3' ? 'Amazon S3 storage' : 'SFTP/FTP storage';
  return {
    kind: 'write+credits',
    summary: `Start a bulk ${action} of a file already in the ${storage} connected to the ZeroBounce account.`,
    when: `When the user's list is in their ${storage} rather than uploaded here.`,
    params:
      `fileName — the file's name in that storage${source === 'S3' ? ' (see list_s3files)' : ''}; ` +
      'returnUrl — HTTPS URL notified when the job finishes (required by the API); ' +
      'hasHeaderRow (optional) — whether the first row is a header; removeDuplicates (optional).',
  };
}

const CATALOG = {
  // Account
  get_credits: {
    title: 'Get credit balance',
    kind: 'read',
    summary: 'Remaining ZeroBounce credits for the account.',
    when: 'Check balance before credit-spending tools, or when the user asks how many credits they have.',
  },
  get_account_credits: {
    title: 'Get credit balance (alias)',
    kind: 'read',
    summary: 'Alias for get_credits — same balance query.',
    when: 'Same as get_credits; prefer get_credits unless the client already lists this name.',
  },
  get_api_usage: {
    title: 'Get API usage',
    kind: 'read',
    summary: 'API usage totals between two calendar dates.',
    when: 'Audit call volume, reconcile billing, or answer how much API was used in a period.',
    params:
      'startDate and endDate — inclusive dates in YYYY-MM-DD (ISO 8601). endDate must be on or after ' +
      'startDate. Example: last 7 days — set startDate to today minus 6 days and endDate to today.',
  },

  // Single address
  get_activity: {
    title: 'Get email activity',
    kind: 'credits',
    summary: 'Engagement / activity signals for one email address.',
    when: 'When the user needs open/click-style activity for a specific address they already have.',
    params: 'email — full email address to look up.',
  },
  validate: {
    title: 'Validate email',
    kind: 'credits',
    summary: 'Validate a single email: status, sub-status, and hygiene fields.',
    when: 'When the user wants deliverability or list-hygiene for one address (not bulk upload).',
    params: `email — address to validate; ${VALIDATE_OPTIONS}`,
  },
  validate_email: {
    title: 'Validate email (alias)',
    kind: 'credits',
    summary: 'Alias for validate — single-email validation.',
    when: 'Same as validate; use when the client exposes this name.',
    params: `email; ${VALIDATE_OPTIONS}`,
  },
  find_email_format: {
    title: 'Find email address',
    kind: 'credits',
    summary: 'Guess a work email from name plus domain or company.',
    when: 'Lead enrichment when the user has a person\'s name and either company domain or company name.',
    params:
      'firstName (required); lastName, middleName (optional); domain OR company (exactly one required — not both).',
  },
  find_domain: {
    title: 'Find company domain',
    kind: 'credits',
    summary: 'Domain discovery from company name or domain hint.',
    when: 'Enrichment when the user needs the corporate domain for a company (or details for a domain).',
    params: 'domain OR company — pass exactly one, not both.',
  },
  score_email: {
    title: 'Score email',
    kind: 'credits',
    summary: 'AI score (0-10) for how likely one address is to engage, with the signals behind it.',
    when: 'When the user asks how good or engaged an address is, beyond valid/invalid.',
    params: 'email — address to score; usePost (optional) — send as POST.',
  },
  validate_batch: {
    title: 'Validate email list',
    kind: 'write+credits',
    summary: 'Validate up to 200 emails in one request.',
    when: 'When the user has a small list to validate in one shot (not a CSV upload).',
    params:
      'emails — array of addresses (or CSV rows with emailAddressColumn); optional timeout (10-120), ' +
      'activityData, verifyPlus.',
  },

  // Bulk validation
  send_file: {
    title: 'Upload file for validation',
    kind: 'write+credits',
    summary: 'Upload a CSV for bulk email validation.',
    when: 'When the user wants to start a new bulk validation job from list data.',
    params:
      `${SEND_FILE_COMMON}; emailAddressColumn — 0-based column of the email addresses; optional ` +
      'firstNameColumn, lastNameColumn, genderColumn, ipAddressColumn, removeDuplicate, allowPhase2, returnUrl.',
  },
  file_status: {
    title: 'Bulk validation status',
    kind: 'read',
    summary: 'Processing status for a bulk validation job.',
    when: 'After a bulk validation was started (send_file or the ZeroBounce app), poll until complete before get_file.',
    params: 'fileId — ZeroBounce bulk file identifier, as returned by send_file.',
  },
  get_file: {
    title: 'Download validation results',
    kind: 'read',
    summary: 'Download results for a completed bulk validation file.',
    when: 'After file_status shows completion, fetch the results CSV.',
    params:
      'fileId — bulk validation id; downloadType (optional) — phase_1, phase_2 or combined; ' +
      'activityData (optional) — include activity columns when supported.',
  },
  delete_file: {
    title: 'Delete validation file',
    kind: 'write',
    destructive: true,
    summary: 'Delete a bulk validation file/job.',
    when: 'When the user explicitly wants to remove a bulk validation job from the account.',
    params: 'fileId — ZeroBounce bulk file identifier.',
  },

  // Bulk scoring
  scoring_send_file: {
    title: 'Upload file for scoring',
    kind: 'write+credits',
    summary: 'Upload a CSV for bulk scoring.',
    when: 'When the user wants to start a new bulk scoring job.',
    params:
      `${SEND_FILE_COMMON}; emailAddressColumn — 0-based column of the email addresses; optional ` +
      'removeDuplicate, returnUrl.',
  },
  scoring_file_status: {
    title: 'Bulk scoring status',
    kind: 'read',
    summary: 'Processing status for a bulk scoring job.',
    when: 'After a bulk scoring job was started (scoring_send_file or the ZeroBounce app), poll until complete before scoring_get_file.',
    params: 'fileId — bulk scoring file identifier.',
  },
  scoring_get_file: {
    title: 'Download scoring results',
    kind: 'read',
    summary: 'Download results for a completed bulk scoring file.',
    when: 'After scoring_file_status completes, retrieve the scoring CSV.',
    params: 'fileId; downloadType (optional) — phase_1, phase_2 or combined.',
  },
  scoring_delete_file: {
    title: 'Delete scoring file',
    kind: 'write',
    destructive: true,
    summary: 'Delete a bulk scoring file/job.',
    when: 'When the user explicitly wants to remove a bulk scoring job.',
    params: 'fileId — bulk scoring file identifier.',
  },

  // Bulk email finder
  send_email_finder_file: {
    title: 'Upload file for email finder',
    kind: 'write+credits',
    summary: 'Upload a CSV of names and domains to find their work email addresses in bulk.',
    when: 'When the user has a list of people and company domains and wants their emails.',
    params:
      `${SEND_FILE_COMMON}; domainColumn — 0-based column of the domain; firstNameColumn or ` +
      'fullNameColumn (one is required); optional lastNameColumn, middleNameColumn.',
  },
  email_finder_file_status: {
    title: 'Bulk email finder status',
    kind: 'read',
    summary: 'Processing status for a bulk email finder job.',
    when: 'After send_email_finder_file, poll until complete before email_finder_get_file.',
    params: 'fileId — as returned by send_email_finder_file.',
  },
  email_finder_get_file: {
    title: 'Download email finder results',
    kind: 'read',
    summary: 'Download results for a completed bulk email finder file.',
    when: 'After email_finder_file_status shows completion.',
    params: 'fileId — bulk email finder file identifier.',
  },
  email_finder_delete_file: {
    title: 'Delete email finder file',
    kind: 'write',
    destructive: true,
    summary: 'Delete a bulk email finder file/job.',
    when: 'When the user explicitly wants to remove a bulk email finder job.',
    params: 'fileId — bulk email finder file identifier.',
  },

  // Bulk domain search
  send_domain_search_file: {
    title: 'Upload file for domain search',
    kind: 'write+credits',
    summary: "Upload a CSV of domains to find each domain's email format in bulk.",
    when: 'When the user has a list of company domains and wants how their addresses are formed.',
    params: `${SEND_FILE_COMMON}; domainColumn — 0-based column of the domain.`,
  },
  domain_search_file_status: {
    title: 'Bulk domain search status',
    kind: 'read',
    summary: 'Processing status for a bulk domain search job.',
    when: 'After send_domain_search_file, poll until complete before domain_search_get_file.',
    params: 'fileId — as returned by send_domain_search_file.',
  },
  domain_search_get_file: {
    title: 'Download domain search results',
    kind: 'read',
    summary: 'Download results for a completed bulk domain search file.',
    when: 'After domain_search_file_status shows completion.',
    params: 'fileId — bulk domain search file identifier.',
  },
  domain_search_delete_file: {
    title: 'Delete domain search file',
    kind: 'write',
    destructive: true,
    summary: 'Delete a bulk domain search file/job.',
    when: 'When the user explicitly wants to remove a bulk domain search job.',
    params: 'fileId — bulk domain search file identifier.',
  },

  // List Evaluator
  send_list_evaluator_file: {
    title: 'Evaluate a list',
    kind: 'write',
    summary:
      'Upload a CSV to the List Evaluator, which estimates a list\'s quality from a sample and uses no credits.',
    when: 'When the user wants a quick quality estimate of a list before spending credits to validate it.',
    params:
      'fileContent — CSV text; fileName — e.g. list.csv; emailAddressColumn — 0-based column of the email addresses.',
  },
  get_list_evaluator_result: {
    title: 'List Evaluator result',
    kind: 'read',
    summary:
      'Progress and quality estimate (valid, invalid, catch-all, abuse percentages) of a List Evaluator run.',
    when: 'After send_list_evaluator_file; when finished, send_evaluated_file can validate the list.',
    params: 'fileId — as returned by send_list_evaluator_file.',
  },
  send_evaluated_file: {
    title: 'Validate an evaluated list',
    kind: 'write+credits',
    summary: 'Start a bulk validation of a list the List Evaluator has finished.',
    when: 'After get_list_evaluator_result shows finished and the user wants the whole list validated.',
    params: 'fileId — the List Evaluator file id (no upload needed).',
  },

  // Filters
  list_filters: {
    title: 'List allow/block filters',
    kind: 'read',
    summary: "The account's allow and block filters (rule, target, value).",
    when: 'When the user asks which emails, domains, MX or TLDs are always allowed or blocked.',
    params: 'usePost (optional) — send as POST.',
  },
  add_filter: {
    title: 'Add allow/block filter',
    kind: 'write',
    summary: "Always allow or always block an email, domain, MX or TLD in this account's validations.",
    when: 'When the user explicitly wants a validation override for an address or domain.',
    params: 'rule — allow or block; target — email, domain, mx or tld; value — the address, domain, MX host or TLD.',
  },
  delete_filter: {
    title: 'Delete allow/block filter',
    kind: 'write',
    destructive: true,
    summary: 'Remove an allow or block filter.',
    when: 'When the user explicitly wants a filter removed (see list_filters for the exact values).',
    params: 'rule, target, value — exactly as the filter was added.',
  },

  // Amazon S3 and SFTP
  list_s3files: {
    title: 'List Amazon S3 files',
    kind: 'read',
    summary: 'Files in the Amazon S3 bucket connected to the ZeroBounce account.',
    when: 'Before starting an S3 bulk job, to find the fileName to use.',
    params: 'bucket (optional) — bucket name; search (optional) — part of the file name.',
  },
  validate_s3file: { title: 'Validate an S3 file', ...cloudJob('validation', 'S3') },
  score_s3file: { title: 'Score an S3 file', ...cloudJob('AI scoring', 'S3') },
  email_finder_s3file: { title: 'Find emails for an S3 file', ...cloudJob('email finder', 'S3') },
  domain_search_s3file: { title: 'Search domains in an S3 file', ...cloudJob('domain search', 'S3') },
  validate_sftpfile: { title: 'Validate an SFTP file', ...cloudJob('validation', 'SFTP') },
  score_sftpfile: { title: 'Score an SFTP file', ...cloudJob('AI scoring', 'SFTP') },
  email_finder_sftpfile: { title: 'Find emails for an SFTP file', ...cloudJob('email finder', 'SFTP') },
  domain_search_sftpfile: { title: 'Search domains in an SFTP file', ...cloudJob('domain search', 'SFTP') },
  export_s3file: {
    title: 'Export results to Amazon S3',
    kind: 'write',
    summary: 'Export a finished validation or scoring file back to the connected Amazon S3 bucket.',
    when: 'When the user wants results written to their S3 bucket.',
    params:
      "fileId — the finished job's file id; exportBucket (optional) — defaults to the bucket in the account's S3 settings.",
  },
  export_sftpfile: {
    title: 'Export results to SFTP',
    kind: 'write',
    summary: 'Export a finished validation or scoring file back to the connected SFTP/FTP server.',
    when: 'When the user wants results written to their SFTP/FTP server.',
    params:
      "fileId — the finished job's file id; exportPath (optional) — defaults to the path in the account's SFTP settings.",
  },

  // Inbox Placement Tester
  get_inbox_placement_providers: {
    title: 'Inbox placement providers',
    kind: 'read',
    summary: 'Seed providers (with their ids and seed ids) available for inbox placement tests.',
    when: 'Before create_inbox_placement_test, to choose providers or seeds.',
  },
  get_inbox_placement_test_types: {
    title: 'Inbox placement test types',
    kind: 'read',
    summary: 'Supported inbox placement test types and the default one.',
    when: 'Before create_inbox_placement_test, to pick testType.',
  },
  get_inbox_placement_test: {
    title: 'Inbox placement test result',
    kind: 'read',
    summary: 'One inbox placement test: status, inbox/spam/missing counts and per-seed results.',
    when: 'After create_inbox_placement_test and sending the email, or when the user asks about a test.',
    params: 'testId — numeric test id.',
  },
  list_inbox_placement_tests: {
    title: 'List inbox placement tests',
    kind: 'read',
    summary: "The account's inbox placement tests, newest first.",
    when: 'When the user asks about recent or running inbox placement tests.',
    params:
      'status (optional) — running or finished; createdAfter / createdBefore (optional) — YYYY-MM-DD; ' +
      'page (optional, from 1); pageSize (optional, 1-100, default 25).',
  },
  get_inbox_placement_webhook: {
    title: 'Inbox placement webhook',
    kind: 'read',
    summary:
      'The webhook URL finished inbox placement results are posted to (empty when none). No tool here ' +
      'changes it: the user changes or removes it in the ZeroBounce dashboard.',
    when: 'When the user asks where test results are sent.',
  },
  create_inbox_placement_test: {
    title: 'Create inbox placement test',
    kind: 'write+credits',
    summary:
      'Create an inbox placement test; returns the seed addresses the user must send their email to. ' +
      "Uses one of the account's inbox placement tests.",
    when: 'When the user wants to see whether their email lands in inbox or spam at major providers.',
    params:
      'name — unique, at most 64 characters; testType (optional) — 1 Email (needs senderEmail), 2 Unique ID, ' +
      '3 Auto Alias (default); providerIds or seedIds (optional) — limit the seeds (see ' +
      'get_inbox_placement_providers); providers (optional) — [{"id": 1, "maxSeeds": 5}]. Results also go ' +
      "to the account's saved webhook, which is set in the ZeroBounce dashboard.",
  },
  delete_inbox_placement_test: {
    title: 'Delete inbox placement test',
    kind: 'write',
    destructive: true,
    summary: 'Delete a finished inbox placement test (running tests cannot be deleted).',
    when: 'When the user explicitly wants a test removed.',
    params: 'testId — numeric test id.',
  },

  // Warmup: reads
  warmup_list_sending_accounts: {
    title: 'List warmup sending accounts',
    kind: 'warmup-read',
    summary: 'Every sending account in warmup for the team, with status and totals.',
    when: 'When the user asks which mailboxes are warming up or how warmup is going overall.',
  },
  warmup_get_sending_account: {
    title: 'Warmup sending account',
    kind: 'warmup-read',
    summary: 'One warmup sending account: status, engagement rule, onboarding model and dates.',
    when: 'When the user asks about one address in warmup.',
    params: 'fromAddress — the warmup sending address.',
  },
  warmup_list_from_addresses: {
    title: 'List warmup from-addresses',
    kind: 'warmup-read',
    summary: "The team's registered warmup from-addresses.",
    when: 'To find an address in warmup by part of its name.',
    params: 'searchFrom (optional) — part of the address; offset, limit (optional) — paging.',
  },
  warmup_get_engagement_rules: {
    title: 'Warmup engagement rules',
    kind: 'warmup-read',
    summary: 'The engagement rule catalogue: -1 Custom, 0 Default, 1 Slow Pace, 2 Repair, 3 Boost, 4 Protect.',
    when: 'Before setting a rule, or when the user asks what the rules mean.',
  },
  warmup_get_custom_engagement: {
    title: 'Custom engagement rule',
    kind: 'warmup-read',
    summary: "An address's custom engagement rule, and whether it can be updated yet (7 day cooldown).",
    when: "When the user asks about an address's custom reply/important/click rates.",
    params: 'cFrom — the warmup sending address.',
  },
  warmup_get_seeds: {
    title: 'Warmup seeds',
    kind: 'warmup-read',
    summary: 'The warmup seed mailboxes.',
    when: 'When the user asks which seed mailboxes warmup sends to.',
  },
  warmup_download_seeds: {
    title: 'Download warmup seeds',
    kind: 'warmup-read',
    summary: 'The warmup seed list as CSV text (seed, provider).',
    when: 'When the user wants the seed list as a file or table.',
  },
  warmup_get_seed_count: {
    title: 'Warmup seed count',
    kind: 'warmup-read',
    summary: 'How many warmup seeds there are.',
    when: 'When the user asks how many seeds warmup uses.',
  },
  warmup_get_progress_today: {
    title: 'Warmup progress today',
    kind: 'warmup-read',
    summary: "Today's warmup progress across the team's accounts.",
    when: "When the user asks how today's warmup is going.",
  },
  warmup_get_sent_today: {
    title: 'Warmup emails sent today',
    kind: 'warmup-read',
    summary: 'Warmup emails sent today.',
    when: 'When the user asks how many warmup emails went out today.',
  },
  warmup_get_emails_per_day: {
    title: 'Warmup daily volume',
    kind: 'warmup-read',
    summary: 'The current daily warmup volume.',
    when: 'When the user asks how many warmup emails are sent per day.',
  },
  warmup_get_statistics: {
    title: 'Warmup statistics',
    kind: 'warmup-read',
    summary: 'Warmup statistics for one address (inbox, spam, replies and more).',
    when: 'When the user asks how an address is performing in warmup.',
    params: 'fromAddress — the warmup sending address.',
  },
  warmup_get_statistics_per_day: {
    title: 'Warmup statistics per day',
    kind: 'warmup-read',
    summary: 'Daily warmup statistics for one address between two dates, inclusive.',
    when: 'When the user asks for a warmup trend over a period.',
    params: 'fromAddress — the warmup sending address; startDate, endDate — YYYY-MM-DD.',
  },
  warmup_get_statistics_detailed: {
    title: 'Detailed warmup statistics',
    kind: 'warmup-read',
    summary: 'Detailed warmup statistics for one address.',
    when: 'When the user wants more detail than warmup_get_statistics gives.',
    params: 'cFrom — the warmup sending address.',
  },
  warmup_download_statistics: {
    title: 'Download warmup statistics',
    kind: 'warmup-read',
    summary: "An address's warmup statistics as CSV text.",
    when: 'When the user wants the statistics as a file or table.',
    params: 'cFrom — the warmup sending address.',
  },
  warmup_get_from_address_statistics: {
    title: 'From-address statistics',
    kind: 'warmup-read',
    summary: 'Statistics for one warmup from-address.',
    when: "When the user asks for an address's overall warmup figures.",
    params: 'fromAddress — the warmup sending address.',
  },
  warmup_check_domain_dmarc: {
    title: 'Check SPF, DKIM and DMARC',
    kind: 'warmup-read',
    summary: "SPF, DKIM and DMARC status of a warmup address's domain.",
    when: 'When the user asks whether their sending domain is authenticated.',
    params:
      'fromAddress — the warmup sending address (an email address, not a domain); dkimSelector (optional) — e.g. google.',
  },

  // Warmup: changes
  warmup_add_sending_account: {
    title: 'Add warmup sending account',
    kind: 'warmup-write',
    summary: 'Add a from-address to warmup.',
    when: 'When the user explicitly wants a mailbox added to warmup.',
    params:
      'fromAddress — the warmup sending address; onboardingModel — self_managed (you run the mailbox; ' +
      'engagementRuleId 0-4 required) or zb_managed (ZeroBounce provisions it); ignoreConflict (optional); ' +
      'emailContent (optional, zb_managed) — {"types_of_emails": ["transactional", "newsletter", "marketing"]}; ' +
      'managedSending (optional, zb_managed) — {"timezone_offset": -11..14, "warmup_start_date": "YYYY-MM-DD"}.',
  },
  warmup_update_sending_account: {
    title: 'Update warmup sending account',
    kind: 'warmup-write',
    destructive: true,
    summary: "Change an address's engagement rule, status and auto-enable flag.",
    when: "When the user explicitly wants to pause, resume or retune an address's warmup.",
    params:
      'fromAddress — the warmup sending address; engagementRuleId — 0-4; statusId — e.g. 4 Paused, ' +
      '5 Disabled; autoEnable — true or false.',
  },
  warmup_change_from_address: {
    title: 'Change warmup from-address',
    kind: 'warmup-write',
    destructive: true,
    summary: 'Move a warmup account and its history to a new from-address.',
    when: 'When the user explicitly renames the mailbox that is warming up.',
    params: 'oldFromAddress, newFromAddress.',
  },
  warmup_set_engagement_rule: {
    title: 'Set warmup engagement rule',
    kind: 'warmup-write',
    destructive: true,
    summary: 'Set a standard engagement rule (0-4) on an address.',
    when: 'When the user explicitly wants a different warmup pace for an address.',
    params: 'cFrom — the warmup sending address; ruleId — 0 Default, 1 Slow Pace, 2 Repair, 3 Boost, 4 Protect.',
  },
  warmup_create_custom_engagement: {
    title: 'Create custom engagement rule',
    kind: 'warmup-write',
    summary: 'Create a custom engagement rule for an address; it cannot be changed for 7 days.',
    when: 'When the user explicitly wants custom reply/important/click rates.',
    params: 'cFrom — the warmup sending address; replyPct, importantPct, clickPct — percentages.',
  },
  warmup_update_custom_engagement: {
    title: 'Update custom engagement rule',
    kind: 'warmup-write',
    destructive: true,
    summary: "Update an address's custom engagement rule (allowed 7 days after the last change).",
    when: 'When the user explicitly wants new custom rates.',
    params: 'cFrom — the warmup sending address; replyPct, importantPct, clickPct — percentages.',
  },
  warmup_delete_sending_account: {
    title: 'Delete warmup sending account',
    kind: 'warmup-write',
    destructive: true,
    summary: 'Remove an address from warmup. Cannot be undone.',
    when: 'Only when the user explicitly asks to remove that address from warmup.',
    params: 'fromAddress — the warmup sending address.',
  },
  warmup_delete_custom_engagement: {
    title: 'Delete custom engagement rule',
    kind: 'warmup-write',
    destructive: true,
    summary: "Delete an address's custom rule and fall back to a standard rule.",
    when: 'When the user explicitly wants the custom rule removed.',
    params: 'cFrom — the warmup sending address; engagementRuleId — the standard rule to use instead (1-4).',
  },
} satisfies Record<string, CatalogEntry>;

export type ToolName = keyof typeof CATALOG;

/** Every tool name this server can advertise, in catalog order. */
export const TOOL_NAMES = Object.keys(CATALOG) as ToolName[];

function annotationsFor(entry: CatalogEntry): NonNullable<Tool['annotations']> {
  const base = { title: entry.title };
  if (entry.kind === 'read' || entry.kind === 'warmup-read') {
    return { ...base, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
  }
  if (entry.destructive) {
    return { ...base, readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false };
  }
  return { ...base, readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };
}

function descriptionFor(entry: CatalogEntry): string {
  const lines = [entry.summary, `When to use: ${entry.when}`];
  if (entry.params) lines.push(`Parameters: ${entry.params}`);
  switch (entry.kind) {
    case 'read':
      lines.push(READ_ONLY_CREDITS);
      break;
    case 'warmup-read':
      lines.push(WARMUP_READ_CREDITS);
      break;
    case 'credits':
      lines.push(CREDIT_WARNING);
      break;
    case 'write':
    case 'warmup-write':
      lines.push(WRITE_WARNING);
      break;
    case 'write+credits':
      lines.push(WRITE_WARNING, CREDIT_WARNING);
      break;
  }
  return lines.join('\n');
}

/** A tool's name, title, description and annotations, for the start of its definition. */
export function describeTool(
  name: ToolName
): Pick<Tool, 'name' | 'title' | 'description' | 'annotations'> {
  const entry: CatalogEntry = CATALOG[name];
  return {
    name,
    title: entry.title,
    description: descriptionFor(entry),
    annotations: annotationsFor(entry),
  };
}

/** Tools that delete or overwrite account data (destructiveHint). */
export const DESTRUCTIVE_TOOL_NAMES: ReadonlySet<ToolName> = new Set(
  TOOL_NAMES.filter((name) => (CATALOG[name] as CatalogEntry).destructive)
);

/**
 * What the server tells the model about these tools as a whole (MCP
 * `instructions`), as the hosted server does.
 */
export const SERVER_INSTRUCTIONS =
  "ZeroBounce tools act on the user's own ZeroBounce account. Tools whose description says " +
  "'CREDITS: Each successful call spends' use account credits: call them only for addresses, " +
  'names or domains the user gave and asked about. Check get_credits first when a request may ' +
  'need many credits. For more than 200 addresses use send_file, then poll file_status until it ' +
  'is complete, then get_file. Never delete, or change filters, webhooks or warmup settings, ' +
  'unless the user asked for that.';

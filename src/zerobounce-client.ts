/**
 * ZeroBounce API Client
 * Handles communication with ZeroBounce API endpoints
 */

import ZeroBounceSDK from '@zerobounce/zero-bounce-sdk';
import type { ZeroBounceWarmup } from '@zerobounce/zero-bounce-sdk';
import { looksLikeHtml } from './errors.js';
import { createWarmupClient } from './warmup-client.js';

export interface ZeroBounceConfig {
  apiKey: string;
  baseUrl?: string;
  /**
   * The Warmup API key. Separate product, separate host, separate key: the
   * validation `apiKey` is not accepted by the Warmup API. Omit it and the
   * Warmup tools are never registered.
   */
  warmupApiKey?: string;
  warmupBaseUrl?: string;
}

export interface EmailValidationResult {
  address: string;
  status: string;
  sub_status: string;
  free_email: boolean;
  did_you_mean: string | null;
  account: string | null;
  domain: string | null;
  domain_age_days: string | null;
  smtp_provider: string | null;
  mx_found: string;
  mx_record: string | null;
  firstname: string | null;
  lastname: string | null;
  gender: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  zipcode: string | null;
  processed_at: string;
}

export interface BatchValidationResult {
  email_batch: Array<{
    email_address: string;
    address: string;
    status: string;
    sub_status: string;
    free_email: boolean;
    did_you_mean: string | null;
    account: string | null;
    domain: string | null;
    domain_age_days: string | null;
    smtp_provider: string | null;
    mx_found: string;
    mx_record: string | null;
    firstname: string | null;
    lastname: string | null;
    gender: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    zipcode: string | null;
  }>;
  errors: Array<{
    email_address: string;
    error: string;
  }>;
}

export interface CreditsResponse {
  credits: number;
}

export interface ApiUsageResponse {
  total: number;
  status_valid: number;
  status_invalid: number;
  status_catchall: number;
  status_do_not_mail: number;
  status_spamtrap: number;
  status_abuse: number;
  status_unknown: number;
  sub_status_toxic: number;
  sub_status_disposable: number;
  sub_status_role_based: number;
  sub_status_possible_trap: number;
  sub_status_global_suppression: number;
  sub_status_timeout_exceeded: number;
  sub_status_mail_server_temporary_error: number;
  sub_status_mail_server_did_not_respond: number;
  sub_status_greylisted: number;
  sub_status_antispam_system: number;
  sub_status_does_not_accept_mail: number;
  sub_status_exception_occurred: number;
  sub_status_failed_syntax_check: number;
  sub_status_mailbox_quota_exceeded: number;
  sub_status_possible_typo: number;
  sub_status_unroutable_ip_address: number;
  sub_status_leading_period_removed: number;
  sub_status_does_not_accept_mail_from_mailer_daemon: number;
  sub_status_address_is_blocked: number;
  sub_status_failed_antispam_check: number;
  sub_status_mailbox_not_found: number;
  sub_status_unroutable_mail_server: number;
  sub_status_invalid: number;
  sub_status_mail_server_did_not_respond_within_timeout_period: number;
  sub_status_address_failed_validation: number;
  sub_status_mailbox_storage_exceeded: number;
  sub_status_mailbox_administratively_disabled: number;
  sub_status_domain_not_found: number;
  sub_status_address_is_on_a_global_suppression_list: number;
  start_date: string;
  end_date: string;
}

// Filter interfaces

// Bulk file operation interfaces
export interface BulkFileSendResponse {
  file_id: string;
  file_name: string;
  upload_date: string;
  file_status: string;
  complete_percentage: string;
  return_url?: string;
}

export interface BulkFileStatusResponse {
  file_id: string;
  file_name: string;
  upload_date: string;
  file_status: string;
  complete_percentage: string;
  return_url?: string;
  success_total?: number;
  error_total?: number;
}

export interface BulkFileGetResponse {
  success: true;
  csv: string;
}

export interface BulkFileDeleteResponse {
  success: boolean;
  message?: string;
}

// Real-time AI scoring (GET/POST /v2/scoring)
export interface RealtimeScoreEmailResult {
  email: string;
  score: number;
  error?: string;
}

// AI Scoring interfaces
export interface ScoreEmailResult {
  email: string;
  quality_score: string;
  quality_score_percentage: number;
  quality_score_description: string;
  quality_score_details: {
    deliverability_score: number;
    engagement_score: number;
    reputation_score: number;
  };
  processed_at: string;
}

// Email Finder interfaces
export interface FindEmailRequest {
  /**
   * Company email domain (e.g. example.com)
   */
  domain?: string;
  /**
   * First name of the person
   */
  first_name?: string;
  /**
   * Middle name of the person
   */
  middle_name?: string;
  /**
   * Last name of the person
   */
  last_name?: string;
  /**
   * Company name (alternative to domain)
   */
  company?: string;
}

export interface FindEmailResult {
  email: string;
  email_confidence: string;
  domain: string;
  company_name: string;
  did_you_mean: string;
  failure_reason: string;
}

// Domain Search interfaces
export interface DomainSearchRequest {
  domain?: string;
  company?: string;
}

export interface DomainSearchResult {
  domain: string;
  company_name: string;
  format: string;
  confidence: string;
  did_you_mean: string;
  failure_reason: string;
  other_domain_formats: unknown[];
}

// Activity Data interfaces
export interface ActivityDataResult {
  found: boolean;
  active_status: string;
  active_status_date: string;
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  region: string;
  city: string;
  zipcode: string;
  processed_at: string;
}


/** The documented fields of an S3 or SFTP bulk file job (ops 31-34, 36-39). */
export interface BulkRootFileJobRequest {
  fileName: string;
  hasHeaderRow: boolean;
  removeDuplicates?: boolean;
  returnUrl: string;
}

/** The S3 / SFTP job and export endpoints answer with {success, message}. */
export interface BulkRootJobResponse {
  success: boolean;
  message?: string;
}

// List Evaluator interfaces
export interface ListEvaluatorRequest {
  emails: string[];
}

export interface ListEvaluatorResult {
  total_emails: number;
  valid_emails: number;
  invalid_emails: number;
  catchall_emails: number;
  do_not_mail_emails: number;
  spamtrap_emails: number;
  abuse_emails: number;
  unknown_emails: number;
  quality_score: number;
  processed_at: string;
}

// Inbox Placement Tester interfaces (bulkapi.zerobounce.net/api/ipt)

/** Per-provider seed cap for create_inbox_placement_test. */
export interface InboxPlacementProviderSelection {
  id: number;
  /** At least 1 when given. */
  maxSeeds?: number;
}

export interface CreateInboxPlacementTestOptions {
  /** Unique test name, at most 64 characters. */
  name: string;
  /** 1 (Email, needs senderEmail), 2 (Unique ID) or 3 (Auto Alias). */
  testType?: 1 | 2 | 3;
  /** The From address to match. Required when testType is 1. */
  senderEmail?: string;
  providerIds?: number[];
  seedIds?: number[];
  providers?: InboxPlacementProviderSelection[];
  webhookUrl?: string;
}

export interface ListInboxPlacementTestsOptions {
  status?: 'running' | 'finished';
  /** ISO 8601 date or datetime. The API spells these two camelCase. */
  createdAfter?: string;
  createdBefore?: string;
  /** From 1. */
  page?: number;
  /** 1 to 100. The SDK sends it as the API's snake_case `page_size`. */
  pageSize?: number;
}

export interface InboxPlacementDeleteResponse {
  success: boolean;
  message?: string;
}

/**
 * DELETE /api/ipt/test/{id} answers with an empty body on success. Every other
 * ZeroBounce endpoint returns JSON, so the SDK treats an empty body as a failure
 * and throws. An empty body with a 2xx status is a completed delete, not an error.
 */
function isEmptySuccessBody(error: unknown): boolean {
  const status = (error as { statusCode?: unknown })?.statusCode;
  if (typeof status !== 'number' || status < 200 || status >= 300) {
    return false;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /^Empty response from ZeroBounce/.test(message.trim());
}

/** Reads a 0-based column from one CSV row, honouring double-quoted fields. */
function readCsvColumn(row: string, column: number, rowIndex: number): string {
  const fields: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (quoted) {
      if (ch === '"' && row[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      fields.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  fields.push(field);

  const value = fields[column]?.trim();
  if (!value) {
    throw new Error(`emails[${rowIndex}] has no value in column ${column}`);
  }
  return value;
}

/** Whether the installed ZeroBounce SDK implements the given method. */
export function isSdkMethodAvailable(name: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (ZeroBounceSDK as any).prototype?.[name] === 'function';
}

export class ZeroBounceClient {
  private apiKey: string;
  private baseUrl: string;
  // Use official ZeroBounce SDK for core endpoints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sdk: any;
  private warmupClient?: ZeroBounceWarmup;

  constructor(config: ZeroBounceConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.zerobounce.net/v2';

    // Initialize official SDK with optional regional API base URL
    this.sdk = new (ZeroBounceSDK as any)();
    this.sdk.init(this.apiKey, this.baseUrl);

    // Built only when a Warmup key was supplied: the Warmup SDK class rejects an
    // empty key in its constructor, and the validation key would be refused by
    // the Warmup API anyway.
    if (config.warmupApiKey) {
      this.warmupClient = createWarmupClient(config.warmupApiKey, config.warmupBaseUrl);
    }
  }

  /**
   * The Warmup API client. Warmup tools are only registered when a Warmup key is
   * configured, so reaching this without one means a stale tool registry.
   */
  get warmup(): ZeroBounceWarmup {
    if (!this.warmupClient) {
      throw new Error(
        'A ZeroBounce Warmup API key is required. Provide it via --warmup-api-key, the ' +
          'ZEROBOUNCE_WARMUP_API_KEY environment variable, or the X-ZeroBounce-Warmup-Api-Key ' +
          'header in HTTP mode.'
      );
    }
    return this.warmupClient;
  }

  /** Whether this client can serve Warmup calls. */
  get hasWarmup(): boolean {
    return this.warmupClient !== undefined;
  }

  /** SDK bulk APIs use 1-based column indexes; MCP tools accept 0-based. */
  private toSdkColumnIndex(column?: number): number {
    return (column ?? 0) + 1;
  }

  private toCsvBlob(fileContent: string | Blob): Blob {
    return fileContent instanceof Blob
      ? fileContent
      : new Blob([fileContent], { type: 'text/csv' });
  }

  private requireSdkResult<T>(result: T | undefined, context: string): T {
    if (result === undefined) {
      throw new Error(`ZeroBounce SDK returned no result for ${context}`);
    }
    return result;
  }

  /**
   * Validate a single email address
   */
  async validateEmail(
    email: string,
    options?: {
      ipAddress?: string;
      timeout?: number;
      activityData?: boolean;
      verifyPlus?: boolean;
      usePost?: boolean;
    }
  ): Promise<EmailValidationResult> {
    const hasExtended =
      options &&
      (options.timeout != null ||
        options.activityData != null ||
        options.verifyPlus != null ||
        options.usePost);
    const sdkArg = hasExtended
      ? {
          ip_address: options?.ipAddress,
          timeout: options?.timeout,
          activityData: options?.activityData,
          verifyPlus: options?.verifyPlus,
          ...(options?.usePost ? { method: 'POST' as const } : {}),
        }
      : (options?.ipAddress ?? null);
    const result = await this.sdk.validateEmail(email, sdkArg);
    return result as EmailValidationResult;
  }

  /**
   * Validate multiple email addresses in batch
   * Note: ZeroBounce batch API typically requires file upload, but this implementation
   * uses the real-time batch API on the bulk endpoint
   */
  async validateBatch(
    emails: string[],
    options?: {
      emailAddressColumn?: number;
      timeout?: number;
      activityData?: boolean;
      verifyPlus?: boolean;
    }
  ): Promise<BatchValidationResult> {
    const column = options?.emailAddressColumn;
    const emailBatch = emails.map((entry, row) => ({
      email_address: column == null ? entry : readCsvColumn(entry, column, row),
    }));

    const batchOptions =
      options && (options.timeout != null || options.activityData != null || options.verifyPlus != null)
        ? {
            timeout: options.timeout,
            activityData: options.activityData,
            verifyPlus: options.verifyPlus,
          }
        : null;

    const result = this.requireSdkResult(
      (await this.sdk.validateBatch(emailBatch, batchOptions)) as BatchValidationResult | undefined,
      'batch validation'
    );

    // Account-level failures (invalid key, no credits) come back with HTTP 200 as a
    // single error for "all" addresses rather than as a thrown error.
    const accountError = result.errors?.find((e) => e.email_address === 'all');
    if (accountError) {
      throw new Error(accountError.error);
    }
    return result;
  }

  /**
   * Get account credits
   */
  async getCredits(): Promise<CreditsResponse> {
    const result = await this.sdk.getCredits();
    return result as CreditsResponse;
  }

  /**
   * Get API usage statistics
   */
  async getApiUsage(startDate: string, endDate: string): Promise<ApiUsageResponse> {
    const result = await this.sdk.getApiUsage(startDate, endDate);
    return result as ApiUsageResponse;
  }

  // ========== Bulk Validation File Operations ==========

  /**
   * Send a file for bulk validation
   */
  async bulkValidateSendFile(
    fileContent: string | Blob,
    fileName: string,
    returnUrl?: string,
    emailAddressColumn?: number
  ): Promise<BulkFileSendResponse> {
    const blob = this.toCsvBlob(fileContent);

    const result = this.requireSdkResult(
      await this.sdk.sendFileStream(blob, fileName, {
        email_address_column: this.toSdkColumnIndex(emailAddressColumn),
        return_url: returnUrl || false,
      }),
      'bulk validation send file'
    );

    return result as BulkFileSendResponse;
  }

  /**
   * Get bulk validation file status
   */
  async bulkValidateFileStatus(fileId: string): Promise<BulkFileStatusResponse> {
    const result = await this.sdk.getFileStatus(fileId);
    return result as BulkFileStatusResponse;
  }

  /**
   * Get bulk validation file results
   */
  async bulkValidateGetFile(fileId: string): Promise<BulkFileGetResponse> {
    const result = await this.sdk.getFile(fileId);
    return this.normalizeBulkFileResult(result);
  }

  /**
   * Delete bulk validation file
   */
  async bulkValidateDeleteFile(fileId: string): Promise<BulkFileDeleteResponse> {
    const result = await this.sdk.deleteFile(fileId);
    return result as BulkFileDeleteResponse;
  }

  // ========== AI Scoring Operations ==========

  /**
   * Send a file for bulk AI scoring
   */
  async bulkAIScoringSendFile(
    fileContent: string | Blob,
    fileName: string,
    returnUrl?: string,
    emailAddressColumn?: number
  ): Promise<BulkFileSendResponse> {
    const blob = this.toCsvBlob(fileContent);

    const result = this.requireSdkResult(
      await this.sdk.sendScoringFileStream(blob, fileName, {
        email_address_column: this.toSdkColumnIndex(emailAddressColumn),
        return_url: returnUrl || false,
      }),
      'bulk AI scoring send file'
    );

    return result as BulkFileSendResponse;
  }

  /**
   * Get bulk AI scoring file status
   */
  async bulkAIScoringFileStatus(fileId: string): Promise<BulkFileStatusResponse> {
    const result = await this.sdk.getScoringFileStatus(fileId);
    return result as BulkFileStatusResponse;
  }

  /**
   * Get bulk AI scoring file results
   */
  async bulkAIScoringGetFile(fileId: string): Promise<BulkFileGetResponse> {
    const result = await this.sdk.getScoringFile(fileId);
    return this.normalizeBulkFileResult(result);
  }

  private normalizeBulkFileResult(result: unknown): BulkFileGetResponse {
    if (result === undefined) {
      throw new Error('ZeroBounce SDK returned no result');
    }

    if (typeof result === 'string') {
      // A blocked or failed download can come back as an HTML page with status 200.
      if (looksLikeHtml(result)) {
        throw new Error(result);
      }
      return { success: true, csv: result };
    }

    if (result instanceof Blob) {
      throw new Error('Unexpected Blob response from bulk get-file endpoint');
    }

    if (typeof result === 'object' && result !== null) {
      const error = result as {
        message?: string | string[];
        error?: string;
        error_message?: string;
      };
      const message = Array.isArray(error.message)
        ? error.message.join(', ')
        : error.message ?? error.error_message ?? error.error;

      throw new Error(message ?? JSON.stringify(result));
    }

    throw new Error(`Unexpected bulk get-file response: ${String(result)}`);
  }

  /**
   * Delete bulk AI scoring file
   */
  async bulkAIScoringDeleteFile(fileId: string): Promise<BulkFileDeleteResponse> {
    const result = await this.sdk.deleteScoringFile(fileId);
    return result as BulkFileDeleteResponse;
  }

  // ========== Email Finder Operations ==========

  /**
   * Find an email address
   */
  async findEmail(request: FindEmailRequest): Promise<FindEmailResult> {
    if (!request.first_name) {
      throw new Error('first_name is required for email finder');
    }

    if (!request.domain && !request.company) {
      throw new Error('Either domain or company is required for email finder');
    }

    const nameOptions = {
      first_name: request.first_name,
      middle_name: request.middle_name ?? null,
      last_name: request.last_name ?? null,
    };

    const result = this.requireSdkResult(
      request.domain
        ? await this.sdk.findEmailByDomain({ domain: request.domain, ...nameOptions })
        : await this.sdk.findEmailByCompanyName({
            company_name: request.company!,
            ...nameOptions,
          }),
      'email finder'
    );

    return result as FindEmailResult;
  }

  // ========== Domain Search Operations ==========

  /**
   * Get likely email format for a domain or company
   */
  async domainSearch(request: DomainSearchRequest): Promise<DomainSearchResult> {
    if (!request.domain && !request.company) {
      throw new Error('Either domain or company is required for domain search');
    }

    const result = this.requireSdkResult(
      request.domain
        ? await this.sdk.findEmailFormatByDomain({ domain: request.domain })
        : await this.sdk.findEmailFormatByCompanyName({
            company_name: request.company!,
          }),
      'domain search'
    );

    return result as DomainSearchResult;
  }

  // ========== Activity Data Operations ==========

  /**
   * Get activity data for an email address
   */
  async getActivityData(email: string): Promise<ActivityDataResult> {
    const result = await this.sdk.getEmailActivity(email);
    return result as ActivityDataResult;
  }

  /**
   * Real-time AI scoring for a single email (GET or POST /v2/scoring).
   */
  async scoreEmail(
    email: string,
    options?: { usePost?: boolean }
  ): Promise<RealtimeScoreEmailResult> {
    const sdk = this.sdk as {
      scoreEmail?: (
        email: string,
        opts?: { method?: 'POST' } | null
      ) => Promise<RealtimeScoreEmailResult | undefined>;
    };
    if (typeof sdk.scoreEmail !== 'function') {
      throw new Error(
        'scoreEmail requires @zerobounce/zero-bounce-sdk with /v2/scoring support (upgrade SDK).'
      );
    }
    const method = options?.usePost ? { method: 'POST' as const } : undefined;
    const result = await sdk.scoreEmail(email, method);
    return result as RealtimeScoreEmailResult;
  }

  // ========== List Evaluator Operations ==========

  /**
   * Evaluate the quality of an email list
   * Requires file upload (multipart/form-data) with CSV file containing emails
   */
  async bulkEmailFinderSendFile(
    fileContent: string | Blob,
    fileName: string,
    domainColumn: number,
    options?: {
      firstNameColumn?: number;
      lastNameColumn?: number;
      middleNameColumn?: number;
      fullNameColumn?: number;
      hasHeaderRow?: boolean;
    }
  ): Promise<BulkFileSendResponse> {
    const blob = this.toCsvBlob(fileContent);
    const result = this.requireSdkResult(
      await this.sdk.sendEmailFinderFileStream(blob, fileName, {
        domain_column: this.toSdkColumnIndex(domainColumn),
        first_name_column: options?.firstNameColumn != null
          ? this.toSdkColumnIndex(options.firstNameColumn)
          : false,
        last_name_column: options?.lastNameColumn != null
          ? this.toSdkColumnIndex(options.lastNameColumn)
          : false,
        middle_name_column: options?.middleNameColumn != null
          ? this.toSdkColumnIndex(options.middleNameColumn)
          : false,
        full_name_column: options?.fullNameColumn != null
          ? this.toSdkColumnIndex(options.fullNameColumn)
          : false,
        has_header_row: options?.hasHeaderRow ?? false,
      }),
      'bulk email finder send file'
    );
    return result as BulkFileSendResponse;
  }

  async bulkEmailFinderFileStatus(fileId: string): Promise<BulkFileStatusResponse> {
    const result = await this.sdk.getEmailFinderFileStatus(fileId);
    return result as BulkFileStatusResponse;
  }

  async bulkEmailFinderGetFile(fileId: string): Promise<BulkFileGetResponse> {
    const result = await this.sdk.getEmailFinderFile(fileId);
    return this.normalizeBulkFileResult(result);
  }

  async bulkEmailFinderDeleteFile(fileId: string): Promise<BulkFileDeleteResponse> {
    const result = await this.sdk.deleteEmailFinderFile(fileId);
    return result as BulkFileDeleteResponse;
  }

  async bulkDomainSearchSendFile(
    fileContent: string | Blob,
    fileName: string,
    domainColumn: number,
    hasHeaderRow?: boolean
  ): Promise<BulkFileSendResponse> {
    const blob = this.toCsvBlob(fileContent);
    const result = this.requireSdkResult(
      await this.sdk.sendDomainSearchFileStream(blob, fileName, {
        domain_column: this.toSdkColumnIndex(domainColumn),
        has_header_row: hasHeaderRow ?? false,
      }),
      'bulk domain search send file'
    );
    return result as BulkFileSendResponse;
  }

  async bulkDomainSearchFileStatus(fileId: string): Promise<BulkFileStatusResponse> {
    const result = await this.sdk.getDomainSearchFileStatus(fileId);
    return result as BulkFileStatusResponse;
  }

  async bulkDomainSearchGetFile(fileId: string): Promise<BulkFileGetResponse> {
    const result = await this.sdk.getDomainSearchFile(fileId);
    return this.normalizeBulkFileResult(result);
  }

  async bulkDomainSearchDeleteFile(fileId: string): Promise<BulkFileDeleteResponse> {
    const result = await this.sdk.deleteDomainSearchFile(fileId);
    return result as BulkFileDeleteResponse;
  }

  async sendListEvaluatorFile(
    fileContent: string | Blob,
    fileName: string,
    emailAddressColumn: number
  ): Promise<BulkFileSendResponse> {
    const blob = this.toCsvBlob(fileContent);
    const result = this.requireSdkResult(
      await this.sdk.sendListEvaluatorFileStream(blob, fileName, {
        email_address_column: this.toSdkColumnIndex(emailAddressColumn),
      }),
      'list evaluator send file'
    );
    return result as BulkFileSendResponse;
  }

  async getListEvaluatorResult(fileId: string): Promise<Record<string, unknown>> {
    const result = await this.sdk.getListEvaluatorResult(fileId);
    return result as Record<string, unknown>;
  }

  /**
   * Submit a finished list evaluation for validation (POST /v2/send-evaluated-file/).
   *
   * This takes the List Evaluator's `file_id` as a form field. It is not a file
   * upload, whatever the public docs say: an upload comes back as
   * "file_id: This field is required".
   */
  async sendEvaluatedFile(fileId: string): Promise<BulkFileSendResponse> {
    const result = this.requireSdkResult(
      await this.sdk.sendEvaluatedFile(fileId),
      'send evaluated file'
    );
    return result as BulkFileSendResponse;
  }

  async addFilter(rule: string, target: string, value: string): Promise<unknown> {
    return this.requireSdkResult(await this.sdk.addFilter({ rule, target, value }), 'add filter');
  }

  async listFilters(usePost = false): Promise<unknown> {
    return this.requireSdkResult(
      await this.sdk.listFilters(usePost ? { method: 'POST' } : null),
      'list filters'
    );
  }

  async deleteFilter(rule: string, target: string, value: string): Promise<unknown> {
    return this.requireSdkResult(
      await this.sdk.deleteFilter({ rule, target, value }),
      'delete filter'
    );
  }

  async listS3Files(options?: {
    bucket?: string;
    search?: string;
  }): Promise<unknown> {
    return this.requireSdkResult(
      await this.sdk.listS3files({
        bucket: options?.bucket ?? null,
        search: options?.search ?? null,
      }),
      'list S3 files'
    );
  }

  /**
   * One of the eight S3 / SFTP file jobs on the bulkapi root.
   *
   * `return_url` is sent on every call: the live API refuses a job without one
   * ("Provided return URL is not permitted: None"), although the docs mark it
   * optional. `file_name` is likewise required for all eight, SFTP included.
   */
  private async bulkRootFileJob(
    sdkMethod: string,
    context: string,
    request: BulkRootFileJobRequest,
    path?: string
  ): Promise<BulkRootJobResponse> {
    const fields: Record<string, unknown> = {
      file_name: request.fileName,
      has_header_row: request.hasHeaderRow,
      return_url: request.returnUrl,
    };
    if (request.removeDuplicates != null) {
      fields.remove_duplicates = request.removeDuplicates;
    }
    const result = this.requireSdkResult(
      path ? await this.sdk[sdkMethod](path, fields) : await this.sdk[sdkMethod](fields),
      context
    );
    return result as BulkRootJobResponse;
  }

  async validateS3File(request: BulkRootFileJobRequest): Promise<BulkRootJobResponse> {
    return this.bulkRootFileJob('validateS3file', 'validate S3 file', request);
  }

  /**
   * scoreS3file is the one job the SDK's public method cannot send correctly.
   * In @zerobounce/zero-bounce-sdk 3.0.0 it kept an older signature that has no
   * `return_url` parameter at all, so the field is dropped and the API answers
   * "Provided return URL is not permitted: None". The other seven jobs already
   * go through the SDK's own `_bulkRootFileJob`, which sends all four
   * documented fields, so this calls that helper directly for this one path.
   *
   * `_bulkRootFileJob` is listed in the tool's `sdkMethods`, so the tool hides
   * itself rather than breaking if a future SDK drops it. Once the SDK routes
   * scoreS3file through the shared helper, this can go back to the public
   * method like its siblings.
   */
  async scoreS3File(request: BulkRootFileJobRequest): Promise<BulkRootJobResponse> {
    return this.bulkRootFileJob('_bulkRootFileJob', 'score S3 file', request, '/scoreS3file');
  }

  async emailFinderS3File(request: BulkRootFileJobRequest): Promise<BulkRootJobResponse> {
    return this.bulkRootFileJob('emailFinderS3file', 'email finder S3 file', request);
  }

  async domainSearchS3File(request: BulkRootFileJobRequest): Promise<BulkRootJobResponse> {
    return this.bulkRootFileJob('domainSearchS3file', 'domain search S3 file', request);
  }

  async validateSftpFile(request: BulkRootFileJobRequest): Promise<BulkRootJobResponse> {
    return this.bulkRootFileJob('validateSFTPfile', 'validate SFTP file', request);
  }

  async scoreSftpFile(request: BulkRootFileJobRequest): Promise<BulkRootJobResponse> {
    return this.bulkRootFileJob('scoreSFTPfile', 'score SFTP file', request);
  }

  async emailFinderSftpFile(request: BulkRootFileJobRequest): Promise<BulkRootJobResponse> {
    return this.bulkRootFileJob('emailFinderSFTPfile', 'email finder SFTP file', request);
  }

  async domainSearchSftpFile(request: BulkRootFileJobRequest): Promise<BulkRootJobResponse> {
    return this.bulkRootFileJob('domainSearchSFTPfile', 'domain search SFTP file', request);
  }

  /**
   * Without an export bucket the API uses the one configured on the account.
   *
   * The SDK's public `exportS3file` refuses to send the request at all without
   * an `export_bucket` ("export_bucket parameter is missing"), a requirement the
   * API itself does not impose, so this posts the documented fields through the
   * SDK's own form-post helper instead. That keeps the SDK's base URL, HTTPS
   * enforcement, key redaction and error handling; only the surplus check is
   * skipped. `_sendBulkRootFormPost` is gated in the tool's `sdkMethods`.
   */
  async exportS3File(fileId: string, exportBucket?: string): Promise<BulkRootJobResponse> {
    const result = this.requireSdkResult(
      await this.sdk._sendBulkRootFormPost('/exportS3file', {
        file_id: fileId,
        ...(exportBucket != null ? { export_bucket: exportBucket } : {}),
      }),
      'export S3 file'
    );
    return result as BulkRootJobResponse;
  }

  /** Without an export path the API uses the one configured on the account. */
  async exportSftpFile(fileId: string, exportPath?: string): Promise<BulkRootJobResponse> {
    const result = this.requireSdkResult(
      await this.sdk.exportSFTPfile({
        file_id: fileId,
        ...(exportPath != null ? { export_path: exportPath } : {}),
      }),
      'export SFTP file'
    );
    return result as BulkRootJobResponse;
  }

  // ========== Inbox Placement Tester Operations ==========
  //
  // This API authenticates with `Authorization: Bearer`; the key never goes on the
  // query string. The SDK builds the requests, so the key stays out of URLs here too.

  /** Seed providers available for new tests. GET /api/ipt/providers */
  async getInboxPlacementProviders(): Promise<unknown> {
    return this.requireSdkResult(
      await this.sdk.getInboxPlacementProviders(),
      'inbox placement providers'
    );
  }

  /** Supported test types and the default one. GET /api/ipt/test-types */
  async getInboxPlacementTestTypes(): Promise<unknown> {
    return this.requireSdkResult(
      await this.sdk.getInboxPlacementTestTypes(),
      'inbox placement test types'
    );
  }

  /** Create an inbox placement test. POST /api/ipt/test */
  async createInboxPlacementTest(options: CreateInboxPlacementTestOptions): Promise<unknown> {
    return this.requireSdkResult(
      await this.sdk.createInboxPlacementTest(options),
      'create inbox placement test'
    );
  }

  /** A test and its placement results. GET /api/ipt/test/{id} */
  async getInboxPlacementTest(testId: string): Promise<unknown> {
    return this.requireSdkResult(
      await this.sdk.getInboxPlacementTest(testId),
      'inbox placement test'
    );
  }

  /** List tests, newest first. GET /api/ipt/tests */
  async listInboxPlacementTests(options: ListInboxPlacementTestsOptions): Promise<unknown> {
    return this.requireSdkResult(
      await this.sdk.listInboxPlacementTests(options),
      'list inbox placement tests'
    );
  }

  /** Delete a finished test. DELETE /api/ipt/test/{id}, which answers with no body. */
  async deleteInboxPlacementTest(testId: string): Promise<InboxPlacementDeleteResponse> {
    try {
      const result = await this.sdk.deleteInboxPlacementTest(testId);
      if (result == null) {
        return { success: true, message: `Inbox placement test ${testId} deleted` };
      }
      return result as InboxPlacementDeleteResponse;
    } catch (error) {
      if (isEmptySuccessBody(error)) {
        return { success: true, message: `Inbox placement test ${testId} deleted` };
      }
      throw error;
    }
  }

  /** The webhook URL saved on this API key. GET /api/ipt/webhook */
  async getInboxPlacementWebhook(): Promise<unknown> {
    return this.requireSdkResult(
      await this.sdk.getInboxPlacementWebhook(),
      'inbox placement webhook'
    );
  }

  /** Save the URL finished results are posted to. PUT /api/ipt/webhook */
  async setInboxPlacementWebhook(webhookUrl: string): Promise<unknown> {
    return this.requireSdkResult(
      await this.sdk.setInboxPlacementWebhook(webhookUrl),
      'set inbox placement webhook'
    );
  }

  /** @deprecated Use sendListEvaluatorFile */
  async evaluateList(
    fileContent: string | Blob,
    fileName: string,
    emailAddressColumn?: number
  ): Promise<ListEvaluatorResult> {
    await this.sendListEvaluatorFile(fileContent, fileName, emailAddressColumn ?? 0);
    throw new Error(
      'List evaluator is asynchronous; use get_list_evaluator_result with the returned file_id.'
    );
  }
}

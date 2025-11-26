/**
 * ZeroBounce API Client
 * Handles communication with ZeroBounce API endpoints
 */

import ZeroBounceSDK from '@zerobounce/zero-bounce-sdk';

export interface ZeroBounceConfig {
  apiKey: string;
  baseUrl?: string;
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
  file_id: string;
  file_name: string;
  file_status: string;
  file_contents?: string;
  download_url?: string;
}

export interface BulkFileDeleteResponse {
  success: boolean;
  message?: string;
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
  first_name: string;
  last_name: string;
  country: string;
  region: string;
  city: string;
  zipcode: string;
  processed_at: string;
}

// Domain Search interfaces
export interface DomainSearchRequest {
  domain: string;
  first_name?: string;
  last_name?: string;
  company?: string;
}

export interface DomainSearchResult {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  country: string;
  region: string;
  city: string;
  zipcode: string;
  processed_at: string;
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

export class ZeroBounceClient {
  private apiKey: string;
  private baseUrl: string;
  // Use official ZeroBounce SDK for core endpoints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sdk: any;

  constructor(config: ZeroBounceConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.zerobounce.net/v2';

    // Initialize official SDK
    this.sdk = new (ZeroBounceSDK as any)();
    this.sdk.init(this.apiKey);
  }

  /**
   * Validate a single email address
   */
  async validateEmail(email: string, ipAddress?: string): Promise<EmailValidationResult> {
    const result = await this.sdk.validateEmail(email, ipAddress ?? null);
    return result as EmailValidationResult;
  }

  /**
   * Validate multiple email addresses in batch
   * Note: ZeroBounce batch API typically requires file upload, but this implementation
   * uses the real-time batch API on the bulk endpoint
   */
  async validateBatch(
    emails: string[],
    _emailAddressColumn?: number
  ): Promise<BatchValidationResult> {
    // Build the email_batch payload as an array of objects:
    // [{ email_address: "valid@example.com" }, ...]
    const emailBatch = emails.map((email) => ({
      email_address: email,
    }));

    const result = await this.sdk.validateBatch(emailBatch);
    return result as BatchValidationResult;
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
    // Use official SDK bulk sendFile. Provide a proper File with name and CSV type
    const file =
      fileContent instanceof Blob
        ? new File([fileContent], fileName, { type: 'text/csv' })
        : new File([fileContent], fileName, { type: 'text/csv' });

    const result = await this.sdk.sendFile({
      file,
      // ZeroBounce docs are 1-based; default to 1 for first column when not provided
      email_address_column: emailAddressColumn !== undefined ? emailAddressColumn : 1,
      return_url: returnUrl || false,
    });

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
    return result as BulkFileGetResponse;
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
    const file =
      fileContent instanceof Blob
        ? new File([fileContent], fileName, { type: 'text/csv' })
        : new File([fileContent], fileName, { type: 'text/csv' });

    const result = await this.sdk.sendScoringFile({
      file,
      email_address_column: emailAddressColumn !== undefined ? emailAddressColumn : 1,
      return_url: returnUrl || false,
    });

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
    return result as BulkFileGetResponse;
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
    // Use deprecated guessFormat helper in the published SDK for compatibility
    if (!request.domain) {
      throw new Error('The published ZeroBounce SDK requires "domain" for email finder.');
    }

    const result = await this.sdk.guessFormat({
      domain: request.domain,
      first_name: request.first_name ?? null,
      middle_name: request.middle_name ?? null,
      last_name: request.last_name ?? null,
    });

    return result as FindEmailResult;
  }

  // ========== Domain Search Operations ==========

  /**
   * Search for emails in a domain
   */
  async domainSearch(request: DomainSearchRequest): Promise<DomainSearchResult[]> {
    // Use deprecated guessFormat helper as a stand-in for domain search
    const result = await this.sdk.guessFormat({
      domain: request.domain,
      first_name: request.first_name ?? null,
      middle_name: null,
      last_name: request.last_name ?? null,
    });

    return result as DomainSearchResult[];
  }

  // ========== Activity Data Operations ==========

  /**
   * Get activity data for an email address
   */
  async getActivityData(email: string): Promise<ActivityDataResult> {
    const result = await this.sdk.getEmailActivity(email);
    return result as ActivityDataResult;
  }

  // ========== List Evaluator Operations ==========

  /**
   * Evaluate the quality of an email list
   * Requires file upload (multipart/form-data) with CSV file containing emails
   */
  async evaluateList(
    fileContent: string | Blob,
    fileName: string,
    emailAddressColumn?: number
  ): Promise<ListEvaluatorResult> {
    throw new Error(
      'List Evaluator is not available via the official ZeroBounce Node SDK.'
    );
  }
}

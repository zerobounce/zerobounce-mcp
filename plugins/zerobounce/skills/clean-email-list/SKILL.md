---
name: clean-email-list
description: Use when the user wants to clean, validate, score, or evaluate a CSV or large email list with ZeroBounce bulk file tools, List Evaluator, or S3/SFTP jobs.
---

# Clean an email list

Use the `zerobounce` MCP server (`https://mcp.zerobounce.net/mcp`).

1. Call `get_credits` before a job that spends credits.
2. More than about 100 addresses: upload with `send_file` (validation) or `scoring_send_file` (AI score), poll `file_status` or `scoring_file_status`, then download with `get_file` or `scoring_get_file`.
3. A free quality estimate first: `send_list_evaluator_file`, then `get_list_evaluator_result`. Validating that result is `send_evaluated_file` and spends credits.
4. Files already in storage: `validate_s3file`, `score_s3file`, `email_finder_s3file`, `domain_search_s3file`, and the `*_sftpfile` tools. Those run on production `mcp.zerobounce.net` only.
5. Confirm before `delete_file`, `scoring_delete_file`, and other delete tools.
6. Do not paste a large list into the chat when a file upload will do.

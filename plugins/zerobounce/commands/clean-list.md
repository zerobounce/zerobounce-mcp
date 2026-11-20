---
name: clean-list
description: Validate or score an email list file with ZeroBounce bulk tools.
---

# Clean a list

1. Call `get_credits`.
2. If the user has a CSV or TXT file, upload it with `send_file` (validation) or `scoring_send_file` (AI score).
3. Poll status, then download the result file.
4. Summarize keep, review, and remove. Confirm before deleting the uploaded file.

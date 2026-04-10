# Review Criteria

What to check for `/review`.

## What to Review

1. **Bugs** — logic errors, off-by-one, null handling, type mismatches
2. **Edge cases** — empty arrays, null values, missing data
3. **Security** — SQL injection, XSS, mass assignment, token exposure, CSRF, unauthorized access
4. **API contracts** — does the response match what the caller expects?
5. **Database** — missing indexes, N+1 queries, missing cascade deletes
6. **Race conditions** — concurrent requests, duplicate submissions
7. **Error handling** — failures handled gracefully

Prioritize **critical > major > minor**. Every finding must explain impact. Find nothing? Say so — don't invent issues.

## Saved File

Structure findings using `.aicontext/templates/code-review.template.md` (single source of truth for the saved file shape). Number findings sequentially across severities so triage can reference them (e.g. "fix #1, skip #3"). If no issues found, save the file with `## Result: APPROVED` and omit the Findings section.

The agent's chat response format lives in `reviewer.md` — don't quote the template back in chat.

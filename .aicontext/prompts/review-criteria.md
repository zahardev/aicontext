# Review Criteria

Review implementation for correctness — bugs, edge cases, security, and logical errors. Architecture and design are handled by `/deep-review`, not this review.

## What to Review

1. **Bugs** — Logic errors, off-by-one, null handling, type mismatches
2. **Edge cases** — Empty arrays, null values, unauthorized access, missing data
3. **Security** — SQL injection, XSS, mass assignment, token exposure, CSRF
4. **API contracts** — Does the response match what the frontend expects?
5. **Database** — Missing indexes, N+1 queries, missing cascade deletes
6. **Race conditions** — Concurrent requests, duplicate submissions
7. **Error handling** — Are errors handled gracefully?

## Rules

- Focus on **correctness and bugs**, not style
- Every finding must include a clear explanation of the impact
- Prioritize findings: Critical > Major > Minor
- If you find nothing significant, say so — don't invent issues

## Output

Present numbered findings grouped by severity:

```
### Critical
#### 1. [title]
- File: path/to/file:L42
- Impact: [what could go wrong]
- Fix: [suggested fix]

### Major
#### 2. [title]
...

### Minor
#### 3. [title]
...

### Positive
- [anything well-implemented worth noting]
```

Number findings sequentially across all severity groups so they can be referenced in triage (e.g., "fix #1, skip #3").

If no issues found: `## Result: APPROVED`

# Code Review: {title}

Date: {date}
Scope: {scope description, e.g., "uncommitted changes", "branch vs main", "full codebase"}

<!-- If no issues found, replace Summary/Findings/Positive with: `## Result: APPROVED` -->

## Summary

| # | Severity | Recommendation | Action | File:Line | Finding |
|---|----------|----------------|--------|-----------|---------|
| 1 | critical | fix | fix | `file:42` | {short description} |
| 2 | major | fix | skip | `file:88` | {short description} |
| 3 | minor | skip | — | `file:120` | {short description} |

## Refactoring Actions

<!-- For deep reviews: grouped findings ordered by leverage. Delete this section for regular reviews. -->

### Action 1: {action title}
Leverage: High — resolves findings #N, #N
{1-2 sentence description}
- [ ] Specific change A
- [ ] Specific change B

## Findings

### 1. {finding title}
- **File:** `{file}:{line}`
- {description}
- **Fix:** {suggested fix}
- **Action:** {fix | skip} — {reason if skip}
- [ ] {checkbox for tracking}

<!-- Repeat for each finding -->

## Positive
<!-- What's done well — keep brief, 2-4 bullet points -->

## Decisions
<!-- Record what was fixed, skipped, and why. Updated during review conversation. -->

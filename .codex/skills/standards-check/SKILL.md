---
name: standards-check
description: Use when the user wants changed files checked against the project's coding standards for DRY, KISS, security, and convention violations.
---

# Standards Check

Review branch changes against project coding standards.

## Scope

All changed files on the current branch vs main, including uncommitted changes.

## Workflow

1. Read `.aicontext/rules/standards.md` and `.aicontext/rules/process.md` to understand the rules.
2. Run `git diff main...HEAD --name-only` and `git diff --name-only` to find changed files.
3. Inspect each changed file against the standards:
   - **DRY** — repeated code that should be extracted (3+ occurrences)
   - **KISS** — functions over 30-40 lines, more than 3 levels of nesting, more than 3 parameters
   - **Over-engineering** — unnecessary abstractions, error handling for impossible scenarios
   - **Security** — command injection, XSS, SQL injection, OWASP top 10
   - **Project conventions** — does the code follow patterns established in existing codebase
4. Filter out false positives and style-only issues.
5. Present validated findings with file and line references, the issue, and a fix recommendation.

If no violations found, say so plainly.

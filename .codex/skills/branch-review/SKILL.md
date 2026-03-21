---
name: branch-review
description: Use when the user wants a review of the full branch diff against main, including uncommitted changes, with findings focused on bugs, regressions, risky assumptions, and missing tests.
---

# Branch Review

Review the full branch against `main`, including both committed and uncommitted changes.

## Scope

- Include changes from `main...HEAD`
- Include current unstaged and staged changes
- Prioritize bugs, regressions, security issues, compatibility problems, and missing coverage

## Workflow

1. Read the active task file in `.aicontext/tasks/` when available so the intended behavior is clear.
2. Gather changed files from both `git diff main...HEAD --name-only` and `git diff --name-only`.
3. Inspect the relevant diffs and surrounding source context before judging a finding.
4. If the user explicitly asks for delegation, spawn an `explorer` subagent to help inspect the changed surface area. Otherwise review locally.
5. Present findings ordered by severity with file and line references.
6. If no findings are discovered, say so explicitly and mention any remaining testing or review gaps.
7. Save the review to `.aicontext/data/code-reviews/` when the user asks to persist it, or when the surrounding workflow clearly expects a saved artifact.

## Output

Lead with findings, not summary.

For each finding, include:

- File and line reference
- Severity
- Why it is a real risk
- What should be changed or verified

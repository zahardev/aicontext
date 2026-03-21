---
name: diff-review
description: Use when the user wants a review of uncommitted changes only, with emphasis on bugs, regressions, behavior changes, and missing tests.
---

# Diff Review

Review the current uncommitted changes only.

## Scope

- Include unstaged changes from `git diff`
- Include staged changes from `git diff --cached`
- Do not review unrelated committed branch history unless it is needed for context

## Workflow

1. Read the active task file in `.aicontext/tasks/` when available.
2. Gather the current diff and list of changed files from staged and unstaged changes.
3. Read enough surrounding code to validate whether each suspected issue is real.
4. If the user explicitly asks for delegation, spawn an `explorer` subagent to inspect part of the changed surface area. Otherwise review locally.
5. Report findings ordered by severity with file and line references.
6. If no findings are discovered, say so explicitly and call out any residual risk or testing gaps.
7. Save the review to `.aicontext/data/code-reviews/` when the user asks to persist it, or when the workflow clearly expects a saved artifact.

## Output

Lead with findings.

For each finding, include:

- File and line reference
- Severity
- Why it matters
- Suggested fix or verification step

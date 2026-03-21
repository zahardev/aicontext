---
name: pr-review-check
description: Use when the user wants unresolved pull request review comments fetched, analyzed against the code, categorized by validity, and optionally prepared for resolution.
---

# PR Review Check

Check unresolved review comments on the current pull request.

## Fetch Reviews

Run:

```bash
node .aicontext/scripts/pr-reviews.js
```

This writes a structured markdown file to `.aicontext/data/github-pr-reviews/pr-{number}-{iteration}.md`.

If the command fails because no PR exists, `gh` is unavailable, authentication is missing, or network access is blocked, report that clearly and stop.

## Analyze

1. Read the generated review file.
2. For each finding, inspect the actual code and decide whether the comment is valid.
3. Classify findings as:
   - Valid
   - False positive
   - Low priority

Reference each finding by its table number.

## Fill Actions

After user confirmation, update the Action column in the review file:

- `resolve` for false positives or bot noise that should be dismissed
- `fix` for issues that should be addressed in code
- `skip` only when waiting on a human reviewer response

Do not use `skip` for automated code review bot comments unless there is a very specific reason.

## Resolve

If there are entries marked `resolve`, ask the user whether to run:

```bash
node .aicontext/scripts/pr-resolve.js <path-to-review-file>
```

That command resolves all review threads marked `resolve`.

---
name: review
description: Review code changes for bugs, security, edge cases. Scope with args — diff (default), branch, commit, path, or IDE selection. Delegates to reviewer agent for large scope.
disable-model-invocation: true
---

## Determine scope

Follow `.aicontext/prompts/review-scope.md` to determine scope and count changed lines.

## Run review

- **Small scope (~200 changed lines or fewer, or IDE selection):** follow `.aicontext/prompts/review.md` directly
- **Large scope (more than ~200 changed lines):** launch `reviewer` agent with the prompt path `.aicontext/prompts/review.md` and the scope description

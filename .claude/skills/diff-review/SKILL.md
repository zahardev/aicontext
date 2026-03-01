---
name: diff-review
description: Review uncommitted changes by delegating to the reviewer agent
disable-model-invocation: true
---

# Diff Review

Delegate a code review to the `reviewer` agent.

**Scope:** uncommitted changes only (staged + unstaged).

## Steps

1. Read the current task file in `.aicontext/tasks/` to understand requirements
2. Run `git diff` and `git diff --cached` to identify changed files
3. Launch the `reviewer` agent, passing the list of changed files and task requirements as context
4. Present the reviewer's findings to the user
5. Save the review results to `.aicontext/data/code-reviews/`

---
name: branch-review
description: Review full branch diff against main by delegating to the reviewer agent
disable-model-invocation: true
---

# Branch Review

Delegate a code review to the `reviewer` agent.

**Scope:** full branch diff against main, including uncommitted changes.

## Steps

1. Read the current task file in `.aicontext/tasks/` to understand requirements
2. Run `git diff main...HEAD --name-only` and `git diff --name-only` to identify all changed files on this branch
3. Launch the `reviewer` agent, passing the list of changed files and task requirements as context
4. Present the reviewer's findings to the user
5. Save the review results to `.aicontext/data/code-reviews/`

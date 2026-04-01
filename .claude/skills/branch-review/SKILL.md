---
name: branch-review
description: Review full branch diff against main by delegating to the reviewer agent
disable-model-invocation: true
---

Read `.aicontext/prompts/branch-review.md` for review scope.

Delegate the review to the `reviewer` agent, passing the list of changed files and task requirements as context.

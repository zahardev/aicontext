---
name: standards-check
description: Check branch changes against project coding standards by delegating to the standards-checker agent
disable-model-invocation: true
---

# Standards Check

Delegate a standards compliance check to the `standards-checker` agent.

**Scope:** all changed files on the current branch vs main, including uncommitted changes.

## Steps

1. Launch the `standards-checker` agent — it will read `.aicontext/rules/standards.md`, run git commands to find changed files, and check them
2. Review the checker's findings — filter out false positives and assess severity
3. Present validated findings to the user with fix recommendations

---
name: standards-check
description: Check branch changes against project coding standards by delegating to the standards-checker agent
disable-model-invocation: true
---

Read `.aicontext/prompts/standards-check.md` for check criteria.

Delegate the check to the `standards-checker` agent. Review the checker's findings — filter out false positives and assess severity. Present validated findings to the user with fix recommendations.

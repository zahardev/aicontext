---
name: gh-fix-tests
description: Use when CI checks are failing on the current PR. Fetches the failures via gh CLI, diagnoses them, fixes, pushes, and waits for green. Covers lint, type, build, and tests. Retries up to 3 times.
---

Read and follow `.aicontext/prompts/gh-fix-tests.md`

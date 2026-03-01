---
name: draft-pr
description: Draft a pull request title and body based on the current task file and git changes
disable-model-invocation: true
---

Draft a pull request for the current branch.

## 1. Gather Context

- Read the current task file in `.aicontext/tasks/`
- Run `git log main...HEAD --oneline` to see commits on this branch
- Run `git diff main...HEAD --stat` to see files changed

## 2. Draft the PR

**Title** — one line, under 70 characters, imperative mood (e.g. "Add user authentication")

**Body** — use this structure:

```
## Summary
- <bullet points describing what changed and why>

## Test plan
- <checklist of what to verify manually or via tests>
```

Keep it factual — describe what changed, not how.

## 3. Save

Save the draft to `.aicontext/data/pr-drafts/` using the branch name as the filename (e.g. `feature-auth.md`).

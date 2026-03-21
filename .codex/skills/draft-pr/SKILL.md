---
name: draft-pr
description: Use when the user wants a pull request title and body drafted from the active task and the branch's git changes.
---

# Draft PR

Draft a pull request for the current branch.

## Gather Context

1. Read the current task file in `.aicontext/tasks/` when available.
2. Inspect branch commits with `git log main...HEAD --oneline`.
3. Inspect the branch diff summary with `git diff main...HEAD --stat`.

## Draft

Create:

- A title in imperative mood, under 70 characters
- A body using this structure

```md
## Summary
- <what changed and why>

## Test plan
- <what was tested or should be verified>
```

Keep the draft factual and user-facing. Describe what changed and why, not the full implementation internals.

## Save

Save the draft to `.aicontext/data/pr-drafts/` using the branch name as the filename when the user wants the draft persisted.

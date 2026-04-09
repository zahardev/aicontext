# Draft PR

Draft a pull request for the current branch.

## 1. Gather Context

- Follow `ensure-config.md` to read project settings
- Read the current task file in `.aicontext/tasks/`
- Use `project.base_branch` from the config (default: `main`) for diff commands:
  - Run `git log {base_branch}...HEAD --oneline` to see commits on this branch
  - Run `git diff {base_branch}...HEAD --stat` to see files changed

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

**Do not output the PR body in chat.** Just save the file and tell the user the filename. Only show the full content in chat if the user explicitly asks to see it.

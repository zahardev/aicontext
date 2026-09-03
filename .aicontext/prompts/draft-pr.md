# Draft PR

Draft a pull request for the current branch and save it locally. Never pushes, never creates a GitHub PR — `/make-pr` does that.

## 1. Gather Context

- Follow `ensure-config.md` to read project settings
- Read the current task file in `.aicontext/tasks/`
- Run `git status` to verify the current branch and tracking state
- Use `project.base_branch` from the config (default: `main`) for diff commands:
  - Run `git log {base_branch}..HEAD --oneline` to see commits on this branch
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

Write for testers: use concise, plain language and focus on the behavior to verify. Include implementation details only when they affect testing.

## 3. Save

Sanitize the branch name into a safe filename (replace `/` and other path-unsafe chars with `-`, e.g. `feature/auth` → `feature-auth.md`), then save the title and body to `.aicontext/data/pr-drafts/{branch}.md` with the title as an `# ` heading. Overwrite an existing draft for the same branch.

Tell the user the filename — do not output the PR body in chat unless asked. Then append: `Run /make-pr to push and create the PR on GitHub.`

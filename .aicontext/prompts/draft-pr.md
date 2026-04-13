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

## 3. Save and Create

Follow `ensure-config.md` to read `pr.save_to_file` and `pr.create_in_github` from config.

### Local file

If `pr.save_to_file` is `true`: save the draft to `.aicontext/data/pr-drafts/` using the branch name as the filename (e.g. `feature-auth.md`). Tell the user the filename — do not output the PR body in chat unless asked.

If `false`: skip file creation.

### GitHub PR

If `pr.create_in_github` is `true`: write the body to a temp file, run `gh pr create --base "{base_branch}" --title "{title}" --body-file {tmp_file}`, show the URL if successful, and always delete the temp file afterward.

If `ask`: prompt the user:

> Create this PR on GitHub?
> 1. Yes
> 2. No

If yes:
1. Create the PR via `gh pr create --base "{base_branch}" --title "{title}" --body-file {tmp_file}`, show the URL if successful, and always delete the temp file afterward
2. Ask: "Save this as default? (y/N)" — if y, set `pr.create_in_github: true` in `config.yml`
3. If saved as true, follow up: "Still want to save draft files locally? (Y/n)" — if n, set `pr.save_to_file: false` in `config.yml`

If `false`: **do not** create a GitHub PR. Do not offer, do not suggest, do not run `gh pr create`.

### After GitHub creation

When a PR is created, note the PR URL and number (e.g. `#42`) in your reply. Downstream prompts like `finish-task.md` and `gh-review-fix-loop.md` use `gh pr view` to detect the PR.

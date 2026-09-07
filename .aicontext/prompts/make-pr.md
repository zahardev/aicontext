# Make PR

Push the current branch and create or update its GitHub pull request.

## 1. Load Settings

- Follow `ensure-config.md`; get `project.base_branch` (default: `main`)
- Run `git status` for the current branch and tracking state. If HEAD is detached, stop and ask the user

## 2. Load or Generate a Draft

Build the current branch's draft filename using the same rule as `/draft-pr`: replace path-unsafe characters with `-`, then append the first 12 characters of the branch name's SHA-256 hash.

If the draft file exists, read its `# ` heading as the title and the remaining content as the body. If it predates the latest branch commit, ask whether to reuse or regenerate it.

If no draft exists or the user chooses regeneration, read the current task file. Resolve `project.base_branch` into `base_branch`, then run `git log "${base_branch}..HEAD" --oneline` and `git diff "${base_branch}...HEAD" --stat`.

Write a generated title under 70 characters in imperative mood.

Use this body:

```
## Summary
- <what changed and why>

## Test plan
- [ ] <behavior to verify>
```

Write for testers: use concise, plain language and focus on the behavior to verify. Include implementation details only when they affect testing.

## 3. Push

Resolve the current branch into a shell variable, then run `git push -u origin "$branch"` before checking for a PR so it includes every local commit. This required push is pre-authorized, regardless of `after_task.push`.

## 4. Create or Update

Resolve the title, base branch, and temp-file path into shell variables. Write the body to the temp file, then run `gh pr view --json number,url 2>/dev/null`.

If a PR exists, run `gh pr edit --title "$title" --body-file "$tmp_file"`, then report its URL and number. Otherwise run `gh pr create --base "$base_branch" --title "$title" --body-file "$tmp_file"`. Always delete the temp file.

Report the PR URL and number (e.g. `#42`); `finish-task.md` and `gh-review-fix-loop.md` find it through `gh pr view`.

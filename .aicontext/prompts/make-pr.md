# Make PR

Push the current branch and create or update its GitHub pull request.

## 1. Load Settings

- Follow `ensure-config.md`; get `project.base_branch` (default: `main`)
- Run `git status` for the current branch and tracking state. If HEAD is detached, stop and ask the user

## 2. Push

Run `git push -u origin {branch}` before checking for a PR so it includes every local commit. This required push is pre-authorized, regardless of `after_task.push`.

## 3. Existing PR

Run `gh pr view --json number,url 2>/dev/null`. If a PR exists, report its URL and stop; the push updated it.

## 4. Draft the PR

Read the current task file, then run `git log {base_branch}..HEAD --oneline` and `git diff {base_branch}...HEAD --stat`.

Write a title under 70 characters in imperative mood.

Use this body:

```
## Summary
- <what changed and why>

## Test plan
- [ ] <behavior to verify>
```

Write for testers: use concise, plain language and focus on the behavior to verify. Include implementation details only when they affect testing.

## 5. Create

Write the body to a temp file. Run `gh pr create --base "{base_branch}" --title "{title}" --body-file {tmp_file}`, then always delete the temp file.

Report the PR URL and number (e.g. `#42`); `finish-task.md` and `gh-review-fix-loop.md` find it through `gh pr view`.

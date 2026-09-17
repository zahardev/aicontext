# Make PR

## 1. Load Settings

Explicit invocation authorizes the PR regardless of `after_task.pr`.

Inspect the Git remote URL before any `gh` command or push. GitHub only: other or unknown hosts stop with a limitation report. Verify the intended repository, head remote/branch, and base branch; do not guess a fork's push target.

- Follow `ensure-config.md` with `project.base_branch` (default: `main`)
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

Resolve the current branch and verified push remote into shell variables, then run `git push -u "$remote" "$branch"` before checking for a PR so it includes every local commit. This required push is pre-authorized, regardless of `after_task.push`.

## 4. Create or Update

Resolve the title, repository, head owner/branch, base branch, and temp-file path into shell variables. Write the body to the temp file. Query `gh pr list --repo "$repo" --state open --head "$branch" --base "$base_branch" --json number,url,headRepositoryOwner`; match the verified head owner too. API/auth errors stop; a successful empty result means no matching open PR. Multiple matches require user selection.

If exactly one PR matches, run `gh pr edit "$pr" --repo "$repo" --title "$title" --body-file "$tmp_file"`; if none match, run `gh pr create --repo "$repo" --head "$head" --base "$base_branch" --title "$title" --body-file "$tmp_file"`, where `head` identifies the verified owner/branch. Always delete the temp file, including on failure.

Re-fetch the resulting PR and confirm its repository, head, and base before reporting success.

Return the PR URL, number, repository, and head to the caller; automatic `gh-resolve-pr` uses this exact target. Failed push/create/update returns a blocker.

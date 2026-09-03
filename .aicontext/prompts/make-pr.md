# Make PR

Create a GitHub pull request for the current branch, pushing it first.

## 1. Gather Context

- Follow `ensure-config.md` to read project settings — `project.base_branch` (default: `main`)
- Run `git status` to get the current branch and tracking state. If HEAD is detached, stop and ask the user

## 2. Push

Run `git push -u origin {branch}` — a no-op when the remote is already current. This push is pre-authorized as this workflow's prerequisite, independent of `after_task.push`.

Push before anything else so the PR, new or existing, contains every local commit.

## 3. Existing PR

Run `gh pr view --json number,url 2>/dev/null`. If a PR already exists, report its URL — the push above updated it — and stop.

## 4. Resolve the Draft

Look for `.aicontext/data/pr-drafts/{branch}.md` (branch name sanitized as in `draft-pr.md`).

- **No draft** → follow `draft-pr.md` sections 1–3 to write one, then continue
- **Draft older than the branch's last commit** → ask:
  > This draft predates the latest commit.
  > 1. Regenerate it
  > 2. Use it as is

  Regenerate via `draft-pr.md` sections 1–3
- **Draft current** → use it

Date the draft by its last commit (`git log -1 --format=%cI -- {draft-path}`), falling back to file mtime when the draft is untracked — `pr-drafts/` is committed, so mtime alone makes a checked-out stale draft look fresh.

The first `# ` heading is the title; everything after it is the body. Leave the file in place.

## 5. Create

Write the body to a temp file, run `gh pr create --base "{base_branch}" --title "{title}" --body-file {tmp_file}`, and always delete the temp file afterward.

Report the PR URL and number (e.g. `#42`) — `finish-task.md` and `gh-review-fix-loop.md` detect it via `gh pr view`.

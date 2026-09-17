# GH Resolve PR

Fix CI and review findings on an existing PR, then report readiness. Never create or merge a PR, bypass approvals, dismiss reviews, or force-push.

## 1. Identify

- Use an explicit PR URL if given; otherwise resolve from the current branch and remote. GitHub only: report other hosts and stop before any `gh` call.
- Resolve the PR and repository with `gh pr view`; pass both to every helper. Require an open PR. Missing PR, auth/network errors, or an ambiguous target means stop.
- Require the PR head checked out, not detached, with the latest remote head and no unrelated dirty work. Never switch or reset user work.
- Resolve `pr_validation_timeout` via `ensure-config.md`. Wrap each wait in `timeout {value}`; an expired wait is a blocker. Use at most 5 cycles.

## 2. Resolve

1. `gh pr checks "$pr" --repo "$repo" --watch --fail-fast`. No checks at all: go to 3.
2. Checks failed: follow `gh-fix-tests.md` with the PR and repository. After its push, return to 1.
3. Follow `gh-review-fix-loop.md` with the same target. After its push, return to 1.
4. Each helper pass counts toward the cycle limit. No progress, a helper blocker, or an exhausted budget stops the run.

## 3. Readiness

Re-fetch `gh pr view` and `gh pr checks "$pr" --repo "$repo" --required` plus unresolved threads at the latest head. No required checks is a valid result, not a failure.

Ready requires: open, not draft, mergeable without conflicts, required checks passed, no unresolved actionable threads, and no missing or blocking review decision. Report anything else, including pending or unknown states, as a blocker.

Report one of, naming any phase that had nothing to check:
- `PR #{number} ready at {head}: not merged.`
- `PR #{number} blocked: {blockers}.`

Return `READY` or `BLOCKED`; neither closes the task.

# PR Review Loop

Coordinate CI and review fixes for an existing PR. Never create or merge a PR, bypass approvals, dismiss blocking reviews, or force-push. Explicit invocation is independent of `after_task.*`.

## 1. Identify and Bound

- Use an explicit PR URL if provided; otherwise inspect the current branch and Git remote. Support `github.com` initially; unknown/unsupported hosts stop with a short limitation report before any `gh` call.
- Resolve the exact PR and repository with `gh pr view`; retain them for every helper and query. Require an open PR. Missing PR, auth/network errors, or ambiguous repository/branch means stop, not success.
- Load the task/spec/task-context if available. A standalone PR without a task is valid; skip task-dependent context operations.
- Use at most **5 fix cycles** and a **30-minute total deadline**. Pass the remaining budget to helpers. CI/review changes after any push invalidate earlier results.
- Before any fix, verify the checkout belongs to this PR's repository and head branch, is not detached, and contains its latest remote head. Stop for unrelated dirty changes or local/remote divergence; never switch, reset, or overwrite user work automatically.

## 2. Observe

Read `gh pr view "$pr" --repo "$repo" --json state,url,headRefOid,isDraft,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup` and current unresolved review threads.

Poll pending checks every 15 seconds and `mergeable: UNKNOWN` every 10 seconds for up to 1 minute. After PR creation or a new head, allow up to 2 minutes for initial checks/review activity; zero comments is not review completion. Re-fetch after each wait.

- No checks or review activity after the discovery window: silently skip that phase. Do not query provider-specific bot configuration or invent requirements for absent CI/reviewers.
- Failure fetching state/logs, unknown check conclusions, cancelled/timed-out checks, or exhausted waits: report the blocker; never treat it as green.
- Scope observations to the latest head; if it changed, discard stale results and observe again within the same budget.

## 3. Fix Cycle

1. **CI** — if checks failed, follow `gh-fix-tests.md` in coordinator mode with the exact PR/repository and remaining budget.
2. If CI fixes pushed, return to Observe before processing stale review findings.
3. **Reviews** — if actionable unresolved threads exist, follow `gh-review-fix-loop.md` in coordinator mode with the same PR/repository and remaining budget.
4. After any push, return to Observe; after thread-only resolutions, re-fetch reviews and readiness.
5. Count each helper fix pass toward the 5-cycle limit. No progress, a helper blocker, or exhausted budget means stop and report; never restart a helper's standalone retry budget.

## 4. Readiness

Re-fetch the PR and required checks (`gh pr checks "$pr" --repo "$repo" --required`) plus unresolved threads. A legitimate no-required-checks result is not an API/auth failure. Base the result on the latest head, not cached pre-fix state.

Ready requires: open, not draft, conflict-free mergeability, applicable checks passed (explicitly skipped/neutral only where GitHub accepts them), no unresolved actionable review threads, and no missing required approval or blocking review. Pending/unknown checks or mergeability, `CHANGES_REQUESTED`, missing approvals, branch/ruleset blocks, and stale review decisions must be reported. Do not dismiss reviews to make the PR green. Recheck head identity before reporting.

Report one of:
- `PR #{number} ready at {head}: checks and reviews verified; not merged.`
- `PR #{number} blocked: {specific blockers or unavailable verification}.`

No configured CI/review phase is silently omitted from details; it is not claimed as a passed test. Readiness is a snapshot, not a promise that future reviews or checks cannot arrive. Return `READY` or `BLOCKED` to the caller; neither closes the task.

# GitHub Review Fix Loop

Resolve actionable GitHub review threads. Never merge or dismiss a review.

## 1. Context and Budget

- Require an existing open GitHub PR and `.aicontext/scripts/pr-reviews.cjs` / `pr-resolve.cjs`. Verify the provider from the PR URL/remote before `gh`; unsupported/unknown providers stop with a limitation report.
- Use the caller's exact PR/repository or resolve them from the current branch. The scripts infer repository and PR from the checkout: verify their `gh repo view` / `gh pr view` target equals the intended PR before using them. Do not run them against another PR.
- Require the matching, non-detached PR head checkout with latest remote head present and no unrelated dirty work/divergence before fixing. Never switch/reset user work automatically.
- Load task/spec/task-context if available; absence of a task does not block standalone PR use.
- **Standalone:** at most 5 cycles, bounded by `pr_validation_timeout` via `ensure-config.md`; re-triage only when new unresolved threads exist. No progress, exhausted cycles, timeout, or a human decision stops with specific blockers.
- **Coordinator mode:** one triage/fix pass with the caller's remaining budget. No waits or nested retries; return `PUSHED`, `RESOLVED`, `CLEAR`, or `BLOCKED`. The coordinator owns CI and final readiness.

## 2. Triage and Resolve

Run `node .aicontext/scripts/pr-reviews.cjs`. If no unresolved threads, return `CLEAR` (review threads only, not proof of green CI or mergeability).

For each thread:
- **Fix:** actionable issue with a clear code change.
- **Resolve:** false positive, irrelevant, or already addressed; explain why.
- **Skip:** needs human judgment; report as a blocker.

Fill the Reply column for Fix and Resolve entries. Run `node .aicontext/scripts/pr-resolve.cjs "$review_file"` for Resolve actions only; leave Fix rows unresolved until the successful push in Section 3. Inspect reply/resolution results and re-fetch threads; the script can report partial failures with exit code zero. Failures are blockers, not an empty review.

Implement Fix items and verify affected behavior locally. If verification fails or is unavailable, report a blocker. If none require code, do not push. Unresolved Skip items return `BLOCKED`.

## 3. Commit and Push

Follow `.aicontext/prompts/commit.md` for review fixes only. Verify branch/tracking state and push the PR head branch to its verified remote; the active review-fix cycle authorizes this non-force push. Stop on failure.

After a successful push, change verified Fix rows to `resolve` in a fresh batch excluding processed threads, run `node .aicontext/scripts/pr-resolve.cjs "$review_file"`, and re-fetch them. If task context exists, sync new spec decisions/requirements; record supersessions per `process.md "Task-context content boundary"`.

Coordinator mode returns `PUSHED` with the new head and any unresolved blockers.

## 4. Standalone Follow-up

Allow up to 2 minutes for new review activity, polling every 15 seconds; wait for any pending reviewer checks within the remaining total deadline. Re-fetch after every head change. Missing activity after the discovery window means no automatic review to process; do not query bot configuration.

If the latest bot response says reviews are paused, report how to resume and stop.

## 5. Result

Verify review decisions as well as threads: resolved threads do not clear a lingering `CHANGES_REQUESTED`. Report reviewers who need to re-review.

Report resolved/fixed/skipped counts and CI results only when actually verified. This helper does not establish whole-PR readiness; use the active tool's `gh-resolve-pr` handoff for that when invoked standalone. Return results directly in coordinator mode.

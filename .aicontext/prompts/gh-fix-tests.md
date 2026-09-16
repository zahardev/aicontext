# GH Fix Tests

Wait for and fix failing GitHub CI checks (tests, lint, type, build). Never weaken checks to obtain green results. Explicit invocation is independent of lifecycle flags.

## 1. Context and Budget

Use the caller's exact PR/repository, or resolve an explicit PR URL/current branch after verifying the remote is `github.com`. Unsupported/unknown providers, missing PR, or auth errors stop with a report before fixes. A standalone PR without a task is valid.

- **Standalone:** at most 3 fix attempts and 30 minutes total.
- **Coordinator mode:** one fix pass, caller's remaining deadline, no independent retry loop. Return `PUSHED`, `PASS`, `SKIP`, or `BLOCKED`; the coordinator owns subsequent waits and readiness.
- Before fixing, require the PR head branch/repository checked out, a non-detached HEAD, latest remote head present, and no unrelated dirty work or divergence. Stop rather than switching/resetting user work.

## 2. Observe Checks

Read `gh pr checks "$pr" --repo "$repo"` and `gh pr view "$pr" --repo "$repo" --json headRefOid,statusCheckRollup`. Pending is not passed. On a new head, allow up to 2 minutes for initial checks to appear, polling every 15 seconds within the deadline. Standalone mode reports no checks after discovery as `SKIP`; coordinator mode returns silent `SKIP`.

Wait for pending checks within the remaining deadline, then re-fetch state. Require successful retrieval; distinguish no checks from auth/network errors. Cancelled/timed-out/unknown conclusions or an exhausted wait return `BLOCKED`, not success. If the head changes, discard stale results and observe again within the same budget.

All checks passed (or explicitly skipped/neutral where GitHub accepts them) → `PASS`. Otherwise fetch logs for the exact failing check's run with `gh run view "$run_id" --repo "$repo" --log-failed`; if logs or the cause are unavailable, report and stop.

## 3. Diagnose and Fix

Identify the failing rule/test, implicated files, and root cause. Read the relevant code before changing it. Fix causes rather than disabling tests, lint rules, or required checks. If a fix needs a product decision, stop and ask.

For test failures, run the failing tests locally through `test-runner` or inline before pushing. For lint/type/build failures, use CI as the verification source; do not claim an unrun local check passed.

## 4. Commit and Push

Follow `ensure-config.md` with `gh_fix_tests.push`. Follow `.aicontext/prompts/commit.md`, scoped to the fixes.

- `true`: verify branch/tracking state again, then push the PR head branch to its verified remote. Explicit invocation authorizes this configured non-force push; never push to a guessed remote.
- `false`: commit without pushing; return `BLOCKED: fixes committed locally; remote CI not revalidated`. The coordinator must respect this setting rather than overriding it.

Coordinator mode returns `PUSHED` with the new head and used attempt count. Standalone mode returns to Observe, retaining its deadline and attempt count; after 3 unsuccessful fix attempts report remaining failures. A push failure stops immediately.

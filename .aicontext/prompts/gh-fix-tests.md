# GH Fix Tests

Fix failing CI on the current PR: fetch failures, diagnose, fix, push, wait for green. Covers all CI check types — lint, type, build, tests.

## Prerequisites

- A PR must exist for the current branch
- `gh` CLI must be installed and authenticated

## 1. Fetch Failing Checks

```
gh pr checks
```

Identify failing checks by name. For each failing check, fetch the run logs:
```
gh run view --log-failed <run-id>
```

If no checks are failing, tell the user and stop.

## 2. Diagnose

For each failing check, parse the log output to identify:
- **Which files** are involved (file paths in error messages, stack traces, lint reports)
- **Which rule or test** failed (rule name, test name, build error)
- **The root cause** (not just the symptom)

Read the implicated source files to understand context before fixing.

## 3. Fix

Implement fixes for each failing check. Prefer root-cause fixes over symptom suppression (no disabling lint rules to make them pass unless the rule is genuinely wrong for the case).

## 4. Local Verify (optional)

For test failures, run the relevant test(s) locally to confirm the fix before pushing. For lint/type/build failures, CI is the source of truth — skip local verification and rely on the next CI run.

## 5. Commit and Push

Follow `ensure-config.md` to read project settings. Read `gh_fix_tests.push` from config (default: `true`).

- **`push: true`** (default): commit by delegating to `commit.md`, then push the current branch to the remote
- **`push: false`**: commit by delegating to `commit.md`, do NOT push — caller decides when to push

## 6. Wait for CI

If pushed in Step 5, wait for CI to re-run:
```
timeout 30m gh pr checks --watch || true
```

## 7. Verify and Retry

Check the new CI results:
- **All checks pass** → done, report success and stop
- **Some checks still fail** → increment attempt counter
  - If `attempt < 3` → return to Step 1 with the new failure set
  - If `attempt == 3` → stop, tell the user: "Still failing after 3 attempts: [list]. Manual investigation needed."

## Exit Conditions

- All CI checks pass → success
- `attempt == 3` and failures remain → escalate to user
- No checks are failing on entry → nothing to do

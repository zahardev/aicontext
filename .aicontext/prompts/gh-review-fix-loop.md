# GitHub Review Fix Loop

Automate the PR review cycle: fetch comments, triage, fix, push, wait for re-review, repeat.

## Prerequisites

- A PR must already exist for the current branch
- `.aicontext/scripts/pr-reviews.cjs` and `.aicontext/scripts/pr-resolve.cjs` must be available

## Before Starting

Load the task file, spec (if linked), and brief (at `.aicontext/data/brief/brief-{task-filename}` if it exists). Skip any file already Read earlier in this conversation — rely on memory.

Set `cycle = 1`, max cycles = 5.

## Cycle Loop

Repeat until no fixable issues remain or `cycle > 5`:

### 1. Fetch Review Comments

```
node .aicontext/scripts/pr-reviews.cjs
```

### 2. Triage Each Comment

Triage using the Review Response Rules table in `process.md`. Actions:
- **Fix** — real issue with a clear code change
- **Resolve** — false positive, incorrect, irrelevant, or already addressed
- **Skip** — needs user input or human judgment

Fill the Reply column for every `resolve` and `fix` — the reply is posted as a comment on the PR thread. Keep it concise.

### 3. Resolve

Resolve all comments marked Resolve — the script processes the review file and posts Reply column text before resolving each thread:
```
node .aicontext/scripts/pr-resolve.cjs <path-to-review-file>
```

### 4. Fix

Implement fixes for all comments marked Fix.

### 5. Commit and Push

**Skip this step if no code changed this cycle** (no Fix actions).

Otherwise, commit all fixes by delegating to `commit.md`, then push the current branch to the remote.

### 6. Wait for Checks and New Review

Two-phase wait:

**Phase 1 — wait for CI and review bots to finish:**

If Step 5 pushed new commits, wait for CI:
```
timeout 30m gh pr checks --watch || true
```
Ignore the exit code — checks may fail (e.g., CI tests) but the review bot may still have finished. If nothing was pushed this cycle, skip this wait and proceed directly to the paused-reviews check and Phase 2.

**Paused reviews check** — after checks complete, check if the review bot paused:
```
gh api repos/{owner}/{repo}/issues/{pr_number}/comments --jq '.[] | select(.body | test("review paused by coderabbit.ai")) | .id' | tail -1
```
If a paused comment is found, warn the user:
> "CodeRabbit reviews are paused (too many commits). Comment `@coderabbitai resume` on the PR to re-enable, then re-run the loop."

Stop the loop — do not continue cycling without active reviews.

**Verify CI** — before moving to Phase 2, confirm all CI checks are green. Only needed if code changed this cycle (Step 5 pushed):
- **Nothing was pushed this cycle** → skip this check, the last CI run still covers the code
- **All CI checks passed** → continue to Phase 2
- **Any CI check failed** → delegate to `/gh-fix-tests` (handles fetch + fix + push + retry with its own cycle cap). When it returns green, continue to Phase 2. If it escalates after 3 attempts, stop this loop and report to the user
- **No CI configured** → run the full test suite locally. If tests fail, fix and re-run — or stop and ask the user if the cause isn't clear

**Phase 2 — check for new review comments:**
```
node .aicontext/scripts/pr-reviews.cjs
```

- If new findings are saved: new review is ready — increment `cycle`, continue to next cycle
- If "No unresolved review threads": no new feedback — exit the loop

## After Loop Completes

**Stale review state** — if the loop exited cleanly (0 unresolved threads), check for lingering `CHANGES_REQUESTED` reviews:
```
gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews --jq '[.[] | select(.state == "CHANGES_REQUESTED")] | map(.user.login) | unique'
```
If any reviewers still show `CHANGES_REQUESTED`, warn the user:
> "All threads are resolved but these reviewers still show 'Changes Requested': [list]. They may need to re-review or approve."

Scan decisions made during this loop: did any reviewer feedback lead to a new architectural decision, requirement, or non-goal? If yes, update the spec. Supersessions of existing spec decisions → brief's Decision Overrides. See `process.md "Brief content boundary"`.

## Exit Conditions

- All fixable issues resolved and no new comments after a push
- `cycle > 5` — report remaining open comments to the user
- Tests fail and the root cause isn't clear — stop and ask the user

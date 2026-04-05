# GitHub Review Fix Loop

Automate the PR review cycle: fetch comments, triage, fix, push, wait for re-review, repeat.

## Prerequisites

- A PR must already exist for the current branch
- `.aicontext/scripts/pr-reviews.js` and `.aicontext/scripts/pr-resolve.js` must be available

## Before Starting

Read context so the reviewer's feedback can be understood in full:

1. **Task file** — identify what was built and why
2. **Spec** — if linked in the task file, read for requirements and decisions
3. **Brief** — `.aicontext/data/brief/brief-{task-filename}` (if it exists) — accumulated technical knowledge and decisions

Set `cycle = 1`, max cycles = 5.

## Cycle Loop

Repeat until no fixable issues remain or `cycle > 5`:

### 1. Fetch Review Comments

```
node .aicontext/scripts/pr-reviews.js
```

### 2. Triage Each Comment

For each comment, assess using the severity × effort table:

| Severity | Effort | Action |
|----------|--------|--------|
| High | Any | Fix |
| Medium | Low | Fix |
| Medium | High | Fix |
| Low | Low | Fix |
| Low | High | Skip — note in brief |
| False positive | — | Resolve |

- **Fix** — real issue with a clear code change, or low-importance but easy to fix
- **Resolve** — false positive, incorrect, irrelevant, or already addressed
- **Skip** — needs user input or human judgment

Fill the Reply column for every `resolve` and `fix` action — the reply is posted as a comment on the PR thread. Keep it concise: why it's a false positive, or what was fixed.

### 3. Resolve

Resolve all comments marked Resolve — the script processes the review file and posts Reply column text before resolving each thread:
```
node .aicontext/scripts/pr-resolve.js <path-to-review-file>
```

### 4. Fix

Implement fixes for all comments marked Fix.

### 5. Run Tests

Ask `test-runner` subagent to run the full test suite. If tests fail:
- Fix the failures
- Re-run until passing (or stop and ask the user if the cause isn't clear)

### 6. Commit and Push

Commit all fixes by delegating to `commit.md`.

Push the current branch to the remote.

### 7. Wait for Checks and New Review

Two-phase wait:

**Phase 1 — wait for CI and review bots to finish:**
```
timeout 30m gh pr checks --watch || true
```
Ignore the exit code — checks may fail (e.g., CI tests) but the review bot may still have finished.

**Paused reviews check** — after checks complete, check if the review bot paused:
```
gh api repos/{owner}/{repo}/issues/{pr_number}/comments --jq '.[] | select(.body | test("review paused by coderabbit.ai")) | .id' | tail -1
```
If a paused comment is found, warn the user:
> "CodeRabbit reviews are paused (too many commits). Comment `@coderabbitai resume` on the PR to re-enable, then re-run the loop."

Stop the loop — do not continue cycling without active reviews.

**Phase 2 — check for new review comments:**
```
node .aicontext/scripts/pr-reviews.js
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

Scan decisions made during this loop: did any reviewer feedback lead to an architectural decision, requirements change, or non-goal discovery? If yes, update the spec's Decisions section.

## Exit Conditions

- All fixable issues resolved and no new comments after a push
- `cycle > 5` — report remaining open comments to the user
- Tests fail and the root cause isn't clear — stop and ask the user

# Step Inner Loop

Execute a single step from the task plan. Reads `after_step.*` from `config.yml` per Quality Checks in `process.md`.

## Upfront ask-batching (single-step invocations only)

When called from a single-step entry point (`/run-step`, `/do-it`, `/next-step`) — not from `/run-task`, which batches at the task level — before implementing the step: collect every `after_step.*` field set to `ask` and prompt in one numbered batch per the Ask UX below. Skip the batch if no `ask` values remain.

## Ask UX

For each `ask` field, fire a **two-stage** prompt:

**Stage 1 — decision for this run:**

| Field | Options (timing recommendation first) |
|---|---|
| `after_step.review` | `1) No (recommended)`, `2) Partial`, `3) Full` |
| `after_step.tests` | `1) No (recommended)`, `2) Partial`, `3) Full` |
| `after_step.commit` | `1) No (recommended)`, `2) Yes` |
| `after_task.review` | `1) Full (recommended)`, `2) Partial`, `3) No` |
| `after_task.tests` | `1) Full (recommended)`, `2) Partial`, `3) No` |
| `after_task.commit` | `1) Yes (recommended)`, `2) No` |
| `after_task.push` | `1) No (recommended)`, `2) Yes` |

Recommendations reflect typical usage (step-level = lightweight; task-close = comprehensive; push always opt-in for safety). The user can override per run.

**Stage 2 — save as default:** After every stage-1 answer, always ask `Save as default in config.yml? (y/N)` — default N. If y, write the stage-1 answer back to `config.yml`, flipping the field from `ask` to its concrete value. If n, the answer applies only to this run.

## Review corpus

The `reviewer` subagent needs to know *what changed* — the corpus — which depends on commit state:

| Timing | Commit state | Corpus |
|---|---|---|
| `after_step` | No commits since task start (working tree dirty) | working tree (staged + unstaged + untracked) |
| `after_step` | Last commit is from this step | `HEAD^..HEAD` — just that commit |
| `after_task` | Any | `{base-branch}...HEAD` + uncommitted working tree |

Pass the corpus explicitly to the reviewer subagent along with the resolved scope (`partial` = scoped diff, `full` = whole-branch deep pass). When committing after each step without isolating work, the reviewer sees the cumulative working tree — this is intentional (review cumulative work), and the user is responsible for committing or stashing between steps if they want isolation.

## Loop

1. **Implement** the step
2. **Review** — if `after_step.review` resolved to `partial` or `full`: compute corpus (see above), call `reviewer` subagent (Claude Code; inline otherwise). Tell the reviewer which playbook to follow: `partial` → `review.md`, `full` → `deep-review.md`
3. **Assess** findings using the severity × effort table in `process.md`
4. **Fix** actionable issues
5. **Re-review** — repeat 2–4 up to 5 times total. If issues remain after 5 iterations, stop and tell the user: "I've done 5 review cycles — please check if there are remaining issues." The user decides to resolve manually or run another cycle.
6. **Test** — if `after_step.tests` resolved to `partial`: call `test-runner` subagent for step-related tests. If `full`: call `test-runner` for the full suite.
7. **Fix tests** — if tests fail and the fix is clear, fix and re-run. Otherwise stop (see Stop Conditions in `run-task.md`).
8. **Commit** — if `after_step.commit` resolved to Yes: delegate to `commit.md`
9. **Close step** — follow `close-step.md` (updates task, brief, spec and outputs a summary with counts). Do not advance until the close-step summary is output.

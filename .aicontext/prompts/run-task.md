# Run Task

Execute all pending steps in the current task file, accumulating context throughout. One agent implements all steps inline.

## 1. Setup

1. Follow `identify-task.md` to find the active task
2. Read the task file, linked spec (if any), and brief at `.aicontext/data/brief/brief-{task-filename}`
3. If no brief exists, create one from `.aicontext/templates/brief.template.md`
4. Follow `ensure-config.md` to load project settings

## 2. Upfront ask-batching

Before Step 1, collect every `after_step.*` and `after_task.*` field in `config.yml` set to `ask`. Prompt in one numbered batch using the two-stage Ask UX in `step-loop.md`:

- **Stage 1** — decision per field (`partial`/`full`/`no` for review/tests, `yes`/`no` for commit/push/pr/review_loop; timing recommendation first)
- **Stage 2** — after each stage-1 answer, ask `Save as default in config.yml? (y/N)` (default N)

Resolved values apply for the whole run. Save-as-default answers are written back to `config.yml` immediately. Skip the batch entirely if no `ask` values remain.

No mid-flow asks for configured actions — the batch is the only interactive gate.

## 3. Execute

For each pending step (unchecked `- [ ]` in the task file), follow `.aicontext/prompts/step-loop.md`. `step-loop.md` uses the resolved `after_step.*` values from Section 2 and computes the review corpus per its rules.

## 4. After All Steps

Run after-task actions based on resolved `after_task.*` values:

1. **Review** — if `after_task.review` resolved to `partial` or `full`: compute corpus (`{base-branch}...HEAD` + uncommitted working tree), call `reviewer` subagent (Claude Code only; run inline in other tools). Tell the reviewer which playbook to follow: `partial` → `review.md`, `full` → `deep-review.md`
2. **Tests** — if `after_task.tests` resolved to `partial`: step-related tests; if `full`: full suite. Call `test-runner` subagent (Claude Code only; run inline in other tools)
3. Fix any issues found
4. `All steps complete. Run /finish-task to close the task.`

## Stop Conditions

Stop and ask the user when:
- Tests fail and the root cause isn't clear
- A review finding is critical and the fix isn't obvious
- A step needs a decision that wasn't covered in planning
- A manual user action blocks the next step

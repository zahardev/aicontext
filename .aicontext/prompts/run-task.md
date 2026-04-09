# Run Task

Execute all pending steps in the current task file, accumulating context throughout. One agent implements all steps inline.

## 1. Setup

1. Follow `identify-task.md` to find the active task
2. Read the task file, linked spec (if any), and brief at `.aicontext/data/brief/brief-{task-filename}`
3. If no brief exists, create one from `.aicontext/templates/brief.template.md`
4. Follow `ensure-config.md` to load project settings. The task file's `## Commit Rules:` section can override `commit.mode` for this task only.

## 2. Commit Mode

`/run-task` only commits during execution if `commit.mode` is `per-step`. Other modes (`per-task`, `manual`) are handled by `/finish-task` via `commit.finish_action`.

If `commit.mode` is `per-step`, confirm before starting: `Commit mode is per-step. Will commit after each step. Proceed, or override for this run?`

## 3. Execute

For each pending step (unchecked `- [ ]` in the task file), follow `.aicontext/prompts/step-loop.md`. The inner loop consults `process.md` for quality check timing and finding triage.

## 4. After All Steps

1. Run After Task checks from the quality checks table in `process.md`:
   - Deep review (if enabled) — ask `reviewer` subagent (Claude Code only; run inline in other tools)
   - Full test suite (if enabled) — ask `test-runner` subagent (Claude Code only; run inline in other tools)
2. Fix any issues found
3. `All steps complete. Run /finish-task to close the task.`

## Stop Conditions

Stop and ask the user when:
- Tests fail and the root cause isn't clear
- A review finding is critical and the fix isn't obvious
- A step needs a decision that wasn't covered in planning
- A manual user action blocks the next step

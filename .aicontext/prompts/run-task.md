# Run Task

Execute all pending steps in the current task file, accumulating context throughout. One agent implements all steps inline.

## 1. Setup

1. Follow `identify-task.md` to find the active task
2. Read the task file, linked spec (if any), and task-context at `.aicontext/data/task-context/context-{task-filename}.md`
3. If no task-context exists, create one from `.aicontext/templates/task-context.template.md`
4. Follow `ensure-config.md`.

## 2. Execute

For each pending step (unchecked `- [ ]` in the task file), follow `.aicontext/prompts/step-loop.md`. `step-loop.md` uses the resolved `after_step.*` values from Section 1 and computes the review corpus per its rules.

## 3. After All Steps

Run after-task actions based on resolved `after_task.*` values:

1. **Review** — if `after_task.review` resolved to `normal` or `deep`: compute corpus (`{base-branch}...HEAD` + uncommitted working tree). Call `reviewer` subagent (Claude Code) or follow the playbook inline (Cursor/Copilot). Pass the exact playbook path: `normal` → `.aicontext/prompts/review.md`, `deep` → `.aicontext/prompts/deep-review.md`
2. **Tests** — if `after_task.tests` resolved to anything other than `false`: call `resolve-tests.md` with the resolved value and `task` context to get the command(s). Pass them to `test-runner` subagent (Claude Code) or run inline (Cursor/Copilot/Codex). If the resolver returns `ERROR`: surface to the user, do not run tests.
3. Fix any issues found
4. `All steps complete. Run /finish-task to close the task.`

## Stop Conditions

Stop and ask the user when:
- Tests fail and the root cause isn't clear
- A review finding is critical and the fix isn't obvious
- A step needs a decision that wasn't covered in planning
- A manual user action blocks the next step

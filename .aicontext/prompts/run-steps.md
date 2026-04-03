# Run Steps

Execute all pending steps in the current task file, accumulating context throughout. One agent implements all steps inline.

## Before Starting

1. **Create brief if it doesn't exist** (see Brief Setup below)
2. **Read three-layer context** (read each file if it exists):
   - **Spec**: linked in the task file
   - **Brief**: `.aicontext/data/brief/brief-{task-filename}` (e.g. task `1.6.0-dev-flow-v2.md` → brief `.aicontext/data/brief/brief-1.6.0-dev-flow-v2.md`)
   - **Task**: current task file
3. **Read** `.aicontext/rules/process.md` to get the quality checks table
4. **Check commit configuration** (see Commit Setup below)
5. **Identify** the first unchecked step (`- [ ]`)

## Brief Setup

If no brief exists for this task:
1. Copy `.aicontext/templates/brief.template.md` to `.aicontext/data/brief/brief-{task-filename}`
2. Fill in the References section with links to spec, task, rules, project, structure, and local (if it exists)

## Commit Setup

Check for commit rules in this order (first found wins): task file `## Commit Rules:` → `local.md` → `project.md` `## Commit Rules`.

`/run-steps` only commits during execution if `commit_mode` is `per-step`. All other commit modes (`per-task`, `manual`) are handled by `/finish-task` via `finish_action`.

**If `commit_mode` is `per-step`**, confirm:
> "Commit mode is `per-step` (from {source}). Will commit after each step. Proceed, or override?"

**If `commit_mode` is not configured**, ask:
> "Should I commit after each step, or leave commits for `/finish-task`?"
> 1. **per-step** — commit after each step completes
> 2. **no** — I'll handle commits later (via `/finish-task` or manually)

**If saving per-step to config**, ask for **commit template** (if not already configured):
> 1. `description` — plain description (e.g. `Add user authentication`)
> 2. `description (#issue_id)` — with issue reference (e.g. `Add user authentication (#42)`)
> 3. `type: description` — conventional commits (e.g. `feat: add user authentication`)
> 4. Custom — enter your own format

## Quality Checks

The quality checks table in `process.md` defines what to run and when. Read it before starting.

When findings are returned, assess each with this table:

| Severity | Effort | Action |
|----------|--------|--------|
| High | Any | Fix |
| Medium | Low | Fix |
| Medium | High | Fix |
| Low | Low | Fix |
| Low | High | Skip — note in brief |
| False positive | — | Resolve / dismiss |

## Step Inner Loop

For each pending step (unchecked `- [ ]` items in the task file), follow the inner loop defined in `.aicontext/prompts/step-loop.md`.

## After All Steps

1. Run After Task checks (from quality checks table):
   - Deep review (if enabled) — ask `reviewer` subagent or run inline
   - Full test suite (if enabled) — ask `test-runner` subagent
2. Fix any issues found
3. Notify the user: all steps complete. Run `/finish-task` when ready to close the task.

## Stop Conditions

Stop and ask the user when:
- Tests fail and the root cause isn't clear
- A review finding is critical and the fix isn't obvious
- A step requires a decision that wasn't covered in planning
- The user needs to take a manual action before the next step can proceed

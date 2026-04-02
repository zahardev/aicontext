# Run Steps

Execute all pending steps in the current task file, accumulating context throughout. One agent implements all steps inline.

## Before Starting

1. **Create brief if it doesn't exist** (see Brief Setup below)
2. **Read three-layer context** (read each file if it exists):
   - **Spec**: linked in the task file
   - **Brief**: `data/brief/brief-{task-filename}` (e.g. task `1.6.0-dev-flow-v2.md` → brief `data/brief/brief-1.6.0-dev-flow-v2.md`)
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

**If default exists**, confirm in one question:
> "Commit mode is `{mode}` (from {source}). Proceed, or override?"

Only show options if the user wants to override.

**If no default exists**, ask:
> "How often would you like to commit?"
> 1. **per-step** — commit after each step completes
> 2. **per-task** — commit once after all steps are done
> 3. **manual** — I'll commit myself (no automatic commits)

**If no rules exist anywhere**, after the user answers, offer to save:
> "No commit rules found in project.md or local.md. Would you like to save this preference?"
> 1. Save to `project.md` (shared with team)
> 2. Save to `local.md` (personal, gitignored)
> 3. Don't save (use for this session only)

If saving, also ask for **commit template** (if not already configured):
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
   - Ask `standards-checker` subagent for standards check (if enabled)
   - Ask `test-runner` subagent for full test suite (if enabled)
2. Fix any issues found
3. If `commit_mode` is `per-task`, commit using the configured template
4. Notify the user: all steps complete. Run `/finish-task` when ready to close the task.

## Stop Conditions

Stop and ask the user when:
- Tests fail and the root cause isn't clear
- A review finding is critical and the fix isn't obvious
- A step requires a decision that wasn't covered in planning
- The user needs to take a manual action before the next step can proceed

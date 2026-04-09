# Add Step

Add a new step to the current task based on what was just discussed.

## 1. Identify the Task

**`/add-step here`** — force the explicitly-referenced task (see `identify-task.md` rule 1). If no such reference exists, fall back below.

**`/add-step`** — use `identify-task.md`. If the explicit reference and conversation-active task differ, pick the one whose objective better fits the new step (ties → explicit reference).

Read the task file and spec (if linked).

## 2. Check for Deliverable Coverage

Read the task's `## Deliverables:` (legacy: `## Requirements:`) section. State out loud which deliverable(s) the new step satisfies — never decide silently.

- **Fits existing deliverable(s)**: name each one exactly → proceed.
- **Extends scope**: propose a new deliverable and ask *"Add task deliverable '[proposed]'?"* (Yes/No). If Yes, append to `## Deliverables:` before continuing.

See `process.md "Task Deliverables vs Spec Requirements"`.

## 3. Add Step

If a step for this work already exists, point to it instead of creating a duplicate.

Create a new step with the next step number. Add sub-items (`- [ ]`) capturing the deliverables. Follow the Task Planning Guidelines in `process.md` (WHAT not HOW, broad/actionable granularity, logical ordering).

## 4. Update Spec

New decisions, requirements, and non-goals → spec directly. Supersessions of existing spec decisions → revise the spec and record the override in the brief's Decision Overrides. See `process.md "Brief content boundary"`.

When adding a new spec requirement, check if the step just created covers it — if not, add a sub-item.

## 5. Confirm

Show the step that was added. Do not implement — use `/run-step` or `/do-it` for that.

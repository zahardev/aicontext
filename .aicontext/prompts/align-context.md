# Align Context

Update all context files to reflect the current state of work. Fix what's stale, fill what's missing, then report what changed.

## 1. Identify the Task

Read and follow `identify-task.md` to find the active task.

Read the task file and task-context (at `.aicontext/data/task-context/context-{task-filename}` if it exists). For the spec (if linked): if you already Read it earlier in this conversation, rely on that — don't re-Read. Otherwise Read it once (align-context needs a holistic view to catch cross-section conflicts).

## 2. Task File

- Check off any steps that are clearly complete but not yet marked (`- [ ]` → `- [x]`)
- Update the Last Updated date

## 3. Spec

If a spec is linked, review it against session knowledge. For each candidate addition (decisions, requirements, non-goals): already present → skip; contradicts existing → revise the spec and record the supersession in the task-context's Decision Overrides (see `process.md "Task-context content boundary"`); genuinely new → append to the appropriate section. If an Edit fails because your memory is stale, Grep + Read just that section and retry.

When adding a new requirement, check if a task step covers it — if not, add a step.

## 4. Task-Context

Append session knowledge to the task-context's sections. If no task-context exists and work has been done, create one from `task-context.template.md`.

## 5. Worklog

If `.aicontext/worklog.md` doesn't exist, create it from `.aicontext/templates/worklog.template.md`.

- If the task's spec isn't listed, add it under the appropriate section
- Update task checkboxes to match actual completion state
- If all tasks under a spec are checked, move the spec to "Done" with today's date

## 6. Report

After all updates, provide a short summary:

```
Aligned context:
- Task: [what changed, or "up to date"]
- Spec: [what changed, or "up to date"]
- Task-context: [what changed, or "up to date"]
- Worklog: [what changed, or "up to date"]
```

# Add Step

Add a new step to the current task based on what was just discussed.

## 1. Identify the Task

**If the command was invoked with `here`** (e.g., `/add-step here`):
- Use the IDE-opened task file as the active task
- If no task file is open in the IDE, fall back to normal identification below

**Otherwise:**
- Read and follow `identify-task.md` to find the active task
- If the IDE-opened task and the conversation-active task differ, check which one the step fits better based on each task's objective — use that one. If equally fitting, prefer the IDE-opened task.

Read the task file and spec (if linked).

## 2. Add Step

Check if a step for this work already exists in the task file. If it does, point to it instead of creating a duplicate.

Create a new step:
- Use the next step number (e.g., if the last step is Step 7, create Step 8)
- Write a concise step title describing WHAT, not HOW
- Add sub-items (`- [ ]`) that capture the deliverables
- Keep sub-items broad enough to be meaningful, specific enough to be actionable — no micro-tasks
- Order sub-items logically with dependencies considered

## 3. Update Spec

If the discussion introduced new requirements, decisions, or non-goals — update the spec.

When adding a new requirement, check if it's covered by the step just created. If not, add a sub-item.

## 4. Confirm

Show the step that was added. Do not implement — use `/run-step` or `/do-it` for that.

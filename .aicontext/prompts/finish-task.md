# Finish Task

Close out the current task: verify completion, sync spec, write completion notes, update worklog, and handle git.

## 1. Identify the Task

Read and follow `identify-task.md` to find the active task.

Read the task file, spec (if linked), and brief (if it exists at `.aicontext/data/brief/brief-{task-filename}`).

## 2. Verify Completion

- Confirm all plan steps are checked (`- [x]`)
- If unchecked steps remain, ask the user: "These steps are still open — mark as done anyway, or complete them first?"

## 3. Sync Spec

Read the spec and brief side by side. Check:
- Are all significant decisions from the brief reflected in the spec's Decisions section?
- Do any requirements need updating based on what was actually built?
- Are there new non-goals to document?

Update the spec if anything is missing. Mark the task as complete in the spec's `## Tasks` section (add `✓` or `(complete)` next to the task link).

## 4. Fill Completion Notes

In the task file, fill in `## Completion Notes:` with:
- What was built and any compromises made
- Follow-up tasks that emerged
- Key learnings

## 5. Update Worklog

If `.aicontext/worklog.md` doesn't exist, create it from `.aicontext/templates/worklog.template.md`.

Update `.aicontext/worklog.md`:
- If the task's spec isn't listed yet, add it under the appropriate section (In Progress / Done)
- Check off the task under its spec (`- [ ]` → `- [x]`)
- If all tasks under a spec are checked, move the spec from "In Progress" to "Done" with the current date
- If the task has no spec, add it under "Standalone Tasks" as checked with the current date

## 6. Handle Git

Check for uncommitted changes (`git status`).

**If there are uncommitted changes**, determine `finish_action`:
1. Check task file `## Commit Rules:` for `finish_action`
2. Fall back to `local.md` for `finish_action`
3. Fall back to `project.md` → `## Commit Rules` for `finish_action`
4. If not configured, ask:
   > "You have uncommitted changes. What would you like to do?"
   > 1. `nothing` — leave as-is, I'll handle git myself
   > 2. `commit` — commit with a task completion message
   > 3. `commit+push` — commit and push to remote

**If `finish_action` is `nothing`** but there are uncommitted changes, warn:
> "You have uncommitted changes but `finish_action` is `nothing`. Want me to commit anyway, or leave as-is?"

Execute the chosen action. For commit messages use the configured `commit_template`, or default to: `complete: {task description}`.

**If there are no uncommitted changes**, skip this step.

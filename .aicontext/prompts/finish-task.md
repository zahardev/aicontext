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

Follow `ensure-config.md` to read project settings. Read `commit.finish_action` from the config (task file `## Commit Rules:` overrides if present).

Check for uncommitted changes (`git status`).

**If there are uncommitted changes:**
- `nothing` — skip
- `ask` — ask the user what to do (commit / commit+push / leave as-is)
- `commit` — delegate to `commit.md`
- `commit+push` — delegate to `commit.md`, then push to remote

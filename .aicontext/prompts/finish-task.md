# Finish Task

Close out the current task: verify completion, sync spec, write completion notes, update worklog, and handle git.

## 1. Identify the Task

Read and follow `identify-task.md` to find the active task.

Read the task file, spec (if linked), and brief (if it exists at `.aicontext/data/brief/brief-{task-filename}`).

## 2. Verify Completion

- Confirm all plan steps are checked. If any remain, ask: "Mark done anyway, or complete first?"
- **Task deliverables (hard block):** walk `## Deliverables:` (legacy: `## Requirements:`). Resolve every unchecked bullet via **Deliver** / **Defer** / **Revise** before proceeding. (Legacy: no section → skip + note.)
- **Spec requirements (warning gate):** walk spec requirements in linked subsection(s) via the `*Implemented by:*` footer. Check what this task delivered (across all steps, genuinely complete). For each still unchecked → warning + same Deliver/Defer/Revise. (Legacy: no footers → whole-spec scan + note.)

See `process.md "Task Deliverables vs Spec Requirements"`.

## 3. Sync Spec (does the spec need new content?)

Step 2 already verified the existing spec requirements were delivered. This step covers what Step 2 doesn't: *adding* new content the brief surfaced during execution.

Read the spec and brief side by side. Check:
- Are all brief `Decision Overrides` entries applied to the spec? Each entry represents a spec revision — verify the spec reflects it.
- Are there new non-goals to document?
- Did the work surface any *new* requirements that should be added to the spec for a future task to deliver? (Existing requirements are handled by Step 2 — this is for *additions* only.)

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

## 7. Output Completion Summary

**You MUST output this summary — it proves the task closed cleanly.**

```
Task {task-name} closed:
- Plan steps: N/N complete
- Task deliverables: N/N delivered (X deferred, Y revised)
- Spec requirements: N/M delivered (X deferred, Y revised)
- Worklog: updated
- Git: {finish_action result}
```

Step 2 resolves every warning before reaching this summary. Deferred/revised counts record the user's resolution choices — auditable. Reaching Step 7 with unresolved warnings is an error: return to Step 2.

After the summary, append one handoff line based on worklog state:
- If the just-finished task's spec has other unchecked tasks in the worklog → `Spec '{Spec Name}' has more pending tasks. Next: '{next-task-name}'. Would you like to start it now?`
- Otherwise (spec complete, or no spec) → `Start the next feature with /start-feature.`

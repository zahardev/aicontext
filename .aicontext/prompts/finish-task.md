# Finish Task

Close out the current task: verify completion, sync spec, write completion notes, update worklog, and handle git.

## 1. Identify the Task

Read and follow `identify-task.md` to find the active task.

Load the task file, spec (if linked), and brief (at `.aicontext/data/brief/brief-{task-filename}` if it exists). Skip any file already Read earlier in this conversation — rely on memory.

## 2. Verify Completion

- Confirm all plan steps are checked. If any remain, ask: "Mark done anyway, or complete first?"
- **Task deliverables (hard block):** walk `## Deliverables:` (legacy: `## Requirements:`). Resolve every unchecked bullet via **Deliver** / **Defer** / **Revise** before proceeding. (Legacy: no section → skip + note.)
- **Spec requirements (warning gate):** walk spec requirements in linked subsection(s) via the `*Implemented by:*` footer. Check what this task delivered (across all steps, genuinely complete). For each still unchecked → warning + same Deliver/Defer/Revise. (Legacy: no footers → whole-spec scan + note.)

See `process.md "Task Deliverables vs Spec Requirements"`.

## 3. Sync Spec (does the spec need new content?)

Step 2 verified existing spec requirements; this step *adds* new content the brief surfaced during execution.

Cross-reference the spec and brief (both loaded in Step 1):
- Are all brief `Decision Overrides` entries applied to the spec? Each represents a spec revision — verify the spec reflects it.
- Are there new non-goals to document?
- Did the work surface *new* requirements for a future task to deliver?

Update the spec if anything is missing. Mark the task complete in the spec's `## Tasks` section (`✓` or `(complete)` next to the task link).

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

Follow `ensure-config.md` to read project settings. Read `after_task.commit` and `after_task.push` (resolved values — `/run-task` and `/run-step` resolve `ask` upfront).

Commit and push are independent gates — `after_task.push` can fire without `after_task.commit` (step-level commits still need to reach the remote):

**Commit** — if `after_task.commit` resolved to Yes **and** `git status` shows uncommitted changes, delegate to `commit.md`. If there are no uncommitted changes (step-level commits already covered everything), silently skip and note `"commit: skipped — no uncommitted changes"` in the summary.

**Push** — if `after_task.push` resolved to Yes: check if upstream exists (`git rev-parse --verify @{u}`). If upstream exists and branch is ahead (`git rev-list @{u}..HEAD --count > 0`), `git push`. If no upstream, push with `git push -u origin {current-branch}`. Fires independently of the commit gate.

## 7. Output Completion Summary

**You MUST output this summary — it proves the task closed cleanly.**

```
Task {task-name} closed:
- Plan steps: N/N complete
- Task deliverables: N/N delivered (X deferred, Y revised)
- Spec requirements: N/M delivered (X deferred, Y revised)
- Worklog: updated
- Git: {commit / push result, or "skipped — step-level commits covered the task"}
```

Step 2 resolves every warning before reaching this summary. Deferred/revised counts record the user's resolution choices — auditable. Reaching Step 7 with unresolved warnings is an error: return to Step 2.

After the summary, append one handoff line based on worklog state:
- If the just-finished task's spec has other unchecked tasks in the worklog → `Spec '{Spec Name}' has more pending tasks. Next: '{next-task-name}'. Would you like to start it now?`
- Otherwise (spec complete, or no spec) → `Start the next feature with /start-feature.`

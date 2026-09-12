# Finish Task

## 1. Identify the Task

Read and follow `identify-task.md` to find the active task.

Load the task file, spec (if linked), and task-context (at `.aicontext/data/task-context/context-{task-filename}.md` if it exists) per the Session Context Reuse rule in `process.md`.

Follow `ensure-config.md` with `after_task.*` and `project.base_branch`.

## 2. Align Context

Follow `align-context.md` sections 2–4 (task file, spec, task-context). Skip section 5 (worklog — handled in step 5 with an ask gate).

## 3. Verify Completion

- Confirm all plan steps are checked. If any remain, ask: "Mark done anyway, or complete first?"
- **Task deliverables (hard block):** walk `## Deliverables:` (legacy: `## Requirements:`). Resolve every unchecked bullet via **Deliver** / **Defer** / **Revise** before proceeding. (Legacy: no section → skip + note.)
- **Spec requirements (warning gate):** walk spec requirements in linked subsection(s) via the `*Implemented by:*` footer. Check what this task delivered (across all steps, genuinely complete). For each still unchecked → warning + same Deliver/Defer/Revise. (Legacy: no footers → whole-spec scan + note.)

See `process.md "Task Deliverables vs Spec Requirements"`.

Mark the task complete in the spec's `## Tasks` section (`✓` or `(complete)` next to the task link).

## 4. Fill Completion Notes

In the task file, fill in `## Completion Notes:` with:
- What was built and any compromises made
- Follow-up tasks that emerged
- Key learnings

## 5. Update Worklog

Mark the task done — no prompt. Running `/finish-task` is the signal that the task is finished.

### Marking done

Update `.aicontext/worklog.md`:
- If the task's spec isn't listed yet, add it under the appropriate section (In Progress / Done)
- Check off the task under its spec (`- [ ]` → `- [x]`)
- If all tasks under a spec are checked, move the spec from "In Progress" to "Done" with the current date
- If the task has no spec, add it under "Standalone Tasks" as checked with the current date

## 6. Git

### Commit

If `after_task.commit` resolved to Yes **and** `git status` shows uncommitted changes, explicitly invoke the `commit` skill using Native Skill Syntax (`$commit` in Codex). Do not depend on implicit skill invocation. If there are no uncommitted changes (step-level commits already covered everything), silently skip and note `"commit: skipped — no uncommitted changes"` in the summary.

### Push

If `after_task.push` resolved to Yes: run `git status` to verify the current branch and tracking state. If HEAD is detached or no branch name is available, **stop and ask the user** before any remote write. Otherwise run `git push -u origin {current-branch}`. Fires independently of the commit gate.

### PR

If `after_task.pr` resolved to Yes: delegate to `make-pr.md`, which pushes the branch, drafts, and creates the PR. Its push is a prerequisite of PR creation and fires even when `after_task.push` is `false`.

### Review loop

If `after_task.review_loop` resolved to Yes: check if a remote PR exists for the current branch (`gh pr view --json number 2>/dev/null`). If a PR exists, delegate to `gh-review-fix-loop.md`. If no remote PR exists (e.g. `after_task.pr: false` and the user creates PRs manually), skip the loop — the task is already marked done; the user handles reviews on their own PR.

## 7. Resumed Run Detection

When finish-task is invoked on a task that was already closed once (completion notes are non-empty and all plan steps are checked), this is a resumed run:

- Skip steps 1–4 (already done on first run)
- Run step 5 (worklog — mark done silently, the user's `/finish-task` invocation is the signal)
- Run step 6 (git — there may be new commits from review fixes)
- Output the completion summary

## 8. Output Completion Summary

**You MUST output this summary — it proves the task closed cleanly.**

```
Task {task_name} closed:
- Plan steps: N/N complete
- Task deliverables: N/N delivered (X deferred, Y revised)
- Spec requirements: N/M delivered (X deferred, Y revised)
- Worklog: updated
- Git: {commit / push / PR / review loop results, or "skipped — no uncommitted changes"}
```

Step 3 resolves every warning before reaching this summary. Deferred/revised counts record the user's resolution choices — auditable. Reaching Step 8 with unresolved warnings is an error: return to Step 3.

After the summary, append one handoff line based on worklog state:
- If the just-finished task's spec has other unchecked tasks in the worklog → `Spec '{Spec Name}' has more pending tasks. Next: '{next-task-name}'. Would you like to start it now?`
- Otherwise (spec complete, or no spec) → append the active tool's `start-feature` handoff.

## 9. Tidy suggestion

After the handoff line, count task files in `.aicontext/tasks/` (Glob `*.md`). If >10, append the active tool's `tidy-aic` handoff.

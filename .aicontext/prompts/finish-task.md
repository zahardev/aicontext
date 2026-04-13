# Finish Task

Close out the current task: verify completion, sync spec, write completion notes, update worklog, and handle git.

## 1. Identify the Task

Read and follow `identify-task.md` to find the active task.

Load the task file, spec (if linked), and task-context (at `.aicontext/data/task-context/context-{task-filename}.md` if it exists). Skip any file already Read earlier in this conversation — rely on memory.

## 2. Verify Completion

- Confirm all plan steps are checked. If any remain, ask: "Mark done anyway, or complete first?"
- **Task deliverables (hard block):** walk `## Deliverables:` (legacy: `## Requirements:`). Resolve every unchecked bullet via **Deliver** / **Defer** / **Revise** before proceeding. (Legacy: no section → skip + note.)
- **Spec requirements (warning gate):** walk spec requirements in linked subsection(s) via the `*Implemented by:*` footer. Check what this task delivered (across all steps, genuinely complete). For each still unchecked → warning + same Deliver/Defer/Revise. (Legacy: no footers → whole-spec scan + note.)

See `process.md "Task Deliverables vs Spec Requirements"`.

## 3. Sync Spec (does the spec need new content?)

Step 2 verified existing spec requirements; this step *adds* new content the task-context surfaced during execution.

Cross-reference the spec and task-context (both loaded in Step 1):
- Are all task-context `Decision Overrides` entries applied to the spec? Each represents a spec revision — verify the spec reflects it.
- Are there new non-goals to document?
- Did the work surface *new* requirements for a future task to deliver?

Update the spec if anything is missing. Mark the task complete in the spec's `## Tasks` section (`✓` or `(complete)` next to the task link).

## 4. Fill Completion Notes

In the task file, fill in `## Completion Notes:` with:
- What was built and any compromises made
- Follow-up tasks that emerged
- Key learnings

## 5. Handle Git

Follow `ensure-config.md` to read project settings. Read `after_task.commit`, `after_task.push`, `after_task.pr`, and `after_task.review_loop`.

If invoked from `/run-task`, these are already resolved (ask-batching happened upfront). If invoked standalone and any value is `ask`, prompt the user inline before proceeding — use the same questions and options from `step-loop.md`'s "After task completion" table.

### Commit

If `after_task.commit` resolved to Yes **and** `git status` shows uncommitted changes, delegate to `commit.md`. If there are no uncommitted changes (step-level commits already covered everything), silently skip and note `"commit: skipped — no uncommitted changes"` in the summary.

### Push

If `after_task.push` resolved to Yes: run `git push -u origin {current-branch}`. Fires independently of the commit gate.

### PR

If `after_task.pr` resolved to Yes: check if push happened (either in the push step above or earlier). If not pushed and no remote branch exists, ask the user: "PR creation requires pushing to remote. Push now? (Y/n)". If the user declines, skip PR and note in summary.

If push is confirmed, delegate to `draft-pr.md`. The `pr.save_to_file` and `pr.create_in_github` settings in config control what `draft-pr.md` does.

### Review loop

If `after_task.review_loop` resolved to Yes: check if a remote PR exists for the current branch (`gh pr view --json number 2>/dev/null`). If a PR exists, delegate to `gh-review-fix-loop.md`. If no remote PR exists (e.g. user creates PRs manually, or `pr.create_in_github: false`), skip — this is handled in Step 6 (deferred close). The user will create the PR manually, run the review loop or handle reviews themselves, then run `/finish-task` again to mark done.

## 6. Update Worklog (conditional)

Determine whether to mark done now or defer:

Always ask the user before marking done:

> Mark task as done?
> 1. **Yes** — mark done in worklog
> 2. **Not yet** — leave open
- **Review loop enabled but couldn't run** (no remote PR — e.g. `pr.create_in_github: false` or PR not yet created): ask the user:
  > "Task verified but no remote PR for review loop. Mark done now, or defer until after PR review?"
  > 1. Mark done now
  > 2. Defer — I'll run /finish-task again after PR review

  If **defer**: skip worklog update, skip the completion summary's worklog line, and append to the summary: `"Task verified. Run /finish-task again after PR review to mark done."`

### Marking done

If `.aicontext/worklog.md` doesn't exist, create it from `.aicontext/templates/worklog.template.md`.

Update `.aicontext/worklog.md`:
- If the task's spec isn't listed yet, add it under the appropriate section (In Progress / Done)
- Check off the task under its spec (`- [ ]` → `- [x]`)
- If all tasks under a spec are checked, move the spec from "In Progress" to "Done" with the current date
- If the task has no spec, add it under "Standalone Tasks" as checked with the current date

## 7. Resumed Run Detection

When finish-task is invoked on a task that was previously deferred (completion notes are non-empty and all plan steps are checked), this is a resumed run:

- Skip steps 1–4 (already done on first run)
- Run step 5 (git gates — there may be new commits from review fixes)
- Run step 6 — mark done silently (no ask, the user's `/finish-task` invocation is the signal)
- Output the completion summary

## 8. Output Completion Summary

**You MUST output this summary — it proves the task closed cleanly.**

```
Task {task-name} closed:
- Plan steps: N/N complete
- Task deliverables: N/N delivered (X deferred, Y revised)
- Spec requirements: N/M delivered (X deferred, Y revised)
- Worklog: updated (or "deferred")
- Git: {commit / push / PR / review loop results, or "skipped — step-level commits covered the task"}
```

Step 2 resolves every warning before reaching this summary. Deferred/revised counts record the user's resolution choices — auditable. Reaching Step 8 with unresolved warnings is an error: return to Step 2.

After the summary, append one handoff line based on worklog state:
- If deferred → `Run /finish-task again after PR review to mark done.`
- If the just-finished task's spec has other unchecked tasks in the worklog → `Spec '{Spec Name}' has more pending tasks. Next: '{next-task-name}'. Would you like to start it now?`
- Otherwise (spec complete, or no spec) → `Start the next feature with /start-feature.`

## 9. Tidy suggestion

After the handoff line, count task files in `.aicontext/tasks/` (Glob `*.md`). If >10, append: `Project has N task files. Run /tidy-aic to archive completed ones.`

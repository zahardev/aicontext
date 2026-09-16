# Close Task

Follow `process.md "Execution, finalization, and closure"` for administrative closure; do not run `after_task.*`, commit/push, inspect PRs, or fill completion notes.

## 1. Identify and Load

Follow `identify-task.md`. Load the task, linked spec, task-context if present, and worklog per Session Context Reuse.

## 2. Warn and Align

List unchecked plan steps and deliverables (legacy: Requirements) without blocking or checking them off. Follow `align-context.md` sections 3–4 for known spec decisions and task-context only; note new work as a follow-up without re-verifying the whole spec.

## 3. Mark Closed

- Set task `## Status:` to `Done` and update Last Updated.
- Mark the task complete in the spec's Tasks list without checking undelivered spec requirements.
- Check its worklog entry, creating the spec heading or Standalone Tasks entry if missing. Move a spec to Done with today's date only when all its tasks are closed.
- Preserve existing closure dates on repeated runs unless new work reopened the task. Do not duplicate entries.

## 4. Optional Issue Closure

Resolve `issue.close_on_task_close` via `ensure-config.md`; `false` skips all remote lookup.

Resolve only the task's issue:
- Prefer its explicit Issue link; a bare issue number requires a verified repository.
- No issue reference means silent skip. If a known issue needs a repository, inspect the Git remote URL. Use an explicit link's repository instead of assuming the current remote owns it.
- Support `github.com` initially. Report unsupported providers/unknown hosts without running `gh`; do not infer an issue from a PR URL.

Check the exact issue silently with `gh issue view "$issue" --repo "$repo" --json number,url,state`. Missing/already-closed issues mean silent skip; distinguish not-found from authentication/network failures and report failures briefly without undoing local closure.

For an open issue:
- `true`: close it.
- `ask`: ask `Close GitHub issue #{number}?` (Yes / No); only Yes authorizes closure. Offer to save the choice as default (default No) in the config source that supplied `ask`.

Run `gh issue close "$issue" --repo "$repo" --reason completed` only when authorized. Confirm the resulting state; failures must not be reported as success or prevent local closure.

## 5. Summary and Handoff

```
Task {task_name} closed:
- Plan steps: {complete}/{total} complete
- Task deliverables: {delivered}/{total} delivered
- Warnings: {unfinished work, or "none"}
- Worklog: updated
```

Append an issue result only for a proposed/performed action or a lookup failure/unsupported host.

If the spec has pending tasks, name the next one and append the active tool's `load-task` handoff; otherwise append `start-feature`. If more than 10 task files exist, suggest `tidy-aic` without running it.

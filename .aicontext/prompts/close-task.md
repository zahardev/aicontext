# Close Task

Follow `process.md "Execution, finalization, and closure"` for administrative closure; do not run `after_task.*`, commit/push, inspect PRs, or fill completion notes.

## 1. Identify and Load

Follow `identify-task.md`. Load the task, linked spec, task-context and worklog per Session Context Reuse.

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
- Identify the task's issue from its explicit Issue link or from the issue-id position in the configured `task_naming` pattern via `ensure-config.md`; a bare issue number requires a verified repository, and never guess arbitrary numbers from a filename without an issue-id position. A `task_naming` pattern without an issue-id position or still set to `ask` means no pattern-based identification: use the explicit Issue link only, and never resolve or ask for a naming pattern during closure.
- No issue identified means silent skip.
- If `issue.close_on_task_close` is `ask` and an issue is identified, ask `Close GitHub issue #{number}?` (Yes / No); No skips all issue resolution, and Yes follows the `true` path.
- If a known issue needs a repository, inspect the Git remote URL. Use an explicit link's repository instead of assuming the current remote owns it.
- Support `github.com` initially. When `issue.close_on_task_close` is `true` or `ask` was answered Yes, report unsupported providers/unknown hosts without running `gh`; never take the issue number from a PR.

Check the exact issue silently with `gh issue view "$issue" --repo "$repo" --json number,url,state`. Already-closed issues mean silent skip. When `issue.close_on_task_close` is `true` or `ask` was answered Yes, report one short line if a task's issue link is not found or lookup fails; local closure still completes.

For an open issue:
- `true` or `ask` answered Yes: close it without interaction.

Run `gh issue close "$issue" --repo "$repo" --reason completed` only when authorized. Confirm the resulting state; failures must not be reported as success or prevent local closure.

## 5. Summary and Handoff

```
Task {task_name} closed:
- Plan steps: {complete}/{total} complete
- Task deliverables: {delivered}/{total} delivered
- Warnings: {unfinished work, or "none"}
- Worklog: updated
```

Append an issue result only for a performed action or, when `issue.close_on_task_close` is `true` or `ask` was answered Yes, a lookup failure/unsupported host.

If the spec has pending tasks, name the next one and append the active tool's `load-task` handoff; otherwise append `start-feature`. If more than 10 task files exist, suggest `tidy-aic` without running it.

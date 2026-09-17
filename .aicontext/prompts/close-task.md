# Close Task

Administrative closure only: never run `after_task.*`, commit, push, inspect PRs, or fill completion notes.

## 1. Identify and Load

Follow `identify-task.md`. Load the task, linked spec, task-context and worklog per Session Context Reuse.

## 2. Warn and Align

List unchecked plan steps and deliverables (legacy: Requirements) without blocking or checking them off; a `Pending` task warns that nothing was implemented. Follow `align-context.md` sections 3–4 for known spec decisions and task-context only; note new work as a follow-up without re-verifying the whole spec.

## 3. Mark Closed

- Set task `## Status:` to `Done` and update Last Updated.
- Mark the task complete in the spec's Tasks list without checking undelivered spec requirements.
- Check its worklog entry, creating the spec heading or Standalone Tasks entry if missing. Move a spec to Done with today's date only when all its tasks are closed.
- Preserve existing closure dates on repeated runs unless new work reopened the task. Do not duplicate entries.

## 4. Optional GitHub Issue Closure

Read `issue.close_on_task_close` via `ensure-config.md`. `false` stops here; `ask` is answered in step 4, never saved as a config default.

1. Identify the GitHub issue from the task's explicit Issue link, or from the issue-id position in the already-configured `task_naming` pattern. Never resolve or ask for a naming pattern here, and never take the number from a PR.
2. No issue found: stop here, reporting one line with `true` and nothing with `ask`.
3. Determine the repository from an explicit link, otherwise from the Git remote. Non-GitHub or unknown hosts: report and stop before `gh`.
4. With `ask`, ask `Close GitHub issue #{number}?` (Yes / No). No stops here.
5. `gh issue view "$issue" --repo "$repo" --json number,url,state`. Already closed stops silently.
6. `gh issue close "$issue" --repo "$repo" --reason completed`, then confirm the state.

Report lookup or close failures in one line; local closure still completes.

## 5. Summary and Handoff

```
Task {task_name} closed:
- Plan steps: {complete}/{total} complete
- Task deliverables: {delivered}/{total} delivered
- Warnings: {unfinished work, or "none"}
- Worklog: updated
```

Append an issue line only for a performed action or a reported failure.

If the spec has pending tasks, name the next one and append the active tool's `load-task` handoff; otherwise append `start-feature`. If more than 10 task files exist, suggest `tidy-aic` without running it.

# Run Task

Execute pending steps, then finalize implementation. Own all automatic `after_task.*` actions; hand off administrative closure to `close-task`. See `process.md` for lifecycle rules.

## 1. Setup

1. Follow `identify-task.md`; load task, linked spec, task-context, and worklog per Session Context Reuse. Create missing task-context from its template.
2. Check status. If `Done` with no new work, report already closed and stop. If `Ready to close` and no new or resumed work exists, suggest `close-task`.
3. New or resumed work invalidates readiness and reopens local tracking. Set status `Implementing` before execution or a finalization retry; a `Pending` task starts here. Completed steps with this status proceed directly to Section 3.
4. Follow `ensure-config.md` with `after_step.*` only when steps need execution, plus `after_task.review`, `after_task.tests`, `after_task.commit`, `after_task.push`, `after_task.pr`, and `project.base_branch`. Resolve `after_task.review_loop` only when `after_task.pr` is Yes.

## 2. Execute

For each pending step, follow `step-loop.md` with resolved `after_step.*`; after `close-step`, return here without an interactive handoff. One-step plans use the same path.

## 3. Local Finalization

After all plan steps complete:

1. **Review** — if `after_task.review` is `normal` or `deep`, compute corpus (`{base-branch}...HEAD` plus uncommitted working tree). Pass the exact playbook: `normal` → `.aicontext/prompts/review.md`, `deep` → `.aicontext/prompts/deep-review.md`. Use `reviewer` where supported, otherwise follow inline.
2. **Fix and re-review** — address actionable findings, repeating review up to 5 total passes. Unresolved findings needing judgment or exhausted passes stop finalization.
3. **Tests** — follow `resolve-tests.md` with `after_task.tests` and `task` context. `ERROR` stops; `SKIP` continues; `COMMANDS` run through `test-runner` or inline. Fix clear failures and rerun affected checks; changes invalidating review return to review within the same budget. Unclear failures stop.
4. **Cumulative verification** — walk task deliverables and linked spec requirements, checking only genuinely completed items. Resolve unfinished in-scope work via deliver/defer/revise with the user. Deferred/revised scope must be recorded honestly, not falsely checked as delivered. Missing sections are noted, not invented.
5. Follow `verify-deliverables.md` for optional concrete behavioral checks. If verification added/resumed a step, return to Section 2 and then repeat local finalization. Otherwise continue.

## 4. Commit, Push, and PR

Only proceed after local finalization succeeds:

- **Commit** — if `after_task.commit` is Yes and task-scoped uncommitted changes exist, follow `.aicontext/prompts/commit.md`. Step commits do not suppress remaining changes. No changes means silent skip; failure stops.
- **Push** — if `after_task.push` is Yes, it authorizes this non-force push: verify branch/tracking state and push the current branch to its verified remote; detached HEAD, ambiguity, or failure stops. Independent of the commit gate.
- **PR** — if `after_task.pr` is Yes, follow `make-pr.md` and retain the resulting URL, repository, and head. Require success.
- **PR validation** — if the PR succeeded and `after_task.review_loop` is Yes, follow `.aicontext/prompts/gh-resolve-pr.md` with that target. `BLOCKED` stops finalization; `READY` continues. With `after_task.pr` false, skip it without searching for an existing PR.

## 5. Record and Report

Only after the selected pipeline succeeds, set status `Ready to close` and update Last Updated. Keep worklog/spec task entries open. Persist the status locally; if this leaves tracked metadata uncommitted, report it rather than making an extra unconfigured commit/push.

```
Task {task_name} implementation finalized:
- Plan steps: N/N complete
- Review/tests: {verified results or configured skips}
- Deliverables: {delivered/deferred/revised}
- Git/PR: {results, skips, or local metadata remaining}
- Status: Ready to close
```

Append the active tool's `close-task` handoff. On failure, report the specific blocker and leave status `Implementing`.

## Stop Conditions

Stop for unclear failures, critical findings without a clear fix, missing decisions, blocked remote operations, or manual prerequisites.

# Run Task

Execute pending steps, then finalize implementation. Own all automatic `after_task.*` actions; hand off administrative closure to `close-task`. See `process.md` for lifecycle rules.

## 1. Setup

1. Follow `identify-task.md`; load task, linked spec, task-context, and worklog per Session Context Reuse. Create missing task-context from its template.
2. Check status. If `Done` with no new work, report already closed and stop. If `Ready to close` and no pending, new, or resumed work exists, hand off to `close-task` unless re-finalization is requested.
3. Pending/new/resumed work invalidates readiness and reopens local tracking. Set status `Implementing` before execution or a finalization retry. Completed steps with this status proceed directly to Section 3.
4. Follow `ensure-config.md` with `tdd` and `after_step.*` only when steps need execution, plus `after_task.review`, `after_task.tests`, `after_task.commit`, `after_task.push`, `after_task.pr`, `after_task.review_loop`, and `project.base_branch`. Do not resolve issue-closure settings here.

## 2. Execute

For each pending step, follow `step-loop.md` with resolved `after_step.*`; after `close-step`, return here without an interactive handoff. One-step plans use the same path.

## 3. Local Finalization

After all plan steps complete:

1. **Review** — if `after_task.review` is `normal` or `deep`, compute corpus (`{base-branch}...HEAD` plus uncommitted working tree). Pass the exact playbook: `normal` → `.aicontext/prompts/review.md`, `deep` → `.aicontext/prompts/deep-review.md`. Use `reviewer` where supported, otherwise follow inline.
2. **Fix and re-review** — address actionable findings, repeating review up to 5 total passes. Unresolved findings needing judgment or exhausted passes stop finalization; report, don't mark readiness.
3. **Tests** — follow `resolve-tests.md` with `after_task.tests` and `task` context. `ERROR` stops; `SKIP` continues; `COMMANDS` run through `test-runner` or inline. Fix clear failures and rerun affected checks; changes invalidating review return to review within the same budget. Unclear failures stop.
4. **Cumulative verification** — walk task deliverables and linked spec requirements, checking only genuinely completed items. Resolve unfinished in-scope work via deliver/defer/revise with the user. Deferred/revised scope must be recorded honestly, not falsely checked as delivered. Missing sections are noted, not invented.
5. Follow `verify-deliverables.md` for optional concrete behavioral checks. If verification added/resumed a step, return to Section 2 and then repeat local finalization. Otherwise continue.

## 4. Commit, Push, and PR

Only proceed after local finalization succeeds:

- **Commit** — if `after_task.commit` is Yes and task-scoped uncommitted changes exist, follow `.aicontext/prompts/commit.md`. Step-level commits do not suppress remaining changes. No changes means silent skip; commit failure stops. If task code is uncommitted and publication is requested, stop to resolve it rather than publishing stale code.
- **Push** — if `after_task.push` is Yes, freshly verify branch/tracking state and push the current branch to its verified remote; detached HEAD, ambiguity, or failure stops. Independent of the commit gate.
- **PR** — if `after_task.pr` is Yes, follow `make-pr.md`. Its prerequisite push is authorized even if `after_task.push` is false. Require a successful PR creation/update result and retain its exact URL/repository/head.
- **PR review loop** — if `after_task.review_loop` is Yes and automatic PR creation/update succeeded, follow `.aicontext/prompts/gh-resolve-pr.md` with that target. `BLOCKED` stops finalization; `READY` continues. If `after_task.pr` is false, do not search for an existing PR: warn `PR review loop skipped: automatic PR creation/push is disabled.` and continue without it. Never reinterpret `review_loop` as authorization to create a PR.

All lifecycle flags govern automatic actions only; explicit skill invocations remain available.

## 5. Record and Report

Only after the selected pipeline succeeds, set status `Ready to close` and update Last Updated. Keep worklog/spec task entries open. Do not fill completion notes here. Persist the status locally; if this leaves tracked metadata uncommitted, report it rather than making an extra unconfigured commit/push.

```
Task {task_name} implementation finalized:
- Plan steps: N/N complete
- Review/tests: {verified results or configured skips}
- Deliverables: {delivered/deferred/revised}
- Git/PR: {results, skips, or local metadata remaining}
- Status: Ready to close
```

Append the active tool's `close-task` handoff. On failure, report the specific blocker and leave status `Implementing`; never claim completion or close an issue.

## Stop Conditions

Stop for unclear failures, critical findings without a clear fix, missing decisions, blocked remote operations, or manual prerequisites. Report the blocker and next action without changing status. Explicit `/close-task` remains available for administrative closure.

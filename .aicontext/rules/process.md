# Process Rules

*Workflow, lifecycle, and task/spec/task-context mechanics. For coding standards, AI behavior, safety, and output quality bars, see [standards.md](standards.md).*

## Task Lifecycle

### Starting a task

1. **Create a task file** in `.aicontext/tasks/` using `.aicontext/templates/task.template.md`. Follow `task_naming` in `.aicontext/config.yml` for the pattern; ask and update config if unclear. Skip task files only for trivial changes (typo fixes, single-line edits).
2. Read `.aicontext/project.md` for current project state and `.aicontext/structure.md` before creating files/folders.
3. Check dependencies, review related code and existing tests, and consider impact on database schema, API contracts, third-party integrations.
4. Ask clarifying questions and complete the question phase before implementation.
5. Research latest best practices if applicable; link to official docs.
6. Get explicit permission before creating the implementation plan.

**Task file is the source of truth.** In-session tools (Claude Code todo list, Cursor agent tasks) supplement real-time progress — the task file persists.

**Date format:** task files use `Month Day, Year` (e.g., "January 23, 2026"); changelog entries use `YYYY-MM-DD`. Always use the current real date.

**Error handling:** document bugs, root causes, and resolution steps inside the task file.

## Implementation Permission Protocol

**CRITICAL:** The plan lives in the task file, not inline in chat. Do not write code until the user explicitly initiates execution — `/run-task`, `/run-step`, `/close-step`, or a direct go-ahead after the task file is visible.

Do not paste the plan into chat for approval — creating the task file IS the plan presentation. The user reviews the file and initiates execution when ready.

## Spec Lifecycle

Specs are the current contract — not a changelog. Delete requirements and decisions when they no longer apply or are no longer being defended. Task-context and git history preserve the rationale; spec stays clean.

## Task Deliverables vs Spec Requirements

| Layer | Location | Answers |
|---|---|---|
| Spec requirements | `spec-{name}.md` `## Requirements` | What must the system do? (broad, durable) |
| Task deliverables | `{task-file}.md` `## Deliverables:` | What must this work bundle deliver to be done? |

Task deliverables are the **definition of done for this work bundle** — not a translation of spec requirements. Four categories:

- **Scoped spec delivery** — slices of spec requirements this bundle satisfies
- **Process artifacts** — outputs the bundle must produce ("audit captured in task-context")
- **Constraints** — guardrails for this bundle ("no behavior regression", "backwards compatible")
- **Drive-by fixes** — small unrelated fixes bundled in

Only the first category overlaps with the spec; the other three belong nowhere else. Deliverables can grow mid-task — `/add-step` offers to add one when a new step extends scope.

**Granularity:** deliverables are *checkable at close time* — by reviewing the final state of code, docs, or behavior. Drive-by fixes legitimately name files and lines; that's not "too small".

**Phrasing:**
- Use "should" voice — target state, not description
- Follow the Information Density rule in `standards.md` — be concise without dropping signal

**Checkbox timing:** `close-step` checks off only what a step delivered 100% unambiguously. `finish-task` walks task deliverables (unchecked = hard block) then spec requirements in linked subsections (unchecked = warning). Warnings resolve via one contract: **deliver** / **defer** / **revise**. Task deliverables are the gate; spec checkboxes are the consequence.

**Spec drift:** `/check-task` runs `git log` (file-level) and AI semantic comparison (coverage) — both when possible. Git catches edits, semantic catches mismatches a git-untouched spec can still have.

## Context Discipline

### Targeted reads

When you need only a slice of a large file (`spec*.md`, `worklog.md`, `CHANGELOG.md`, multi-step task files, prompts), use the cheapest tool that gets you what you need:

- **A named subsection** → `Grep` for the heading, then `Read` with `offset`/`limit` around the match.
- **Recent changes** → `git log --since=<date> -- <path>` and `git diff <ref> -- <path>` instead of re-reading the file.
- **A single symbol** → `Grep` for the symbol with `-n`, then `Read` the surrounding lines only.

### Tool output handling

Large tool output lives in conversation history forever — every subsequent turn pays the cost. A 2000-line test log shipped inline costs ~10× a one-line `## Result: FAIL` summary plus a path the AI can `Read` if needed.

- Bash commands likely to produce >50 lines: pipe to `/tmp/{name}.log`, then `Grep` or `Read` with `offset`/`limit` for the slice you need.
- For test runs, prefer the `test-runner` subagent (which filters output to failures + diagnostics).
- For repository-wide searches, prefer `Grep` with `head_limit` over piping `find` output.
- When forced to run a long command inline (e.g. for debugging), summarize the takeaway in your reply rather than letting the raw output stand.

### Task-context content boundary

Task-context files MUST NOT restate spec content. The spec is the single source of truth for what the system currently does and why; task-context holds *in-flight working knowledge that doesn't fit the spec contract* — codebase patterns discovered during exploration, gotchas, file references, debug notes. Before writing to a task-context, ask: *would this belong in the spec instead?* If yes, write it to the spec and link from the task-context — never both. See Spec Lifecycle above for what happens when a decision is superseded.

## Worklog

`.aicontext/worklog.md` tracks spec/task status and the ideas backlog.

### After task completion

Update `worklog.md` — check off the task under its spec, or add to Standalone Tasks if no spec.

### Ideas backlog

`worklog.md` has an `## Ideas` section — a lightweight backlog for deferred ideas that arise during sessions.

**Format:** `- [type] description — optional context`
**Types:** `spec` (new feature), `task` (bounded work), `step` (addition to current task). Type is optional.

**When to suggest it:** When an idea surfaces that isn't the current task, suggest: `"Use /add-idea to capture this so it's not lost."` Common triggers:
- "We should also refactor X while we're at it" — out of scope for the current task
- "What if we added Y at some point?" — not ready to plan yet
- "This reminds me, we should probably..." — tangential improvement

**Promoting ideas:** When an idea matures, use `/start-feature` (spec), `/create-task` (task), or `/add-step` (step) to formalize it, then remove the line from the Ideas section. Remove abandoned ideas too.

## Test-Driven Development

### Workflow
1. Write failing test
2. Implement the feature
3. Verify test passes
4. Move to next step

### Rules
- Update existing tests instead of creating duplicates when possible
- Test the specific step being implemented, not all functionality at once
- **Quality over quantity:** essential, meaningful tests only
- **Test behavior, not implementation:** what the feature does, not how
- **Multi-step features:** interleave — test + implement Feature A, then test + implement Feature B. Don't write all tests upfront.

## Task Planning Guidelines

### TDD-Aware Planning

Before writing plan steps, check if the project has tests (glob for test files). If tests exist:

1. **Assess each step** — is it testable? (Config changes, template edits, docs are not. Behavior-adding steps usually are.)
2. **Testable steps follow test-first** — the step includes writing the test before the implementation, not as a separate step after.
3. **Prefer unit tests per step, integration and E2E tests as final verification** when both patterns exist in the project.

If the project has no tests, skip TDD and implement directly.

### Plans Must Describe WHAT, Not HOW

Task steps describe what to build or change — behavior descriptions belong in the spec, implementation details are discovered during implementation.

**Good:**
- "Add user authentication endpoint"
- "Add update check step to start.md"

**Bad:**
- "Create UserController with login() method using Library X"
- "If update available: show notification, then ask 'Would you like to upgrade?' (Yes / Not now)"

### Checkbox Format
- Use `- [ ]` for unchecked items; never `- [x]` in initial plans
- Order steps by dependency — a step cannot depend on a later step
- When executing steps manually (not via `/run-task`), stop after each step and wait for permission

### Never include spec or task-context updates as plan steps

Spec sync, task-context updates, requirement checkboxes, worklog updates, and spec completion are handled automatically by `close-step.md` and `finish-task.md`. Listing them as explicit plan steps is redundant and pollutes the plan.

**Bad:** "Update spec with new decision", "Append findings to task-context", "Check off completed requirements in spec"
**Good:** omit them — they happen automatically at step/task close.

### Never include manual human steps in plans

Plans are for the agent. If the agent cannot execute a step, it is not a plan step. This includes: manual verification, manual testing, manual QA, user approvals, "check in browser", "verify UX", "ask product team", etc.

Automated test runs via the `test-runner` subagent are agent actions and happen during the step inner loop (see `step-loop.md`), not as separate plan steps — this rule is about *manual* testing only.

Human verification belongs in task deliverables (as a checkbox gate the user ticks) or as an interactive question at step/task close, never as a plan step.

**Bad:** "Manually test the login flow", "User verifies the UI looks right", "Get approval from stakeholder"
**Good:** put the verification in task deliverables, or have the AI ask the user interactively at close time.

## Quality Checks

Lifecycle actions (code review, tests, commit, push) are configured in `.aicontext/config.yml` under `after_step` and `after_task`. Review/tests take scope values (`normal | deep | false | ask`); commit/push take boolean values (`true | false | ask`). `ask` prompts upfront at `/run-step` or `/run-task` entry. Edit the config to customize your workflow.

### Review Response Rules

When a quality check returns findings, use this table to decide what to fix:

| Severity | Effort | Action |
|----------|--------|--------|
| High | Any | Fix |
| Medium | Low | Fix |
| Medium | High | Fix |
| Low | Low | Fix |
| Low | High | Skip — note in task-context |
| False positive | — | Resolve / dismiss |

## Checkbox Discipline

Before checking off any item (`- [ ]` → `- [x]`), re-read its description and verify the work fully matches what it says. A partial implementation is not done — leave it unchecked and note what remains. This is the operational rule for "mark complete only when done" — applies to plan steps, task deliverables, and spec requirements alike.

## Version Management

### Code Versioning
Each new task means a new version. Increment version yourself if not specified:
- Feature: update second number (1.2.0 → 1.3.0)
- Bug/minor improvement: update third number (1.2.0 → 1.2.1)

### Version Update Timing
- **NEVER** update the script version during implementation steps
- **ONLY** update the version as the final step before marking the entire version as complete

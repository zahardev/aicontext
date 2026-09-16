# Development Model

AIContext follows [Spec Driven Development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) — the spec precedes and outlives implementation. Requirements are written in domain language, not tied to code structure, and survive refactors. Tasks are ephemeral delivery vehicles; the spec is the durable contract.

Work is organized in three layers that keep the AI aligned across sessions, features, and team members.

## The Three Layers

```
Spec (what & why)  →  Task (how & progress)  →  Task-Context (working knowledge)
```

### Spec

**File:** `.aicontext/specs/spec-{name}.md`

A spec defines *what* to build and *why*. It contains:
- **Problem** — what is broken, painful, or missing
- **Solution** — high-level approach
- **Requirements** — what the system must do, as checkbox items grouped by subsection with `*Implemented by:*` footers linking to tasks
- **Decisions** — architectural choices with reasoning
- **Non-goals** — what is explicitly out of scope
- **Tasks** — links to task files that implement this spec

Specs contain no file paths or implementation details — they survive refactors. One spec can have multiple tasks.

**Created by:** `/start-feature`
**Updated by:** `/run-task`, `/do-it`, `/align-context`, `/close-task`

### Task

**File:** `.aicontext/tasks/{version}-{name}.md`

A task defines *how* to build it and tracks *progress*. It contains:
- **Spec link** — which spec this implements
- **Objective** — what this task accomplishes
- **Deliverables** — definition of done for this work bundle
- **Plan** — step-by-step with checkboxes (`- [ ]` / `- [x]`)
- **Status** - `Implementing` → `Ready to close` → `Done`
- **Completion Notes** - valuable step-attributed outcomes, compromises, learnings, and follow-ups; blank if nothing useful

The AI checks off delivered steps and writes notes at step closure. `/run-task` finalizes implementation after all steps; `/close-task` closes tracking separately without blocking on unfinished work or inspecting PRs. Legacy `/finish-task` forwards to `/close-task`.

**Created by:** `/start-feature`, `/plan-tasks`
**Updated by:** `/run-task`, `/do-it`, `/align-context`, `/close-task`

### Task-Context

**File:** `.aicontext/data/task-context/context-{task-filename}`

The task-context is the AI's working memory. After each step, the AI appends what it learned:
- **Codebase Patterns** — conventions and patterns discovered
- **Gotchas** — non-obvious issues or constraints
- **Decision Overrides** — spec decisions superseded mid-task (old + why)

Entries are concise (1-2 lines), prefixed with `[Step N]`, and never deleted — only appended. Later entries take precedence.

The task-context is gitignored but never auto-deleted. If you start a new session weeks later, `/load-task` reads the task-context and the AI picks up where it left off.

**Created by:** `/run-task`, `/do-it`, `/align-context`
**Updated by:** `/run-task` (after each step), `/do-it`, `/align-context`

## How They Work Together

### New Feature Flow

```
/start-feature  →  Spec + Task(s)
                        ↓
                  /run-task on Task 1
                        ↓
              Task-context accumulates knowledge
                        ↓
                  /close-task on Task 1
                        ↓
                  /run-task on Task 2 (task-context carries over or new one created)
                        ↓
                  /close-task on Task 2
                        ↓
              All tasks done → Spec moves to Done in worklog
```

### Session Restart

```
New session → /start → /load-task
                           ↓
                    Reads: Spec → Task-Context → Task
                           ↓
                    "You left off at Step 4. Steps 1-3 done.
                     Task-context has: [patterns, gotchas, decisions].
                     Spec has: [requirements not yet covered by steps]."
                           ↓
                    /run-task continues from Step 4
```

### Requirement Coverage

Whenever the AI adds a requirement to the spec — during `/run-task`, `/do-it`, or `/align-context` — it immediately checks if the requirement is covered by a task step. If not, it proposes adding a step or creating a separate task.

`/load-task` also runs a full drift scan as a safety net for changes made in prior sessions.

## Worklog

**File:** `.aicontext/worklog.md`

The worklog tracks the status of all specs and tasks:

```markdown
## In Progress

### [Feature Name](specs/spec-name.md)
- [x] [task-1](tasks/task-1.md)
- [ ] [task-2](tasks/task-2.md)

## Done

### [Completed Feature](specs/spec-other.md) — 2026-04-01
- [x] [task-3](tasks/task-3.md)

## Standalone Tasks

- [x] [small-fix](tasks/small-fix.md) — 2026-03-15
```

The worklog is AI-generated (not created by the CLI) and gitignored. `/close-task` updates it when closing a task. `/align-context` fixes it if it's stale.

## Quality Checks

Quality checks are configured in `.aicontext/config.yml` under `after_step` and `after_task`. Review and tests take scope values (`normal` | `deep` | `false` | `ask`); commit, push, PR, and review-loop actions take boolean values (`true` | `false` | `ask`).

When set to `ask`, the AI prompts at the start of `/run-task` or `/run-step` with user-friendly options (e.g., "Normal review — this step's changes" or "Deep review — architecture + correctness") and offers to save your choice as the default.

When findings are returned, the AI assesses each by severity and effort:

| Severity | Effort | Action |
|----------|--------|--------|
| High | Any | Fix |
| Medium | Low/High | Fix |
| Low | Low | Fix |
| Low | High | Skip — note in task-context |
| False positive | — | Dismiss |

## Lifecycle and Commit Configuration

Lifecycle and commit settings live in `.aicontext/config.yml`. Personal overrides go in `config.local.yml` (gitignored).

**Lifecycle actions** under `after_step` and `after_task` — same vocabulary at both timings. Review and tests take scope values (`normal` | `deep` | `false` | `ask`); commit, push, PR, and review-loop actions take boolean values (`true` | `false` | `ask`). `ask` fires upfront at `/run-step` or `/run-task` entry with a two-stage prompt (Stage 1: pick action with timing-specific recommendation; Stage 2: save as default?). Once answered, the run proceeds unattended.

- `after_step.review` / `tests` / `commit` — fire after each step
- `after_task.review` / `tests` / `commit` / `push` / `pr` / `review_loop` - run only inside `/run-task` after all plan steps, never during `/close-task`

New/defaulted `after_task.review` is `deep`; existing settings are preserved. `after_task.commit` commits remaining changes even after step commits; no changes means skip. `after_task.push` is independent. `pr` authorizes PR creation/update and its prerequisite push. `review_loop` invokes `pr-review-loop` for CI, reviews, and mergeability only after automatic PR success. All flags govern automatic invocation only.

Issue closure belongs to `/close-task` through `issue.close_on_task_close: true | false | ask` (default `ask`). No PR inspection or publication occurs during closure.

The `reviewer` subagent receives an explicit corpus based on commit state: working-tree diff for uncommitted steps, last commit (`HEAD^..HEAD`) for committed steps, branch diff (`{base-branch}...HEAD` + uncommitted working tree) for implementation finalization.

**Commit format** under `commit`:
- `commit.template`: description / description (#issue_id) / type: description / custom
- `commit.body`: true (subject + body + trailer) / false (subject only)
- `commit.co_authored_trailer`: template for the Co-Authored-By trailer

All commits use `commit.md`; administrative closure does not commit.

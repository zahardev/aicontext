# Development Model

AIContext organizes work in three layers that keep the AI aligned across sessions, features, and team members.

## The Three Layers

```
Spec (what & why)  →  Task (how & progress)  →  Brief (working knowledge)
```

### Spec

**File:** `.aicontext/specs/spec-{name}.md`

A spec defines *what* to build and *why*. It contains:
- **Problem** — what is broken, painful, or missing
- **Solution** — high-level approach
- **Requirements** — what the system must do, detailed enough for task creation (plain list, no checkboxes)
- **Decisions** — architectural choices with reasoning
- **Non-goals** — what is explicitly out of scope
- **Tasks** — links to task files that implement this spec

Specs contain no file paths or implementation details — they survive refactors. One spec can have multiple tasks.

**Created by:** `/start-feature`
**Updated by:** `/run-task` (syncs new decisions/requirements), `/do-it`, `/align-context`, `/finish-task`

### Task

**File:** `.aicontext/tasks/{version}-{name}.md`

A task defines *how* to build it and tracks *progress*. It contains:
- **Spec link** — which spec this implements
- **Objective** — what this task accomplishes
- **Plan** — step-by-step with checkboxes (`- [ ]` / `- [x]`)
- **Commit Rules** — optional per-task override of project commit settings
- **Completion Notes** — what was built, compromises, follow-ups

The AI checks off steps as it goes. When all steps are done, `/finish-task` closes it out.

**Created by:** `/start-feature`, `/plan-tasks`
**Updated by:** `/run-task`, `/do-it`, `/align-context`

### Brief

**File:** `.aicontext/data/brief/brief-{task-filename}`

The brief is the AI's working memory. After each step, the AI appends what it learned:
- **Codebase Patterns** — conventions and patterns discovered
- **Gotchas** — non-obvious issues or constraints
- **Decision Overrides** — spec decisions superseded mid-task (old + why)
- **File References** — files created or modified
- **Bugs & Issues** — errors encountered and solutions
- **Testing** — test results and coverage

Entries are concise (1-2 lines), prefixed with `[Step N]`, and never deleted — only appended. Later entries take precedence.

The brief is gitignored but never auto-deleted. If you start a new session weeks later, `/check-task` reads the brief and the AI picks up where it left off.

**Created by:** `/run-task`, `/do-it`, `/align-context`
**Updated by:** `/run-task` (after each step), `/do-it`, `/align-context`

## How They Work Together

### New Feature Flow

```
/start-feature  →  Spec + Task(s)
                        ↓
                  /run-task on Task 1
                        ↓
              Brief accumulates knowledge
                        ↓
                  /finish-task on Task 1
                        ↓
                  /run-task on Task 2 (brief carries over or new brief created)
                        ↓
                  /finish-task on Task 2
                        ↓
              All tasks done → Spec moves to Done in worklog
```

### Session Restart

```
New session → /start → /check-task
                           ↓
                    Reads: Spec → Brief → Task
                           ↓
                    "You left off at Step 4. Steps 1-3 done.
                     Brief has: [patterns, gotchas, decisions].
                     Spec has: [requirements not yet covered by steps]."
                           ↓
                    /run-task continues from Step 4
```

### Requirement Coverage

Whenever the AI adds a requirement to the spec — during `/run-task`, `/do-it`, or `/align-context` — it immediately checks if the requirement is covered by a task step. If not, it proposes adding a step or creating a separate task.

`/check-task` also runs a full drift scan as a safety net for changes made in prior sessions.

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

The worklog is AI-generated (not created by the CLI) and gitignored. `/finish-task` updates it when closing a task. `/align-context` fixes it if it's stale.

## Quality Checks

The quality checks table in `.aicontext/rules/process.md` defines what runs when:

| Check | After Step | After Task |
|-------|------------|------------|
| Code review | Yes | No |
| Step-related tests | Yes | No |
| Standards check | No | Yes |
| Full test suite | No | Yes |

Edit this table to customize your workflow. `/run-task` reads it at runtime.

When findings are returned, the AI assesses each by severity and effort:

| Severity | Effort | Action |
|----------|--------|--------|
| High | Any | Fix |
| Medium | Low/High | Fix |
| Low | Low | Fix |
| Low | High | Skip — note in brief |
| False positive | — | Dismiss |

## Lifecycle and Commit Configuration

Lifecycle and commit settings live in `.aicontext/config.yml`. Personal overrides go in `config.local.yml` (gitignored).

**Lifecycle actions** under `after_step` and `after_task` — same vocabulary at both timings. Review and tests take scope values (`partial` | `full` | `false` | `ask`); commit and push take boolean values (`true` | `false` | `ask`). `ask` fires upfront at `/run-step` or `/run-task` entry with a two-stage prompt (Stage 1: pick action with timing-specific recommendation; Stage 2: save as default?). Once answered, the run proceeds unattended.

- `after_step.review` / `tests` / `commit` — fire after each step
- `after_task.review` / `tests` / `commit` / `push` — fire at task close

`after_task.commit` is skipped automatically if any step committed during the run — step-level commits already cover the work. `after_task.push` fires independently so step-level commits still reach the remote.

The `reviewer` subagent receives an explicit corpus based on commit state: working-tree diff for uncommitted steps, last commit (`HEAD^..HEAD`) for committed steps, branch diff (`{base-branch}...HEAD` + uncommitted working tree) for task close.

**Commit format** under `commit`:
- `commit.template`: description / description (#issue_id) / type: description / custom
- `commit.body`: true (subject + body + trailer) / false (subject only)
- `commit.co_authored_trailer`: template for the Co-Authored-By trailer

All commits go through `commit.md` — the single commit codepath. Other prompts (`finish-task`, `run-task`, `do-it`) delegate to it.

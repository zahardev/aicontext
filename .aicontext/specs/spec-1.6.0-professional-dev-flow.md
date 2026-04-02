# Spec: Professional Development Flow

## Problem

The current AIContext workflow has five structural gaps that slow down development and reduce code quality:

1. **No structured discovery.** Between describing a task and creating the task file, there is no systematic interview process. Users compensate by manually asking "any other questions?" — the user is doing the AI's job.

2. **No automation between steps.** Every `/next-step` requires the user to sit, wait for completion, then manually type the command. Tests don't auto-run, reviews don't auto-trigger, commits don't auto-happen.

3. **Duplicated instructions across tools.** Skills (Claude Code), prompts (Cursor), and instructions (Copilot) contain the same content in different locations. When one is updated, the others go stale. Cursor and Copilot users get a degraded experience because their prompts are weaker copies.

4. **No configurable quality gates.** There are no rules for when to run tests, reviews, or standards checks relative to steps and tasks. It depends entirely on user discipline to invoke the right skill at the right time.

5. **Manual review cycles.** After a PR is created, CodeRabbit (or other reviewers) creates comments. The user must manually fetch them, triage, dismiss false positives, fix real issues, push, wait for re-review, and repeat — often 5-6 cycles.

## Solution

A unified development flow with three pillars:

### Pillar 1: Unified Prompts

Move all instructions to `.aicontext/prompts/` as the single source of truth. Claude Code skills, agents, Cursor rules, and Copilot instructions become thin wrappers that reference prompts. One set of instructions serves all tools.

### Pillar 2: Structured Planning and Execution

- **`/start-feature`** — a skill that runs a structured discovery interview: asks questions one at a time, explores the codebase instead of asking when the answer is available. For each decision point, presents options with pros/cons and its own recommendation — so the user confirms or picks an alternative, rather than asking follow-up questions. Always creates a spec + task. Covers two dimensions:
  - **Product**: scope, non-goals, edge cases, user-facing behavior, requirements
  - **Engineering**: technology choices, code design (patterns, data structures, interfaces), integration with existing code, API contracts, performance implications, error handling strategy, testing approach

  Always creates a spec + task file. Small work that doesn't need a spec is handled via direct conversation, not `/start-feature`.
- **Spec files** — a new document type (`.aicontext/specs/`) for complex features that captures the "what" and "why" (problem, solution, requirements, decisions, non-goals). Tasks reference specs and track the "how" and progress.
- **`/run-steps`** — a new skill that automates step execution: implements step, runs quality checks per configurable table, commits if configured, proceeds to next step. One agent implements all steps inline, accumulating understanding across steps. Delegates read-only tasks (tests, reviews, standards checks) to subagents where available, then assesses findings and fixes what makes sense.
- **Brief file** — a gitignored file (`.aicontext/data/brief/`) that serves as accumulated technical knowledge and session handoff document. The agent appends findings after each step. If the user starts a new session mid-task, the brief carries context forward. Created at loop start by `/run-steps`. Never auto-deleted — the user removes it manually when no longer needed, which enables reopening a task weeks later with full context intact.
- **`/check-task` (updated)** — now reads the three-layer context: spec (what/why) → brief (technical knowledge) → task (plan/progress). Enables seamless session restart mid-task.
- **`/finish-task`** — a new skill that closes out a completed task: verifies all steps are done, syncs spec with decisions from brief, fills completion notes, updates worklog, and handles git (commit / push / PR) per configurable `finish_action`.

### Pillar 3: Review Automation

- **`/gh-review-fix-loop`** — a new skill that automates the PR review cycle: fetch review comments, triage (fix/resolve/skip), dismiss false positives, fix real issues, run tests, commit, push, wait for re-review, repeat until clean or max cycles reached (default: 5, configurable).

## Requirements

### Unified Prompts
- All skill instructions live in `.aicontext/prompts/*.md`
- All Claude Code skills (`.claude/skills/*/SKILL.md`) are thin wrappers referencing prompts
- All Codex skills (`.codex/skills/*/SKILL.md`) are thin wrappers referencing prompts
- Claude Code agents with universal instructions (`reviewer`, `standards-checker`, `test-writer`) reference prompts. Tool-specific agents (`test-runner`, `researcher`) keep instructions inline.
- `.cursor/rules/aicontext.mdc` references prompts with `use <name>` invocation pattern
- `.github/copilot-instructions.md` references prompts with `use <name>` invocation pattern
- No instruction duplication between prompts and skills/agents
- Unified invocation: Claude Code (`/command`), Codex (`use command`), Cursor (`use command`), Copilot (`use command`)
- Existing skills work identically after restructuring
- `aicontext update` always adds new prompts; asks before overwriting existing ones; skips the question if no prompts are present yet

### /start-feature Skill
- Runs structured discovery interview: one question at a time, explores codebase instead of asking when answer is available
- For each decision point: presents options with pros/cons and its own recommendation (user confirms or picks alternative — minimizes back-and-forth)
- Covers product dimension: scope, non-goals, edge cases, user-facing behavior, requirements
- Covers engineering dimension: technology choices, code design (patterns, data structures, interfaces), integration with existing code, API contracts, performance implications, error handling strategy, testing approach
- Always creates spec + task file (no complexity assessment — if work is too small for a spec, use direct conversation instead of `/start-feature`)
- Creates task file with upgraded template (spec reference, plan steps, completion notes)
- Cross-references spec from task and vice versa

### Spec Files
- `.aicontext/specs/` directory exists and is documented in structure.md
- Spec template defined with sections: Problem, Solution, Requirements (plain list), Decisions, User Stories (optional), Non-goals
- Specs contain no file paths or implementation details (survive refactors)
- Specs cross-reference their task files

### Upgraded Task Template
- No requirements or out-of-scope sections (both live in the spec, not the task)
- Includes spec reference (when applicable)
- Retains: plan steps, completion notes (follow-ups, compromises, learnings)
- Bugs & issues and testing checklists move to the brief file
- Per-task commit rules override (`## Commit Rules:` section with `commit_mode`, `commit_template`, `finish_action`)

### /run-steps Skill
- Creates brief file at loop start if it doesn't exist (from template); reads it first if it does
- Reads task commit config first, falls back to `project.md` defaults; if neither configured, asks before starting
- Brief contains: references to spec/task/rules, codebase patterns, gotchas, decisions, file references
- Each step follows this inner loop (N = plan step number):
  1. Implement the step
  2. Run review (per quality checks table) → assess findings (severity x effort)
  3. Fix actionable issues
  4. Re-review to verify fixes didn't introduce new issues (max 5 inner iterations, then stop and let user decide)
  5. When review is clean: run step-related tests (if they exist)
  6. If tests fail: fix and re-run
  7. When tests pass: commit if configured, update task file
  8. Append findings to brief prefixed `[Step N]` — **required gate, do not advance until done**
  9. Scan new brief entries for spec-level decisions; update spec if found
- One agent implements all steps inline, accumulating full context
- Delegates read-only tasks (tests, reviews, standards checks) to subagents where available (Claude Code)
- Assesses subagent findings and fixes issues itself
- Stops when: all steps done, tests fail and can't fix, critical review issue, needs user input
- If user starts a new session mid-task: `/check-task` reads brief and resumes
- When all steps done: notifies user to run `/finish-task`

### Quality Checks Table
- Configurable table in `process.md` with columns: Check, After Step, After Task, Skill (Yes/No values)
- Default configuration: code review after step, step-related tests after step, standards check after task, full test suite after task
- Response rules table for handling review findings (severity x effort = action)
- Users can edit the table to customize their workflow
- `/run-steps` reads and follows the table

### Commit Configuration
- Project-level defaults in `project.md` `## Commit Rules`: `commit_mode`, `commit_template`, `finish_action`
- Per-task override in task file `## Commit Rules:` section (same fields); `/run-steps` reads task file first, falls back to `project.md`
- Modes: manual, per-step, per-task
- Default commit_template: `description`; when asking offers 4 options — `description`, `description (#issue_id)`, `type: description` (conventional commits), Custom
- `finish_action` options: `nothing` | `commit` | `commit+push` | `commit+push+pr`
- If commit rules not configured: `/run-steps` asks at start, offers to save to `project.md` (team) or `local.md` (personal) or not at all; `/start-feature` asks for per-task preference and saves to task file
- Overridable in `local.md` per developer

### Brief File
- Template at `.aicontext/templates/brief.template.md`
- Instance location: `.aicontext/data/brief/brief-{task-filename}` — e.g. `brief-1.6.0-dev-flow-v2.md` (mirrors task filename, always derivable without reading any file)
- Gitignored (`.aicontext/data/brief/` in `.gitignore`)
- Never auto-deleted — user removes manually when no longer needed
- Contains "How to Use This File" section with rules:
  - Read ALL files in References before starting work
  - After each step, append findings to the appropriate section
  - Write: codebase patterns, gotchas, decisions, file references
  - Skip: obvious things already in the codebase
  - Never delete or modify existing entries — only append new ones
  - Keep entries concise — 1-2 lines each, distilled knowledge, not a log
  - Later entries are more recent and take precedence over earlier ones
  - Prefix each entry with plan step number: `- [Step N] ...`
- Contains References section (links to spec, task, rules, project, structure, local)
- Contains Codebase Patterns section (accumulated across steps)
- Contains Gotchas section (accumulated across steps)
- Contains Decisions section (key decisions from conversation and implementation)
- Contains File References section (accumulated across steps)
- Contains Bugs & Issues section (errors encountered, root causes, solutions — moved from task file)
- Contains Testing section (test results, what was tested, what's passing/failing — moved from task file)

### /finish-task Skill
- Verifies all plan steps are checked; prompts user if any remain open
- Reads spec and brief side by side — elevates any unsynced brief decisions to spec
- Marks task as complete in spec's `## Tasks` section
- Fills `## Completion Notes:` in task file
- Updates `.aicontext/worklog.md` — checks off task, moves spec to Done if all tasks complete
- Checks git for uncommitted changes; runs `finish_action` from task or project config (or asks if not set)
- `finish_action` options: `nothing` | `commit` | `commit+push` | `commit+push+pr`

### /gh-review-fix-loop Skill
- Reads task file, spec (if linked), and brief (if exists) before starting — full context for triage
- Fetches review comments using existing `pr-reviews.js` script
- Triages each comment: fix, resolve (false positive), skip (waiting for human)
- Auto-resolves false positives via `pr-resolve.js`
- Fixes real issues in code
- Runs tests to verify fixes
- Commits and pushes
- Captures review comment count before pushing
- After push, polls every 60 seconds for comment count change (new review detected)
- If no new review within 30 minutes, considers cycle done
- Repeats until no fixable issues remain or max cycles reached (default: 5)
- Works with any GitHub review bot (CodeRabbit, etc.) and human reviewers
- After loop: elevates any architectural decisions from reviewer feedback to spec

### /check-task Skill (Updated)
- Reads three-layer context: spec → brief → task
- If spec exists for the task: reads it first for requirements and decisions
- If brief exists for the task: reads it for accumulated technical knowledge
- Reads task file for plan, progress, and current state
- Reads source files related to the task
- Surfaces ambiguities, conflicts, and resume context
- Detects spec↔task drift: identifies spec requirements not covered by any task step. For each uncovered requirement, assesses whether it's related to the current task or a different topic. Offers to add steps for related requirements, or create a separate task for unrelated ones.
- Enables seamless session restart: new session → `/check-task` → agent is caught up
- Backwards compatible: works with pre-1.6.0 tasks that have no spec or brief (reads task file only)

### /do-it Skill
- Crystallizes a conversation discussion into a task step and implements it
- Adds a new step to the current task file with sub-items based on what was discussed
- Updates the spec if the discussion introduced new requirements, decisions, or non-goals
- Immediately implements the step (follows the same inner loop as `/run-steps`: implement → review → test → update brief)
- Requires an active task — asks user to identify one if unclear
- Available as `/do-it` (Claude Code) and `use do-it` (Codex, Cursor, Copilot)

### /align-context Skill
- Updates all context files (task, spec, brief, worklog) to reflect current state of work
- Task file: checks off completed steps, updates Last Updated date
- Spec: adds missing decisions, requirements, non-goals from current session
- Brief: appends patterns, gotchas, decisions, file references from current session; creates brief if missing
- Worklog: adds missing entries, updates task checkboxes, moves completed specs to Done; creates worklog if missing
- When adding a new spec requirement, checks if it's covered by a task step — adds step if not
- Fixes everything silently, then provides a short report of what changed
- Available as `/align-context` (Claude Code) and `use align-context` (Codex, Cursor, Copilot)

### Worklog
- `changelog.md` renamed to `worklog.md` — tracks spec and task statuses, not just completion dates
- Format: specs grouped by status (In Progress / Done), with task checkboxes under each spec
- Standalone tasks (no spec) go under a separate section
- During `aicontext update`: inject deprecation notice into existing `changelog.md` (worklog.md is not created by CLI)
- `worklog.md` is generated by the AI — either via `generate.md` on first session, or by `/finish-task` / `/start-feature` if it doesn't exist
- `worklog.md` is gitignored (same as `project.md`)
- `/finish-task` updates `worklog.md` instead of `changelog.md`
- Template at `.aicontext/templates/worklog.template.md`

### Process Rules Updates
- Quality checks timing table added to `process.md`
- Quality check response rules added to `process.md`
- Commit rules section added to `project.md` template

### /prepare-release Skill (Updated)
- If `.aicontext/release.md` is missing: run first-run interview (discover first, ask only what can't be determined automatically)
- First-run discovery scans for: version files (`package.json`, `pyproject.toml`, `Cargo.toml`, `VERSION`, etc.), changelog (`CHANGELOG.md`, `CHANGES.md`), README version history, git tags for version format
- First-run questions cover: base branch, version detection strategy, files that couldn't be auto-detected, whether to create `CHANGELOG.md` if absent
- First-run generates `.aicontext/release.md` from template; user reviews before proceeding
- `release.md` has YAML frontmatter with: `version_source` (file + field), `base_branch`, `version_detection` (branch-name / git-tag / manual)
- `release.md` has a markdown files table with columns: File, Update, Hint/Notes
- `release.md` has an optional `## Notes` section; `### Changelog Style` subsection overrides default writing principles
- Table supports multiple version files (e.g. `package.json` + `src/version.js`)
- `prepare-release` prompt reads `release.md` and follows the files table instead of hardcoded file list
- Changelog writing principles are inline with the file update step, not a separate step
- Template at `.aicontext/templates/release.template.md` with commented field explanations
- `prepare-release` added to both Claude and Codex skills
- Existing behavior preserved for projects that don't use `release.md` (graceful fallback)

## Decisions

### Architecture: Prompts as Single Source of Truth
All instructions live in `.aicontext/prompts/`. Tool-specific files (skills, agents, rules) are thin wrappers that reference prompts. This eliminates duplication and gives Cursor/Copilot users equal access to all instructions.

### Document Model: Spec + Task
- **Spec** = what and why (requirements, decisions, non-goals). Always created by `/start-feature`; small work without a spec is handled via direct conversation.
- **Task** = how and progress (plan steps, checkboxes, completion notes). Always required. Bugs & issues live in the brief file during implementation.
- Specs live in `.aicontext/specs/`. Tasks live in `.aicontext/tasks/`. Cross-referenced via markdown links.

### Requirement Coverage: Immediate Check
Whenever the agent adds a requirement to the spec, it must immediately check if the requirement is covered by an existing task step. If not, propose adding a step to the current task (if related) or creating a separate task (if different topic). This applies universally — during `/run-steps` elevation, `/check-task` drift detection, or any other context where the agent modifies spec requirements. `/check-task` also runs a full drift scan as a safety net for changes made in prior sessions.

### File Naming Convention
All three document types carry a type prefix so they are immediately identifiable in IDE tabs and file explorers when multiple files are open simultaneously:
- **Spec**: `spec-{name}.md` — e.g. `spec-user-authentication.md`
- **Task**: `{version}-{name}.md` — e.g. `1.6.0-dev-flow-v2.md` (version prefix already makes tasks distinctive)
- **Brief**: `brief-{task-filename}` — e.g. `brief-1.6.0-dev-flow-v2.md` (mirrors the task filename)

Brief naming mirrors the task filename so its path is always derivable without reading any file: `tasks/{task}.md` → `data/brief/brief-{task}.md`. The task file is the entry point — it links to both spec and brief.
- User stories go in specs when relevant, but are not mandatory. Requirements are always required.

### Execution: Single Implementer with Verification Subagents
No external shell scripts. The `/run-steps` skill instructs one agent to implement all steps, accumulating full understanding of the code, decisions, and context — the same way a developer working on a feature remembers everything they've done. The agent delegates read-only verification tasks (tests, reviews, standards checks) to subagents where available (Claude Code), then assesses findings and fixes issues itself. In tools without subagents (Cursor, Copilot), the agent runs verification inline.

### Context Management: Three-Layer Model
Three documents at different levels of detail, read in order:
1. **Spec** (permanent) — what and why: requirements, decisions, non-goals
2. **Brief** (permanent, gitignored) — technical knowledge: patterns, gotchas, decisions from conversation, file references
3. **Task** (permanent) — how and progress: plan steps, checkboxes, completion notes

The agent works inline and accumulates context naturally. The brief file is written to after each step as insurance — if the user needs to start a new session, `/check-task` reads all three layers and the new agent is caught up.

### Brief File: Append-Only External Memory
The brief is not a subagent manifest — it's the agent's external memory. After each step, the agent appends what it learned (patterns, gotchas, decisions, file references). Entries are concise (1-2 lines), prefixed with plan step number `[Step N]`, and never deleted or modified — only appended. Later entries are more recent and take precedence over earlier ones. The brief template lives at `.aicontext/templates/brief.template.md`. The brief is gitignored but never auto-deleted — the user removes it manually when no longer needed, enabling task resumption weeks later.

### Session Restart via /check-task
When context gets too large or the user starts a new session, `/check-task` reads spec → brief → task and brings the new agent up to speed. The user decides when to restart — the agent cannot reliably detect its own context overflow. The brief ensures no knowledge is lost between sessions.

### Quality Checks: Configurable Table
A markdown table in `process.md` that defines what checks run when. Users can edit it to add/remove/swap checks. The `/run-steps` skill reads the table at runtime. This supports future custom review skills without code changes.

### Commit Rules: Project-Level Defaults with Per-Task Override
Commit config has two levels: project defaults in `project.md` `## Commit Rules` (shared across team), and per-task override in the task file's `## Commit Rules:` section. `/run-steps` reads the task file first and falls back to project defaults. Individual developers can also override in `local.md`. Not asked during `aicontext init` (out of scope). `/run-steps` asks at start if no config found; `/start-feature` asks for per-task preference during the interview.

Three fields: `commit_mode` (manual / per-step / per-task), `commit_template` (4 options), and `finish_action` (nothing / commit / commit+push / commit+push+pr). The `finish_action` controls what `/finish-task` does with uncommitted changes at task close.

### Review Automation: Polling with Cap
`/gh-review-fix-loop` starts each cycle by fetching existing review comments, triaging them (fix/resolve/skip), implementing fixes, running tests, then capturing the comment count, committing, and pushing. After push, polls every 60 seconds for the count to change (indicating a new review pass). If no change within 30 minutes, the cycle is done. Capped at 5 cycles. Uses existing `pr-reviews.js` and `pr-resolve.js` scripts — reviewer-agnostic.

### No Full-Auto (Ralph) Mode
Decided against unattended Ralph-style execution. Context loss between stateless iterations is too high a price for existing codebases. Supervised mode (user can monitor, agent keeps context) provides 90% of the speed with much better quality. Can be reconsidered later.

### Release Config: release.md
`.aicontext/release.md` is the per-project release configuration. YAML frontmatter holds structured settings (version source, base branch, version detection strategy). A markdown table defines which files to update, what to change, and optional hints for locating the right place. An optional `## Notes` section holds freeform project-specific rules. The file is `.md` (consistent with other aicontext config files), human-editable, and checked into the repo. On first `prepare-release` invocation, the skill runs a discovery interview and generates the file from a template — discover first, ask only for what can't be determined automatically.

### Cross-Platform Compatibility
The mono-agent approach, brief file, and universal prompts ensure the core workflow works identically in Claude Code, Codex, Cursor, and Copilot. Claude Code gets convenient UX via `/command` skills. Codex uses `use command` to invoke skills. Cursor and Copilot use the same `use <name>` pattern via a rule that reads `.aicontext/prompts/<name>.md`. No feature requires Claude-specific capabilities to function.

## Non-Goals

- **Full-auto (Ralph) mode** — not implementing unattended multi-task execution. May revisit in a future version.
- **GitHub Issues integration** — tasks stay local in `.aicontext/tasks/`. Not auto-creating GitHub issues as part of the flow.
- **Unattended auto-push/PR** — `finish_action` supports `commit+push` and `commit+push+pr` as explicit user-triggered choices at task close, not as background automation.
- **New review skills** — this spec covers the infrastructure (configurable table, loop). New review skill types (smoke-review, deep-review) are separate work.
- **TDD companion files** — importing the TDD reference materials (mocking.md, refactoring.md, etc.) from the skills library is out of scope.
- **aicontext init changes** — full init command changes (asking about commits during init) deferred. Specs dir creation was added as a minimal change.

## Tasks

- [1.6.0-unified-prompts.md](../tasks/1.6.0-unified-prompts.md) — Restructure instructions into universal prompts, update skills/agents/rules to reference them
- [1.6.0-dev-flow-v2.md](../tasks/1.6.0-dev-flow-v2.md) — New skills (/start-feature, /run-steps, /gh-review-fix-loop), templates (spec, upgraded task), process rules updates, brief file system

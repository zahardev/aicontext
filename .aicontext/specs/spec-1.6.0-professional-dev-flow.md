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

### /create-task Skill
- Crystallizes current discussion into a task file without running a full discovery interview
- Use cases: post-discussion formalization, stalled `/start-feature`, additional task for existing spec, bug/hotfix tracking, follow-up from `/finish-task`
- Links to spec if one exists for the current work
- Creates task file from template, adds to worklog, optionally creates brief
- Available as `/create-task` (Claude Code) and `use create-task` (Codex, Cursor, Copilot)

### /add-step Skill
- Adds a new step to the current task based on conversation context
- Auto-numbers, generates sub-items per planning guidelines (WHAT not HOW)
- Does not implement — use `/run-step` or `/do-it` for that
- Available as `/add-step` (Claude Code) and `use add-step` (Codex, Cursor, Copilot)

### /plan-tasks Skill
- Reads an existing spec and proposes task breakdown
- If no spec is obvious: asks user which spec, or directs to `/start-feature` if none exist
- Assesses separable work streams from the spec's requirements
- Proposes task split: "Your feature has N separate parts: [list]. I recommend creating N tasks. Correct?"
- User confirms or adjusts, then creates task files linked to the spec
- Available as `/plan-tasks` (Claude Code) and `use plan-tasks` (Codex, Cursor, Copilot)

### /start-feature (Updated)
- After the interview, before creating files: proposes task split if the feature has separable work streams
- Single-task features skip the split proposal

### /align-context Skill
- Updates all context files (task, spec, brief, worklog) to reflect current state of work
- Task file: checks off completed steps, updates Last Updated date
- Spec: adds missing decisions, requirements, non-goals from current session
- Brief: appends patterns, gotchas, decisions, file references from current session; creates brief if missing
- Worklog: adds missing entries, updates task checkboxes, moves completed specs to Done; creates worklog if missing
- When adding a new spec requirement, checks if it's covered by a task step — adds step if not
- Fixes everything silently, then provides a short report of what changed
- Available as `/align-context` (Claude Code) and `use align-context` (Codex, Cursor, Copilot)

### Framework Meta-Skills
- `/aic-skills` reads `docs/skills.md` and displays a condensed one-liner table grouped by workflow stage (Getting Started, Development Flow, Review & Quality, PR Workflow, Framework)
- `/aic-help` presents a hardcoded quickstart guide: what is AIContext, recommended setup (IDE with extension over terminal), first session flow, typical workflows (new feature, resume, quick fix), key concepts (spec/task/brief), customization pointers, best practices
- `/aic-help` ends with a pointer to `/aic-skills` for the full command list
- Both skills use `aic-` prefix to distinguish framework meta-skills from project workflow skills
- Both available as `/aic-*` (Claude Code), `use aic-*` (Codex, Cursor, Copilot)
- `docs/skills.md` is the single source of truth for skill descriptions — `/aic-skills` reads it dynamically, no duplicate manifest

### Review Consolidation
- `/diff-review` and `/branch-review` consolidated into single `/review` skill with scope arguments (diff, branch, commit, path, IDE selection)
- `/deep-review` skill added with 11-phase architectural methodology plus correctness (bugs, security) — comprehensive review. Smart delegation (<200 lines inline, >200 delegate to reviewer agent)
- `/standards-check` dropped — fully subsumed by `/deep-review` (DRY, KISS, naming, conventions all covered by deep-review phases)
- `code-review.template.md` for persistent review tracking with refactoring actions, findings, decisions
- Review criteria extracted to universal prompts: `review-scope.md` (shared scope detection), `review-criteria.md` (correctness), `deep-review-criteria.md` (architecture + correctness)
- Single `reviewer` agent — caller specifies which criteria prompt to use. Criteria prompts are accessible to Cursor/Copilot without agents.
- Two review tiers: `/review` = quick correctness scan (after step), `/deep-review` = comprehensive architecture + correctness + codebase health (after task)
- `/code-health` merged into `/deep-review` — cross-file checks (duplication patterns, consistency, structural metrics) added as expanded phases. `/deep-review all` replaces `/code-health` for full codebase scans. Follow-up step asks which findings to turn into GitHub issues via `/draft-issue`

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

### Review Prompts as Self-Contained Workflows
Review prompts (`review.md`, `deep-review.md`) are self-contained workflows: setup, scope, criteria, save with template, present. They work identically whether run directly (Cursor, Copilot, inline) or by the `reviewer` agent (Claude Code delegation). Claude skills handle the inline/delegate decision based on scope size — prompts contain no delegation logic. The `reviewer` agent is generic: "read and follow the prompt file path provided by the caller". This keeps prompts tool-agnostic and eliminates the previous problem of non-Claude tools reading irrelevant delegation instructions.

### Context Management: Three-Layer Model
Three documents at different levels of detail, read in order:
1. **Spec** (permanent) — what and why: requirements, decisions, non-goals
2. **Brief** (permanent, gitignored) — technical knowledge: patterns, gotchas, decisions from conversation, file references
3. **Task** (permanent) — how and progress: plan steps, checkboxes, completion notes

The agent works inline and accumulates context naturally. The brief file is written to after each step as insurance — if the user needs to start a new session, `/check-task` reads all three layers and the new agent is caught up.

### Brief File: Append-Only External Memory
The brief is not a subagent manifest — it's the agent's external memory. After each step, the agent appends what it learned (patterns, gotchas, decisions, file references). Entries are concise (1-2 lines), prefixed with plan step number `[Step N]`, and never deleted or modified — only appended. Later entries are more recent and take precedence over earlier ones. The brief template lives at `.aicontext/templates/brief.template.md`. The brief is gitignored but never auto-deleted — the user removes it manually when no longer needed, enabling task resumption weeks later.

### Close Step: Enforced Context Updates
After each step's implementation and tests, the agent follows `close-step.md` which bundles three actions into one required deliverable: update task checkboxes, append to brief, and elevate decisions to spec. The agent must output a structured summary with counts (e.g., "Brief: +3 entries, Spec: +1 decision") — making context updates a visible deliverable rather than an invisible housekeeping task. This prevents agents from skipping deferred-value work that only benefits future sessions.

### Session Restart via /check-task
When context gets too large or the user starts a new session, `/check-task` reads spec → brief → task and brings the new agent up to speed. The user decides when to restart — the agent cannot reliably detect its own context overflow. The brief ensures no knowledge is lost between sessions.

### Quality Checks: Configurable Table
A markdown table in `process.md` that defines what checks run when. Users can edit it to add/remove/swap checks. The `/run-steps` skill reads the table at runtime. This supports future custom review skills without code changes.

### Commit Rules: Project-Level Defaults with Per-Task Override
Commit config has two levels: project defaults in `project.md` `## Commit Rules` (shared across team), and per-task override in the task file's `## Commit Rules:` section. `/run-steps` reads the task file first and falls back to project defaults. Individual developers can also override in `local.md`. Not asked during `aicontext init` (out of scope). `/run-steps` asks at start if no config found; `/start-feature` asks for per-task preference during the interview.

Four fields: `commit_mode` (manual / per-step / per-task), `commit_template` (4 options), `commit_body` (true / false, default true), and `finish_action` (nothing / commit / commit+push). When `commit_body` is true, body includes what/why and a `Co-Authored-By: {ai} via AIContext` trailer. When false, subject line only — strictly enforced, no body or trailers. `/run-steps` only commits during execution if `commit_mode` is `per-step` — all other modes defer to `/finish-task` which uses `finish_action` as the single decision point for per-task commits. This avoids two competing commit decision points. If `finish_action` is `nothing` but uncommitted changes exist, `/finish-task` warns rather than silently skipping.

### Review Automation: Polling with Cap
`/gh-review-fix-loop` starts each cycle by fetching existing review comments, triaging them (fix/resolve/skip), implementing fixes, running tests, then capturing the comment count, committing, and pushing. After push, polls every 60 seconds for the count to change (indicating a new review pass). If no change within 30 minutes, the cycle is done. Capped at 5 cycles. Uses existing `pr-reviews.js` and `pr-resolve.js` scripts — reviewer-agnostic.

### No Full-Auto (Ralph) Mode
Decided against unattended Ralph-style execution. Context loss between stateless iterations is too high a price for existing codebases. Supervised mode (user can monitor, agent keeps context) provides 90% of the speed with much better quality. Can be reconsidered later.

### Release Config: release.md
`.aicontext/release.md` is the per-project release configuration. YAML frontmatter holds structured settings (version source, base branch, version detection strategy). A markdown table defines which files to update, what to change, and optional hints for locating the right place. An optional `## Notes` section holds freeform project-specific rules. The file is `.md` (consistent with other aicontext config files), human-editable, and checked into the repo. On first `prepare-release` invocation, the skill runs a discovery interview and generates the file from a template — discover first, ask only for what can't be determined automatically.

### Cross-Platform Compatibility
The mono-agent approach, brief file, and universal prompts ensure the core workflow works identically in Claude Code, Codex, Cursor, and Copilot. Claude Code gets convenient UX via `/command` skills. Codex uses `use command` to invoke skills. Cursor and Copilot use the same `use <name>` pattern via a rule that reads `.aicontext/prompts/<name>.md`. No feature requires Claude-specific capabilities to function.

### Framework Meta-Skills: aic- Prefix
Framework meta-skills (help, skills list) use the `aic-` prefix to avoid collisions with project workflow skills. `/help` conflicts with Claude Code's built-in command. `aic-` is short (vs `aicontext-`) while clearly namespaced. `/aic-skills` is dynamic (reads `docs/skills.md`) because skill descriptions change with each release. `/aic-help` is hardcoded because best practices and recommendations are opinionated content that doesn't exist elsewhere and changes rarely.

### Web Inspect: Own Skill, Not Upstream Fork
Playwright-cli (Microsoft, Apache 2.0) ships an 8-file skill via `playwright-cli install --skills` into `.claude/skills/`. AIContext creates its own minimal `/web-inspect` skill instead — single prompt file, focused on investigation workflow, tool-agnostic name. Reasons: (1) upstream skill is Claude-only, AIContext serves all tools; (2) upstream is large reference material, most users need only core commands; (3) `web-inspect` naming enables future pattern (`mobile-inspect`, etc.); (4) advanced commands discoverable via `playwright-cli --help`. Headed mode by default for security — user logs in manually in the visible browser. Optional `state-save`/`state-load` for power users who want faster repeated sessions. An awareness line in `standards.md` (always loaded) prompts the AI to suggest `/web-inspect` when it detects web UI work.

### Documentation: README + docs/
README focuses on pitch, install, quick start, and development model overview. Detailed workflow guides, skill-by-skill reference, and development model deep-dive live in `docs/`. This keeps the README scannable while providing depth for users who need it.

## Tasks

- [1.6.0-unified-prompts.md](../tasks/1.6.0-unified-prompts.md) ✓ — Restructure instructions into universal prompts, update skills/agents/rules to reference them
- [1.6.0-dev-flow-v2.md](../tasks/1.6.0-dev-flow-v2.md) ✓ — New skills (/start-feature, /run-steps, /gh-review-fix-loop), templates (spec, upgraded task), process rules updates, brief file system
- [1.6.0-prepare-release-config.md](../tasks/1.6.0-prepare-release-config.md) ✓ — Configurable prepare-release skill with release.md config
- [1.6.0-review-consolidation.md](../tasks/1.6.0-review-consolidation.md) ✓ — Consolidate review skills: `/review` + `/deep-review` with scope args, universal criteria prompts, single reviewer agent
- [1.6.0-aic-help-skills.md](../tasks/1.6.0-aic-help-skills.md) ✓ — Add `/aic-help` and `/aic-skills` framework meta-skills
- [1.6.0-web-inspect-skill.md](../tasks/1.6.0-web-inspect-skill.md) ✓ — `/web-inspect` skill: minimal playwright-cli usage guide, headed by default, snapshot-first workflow

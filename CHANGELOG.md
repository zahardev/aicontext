# Changelog

## [1.6.0] - Unreleased

### Added
- **Three-layer context model**: specs (requirements) → tasks (plan + progress) → briefs (working knowledge) for persistent AI context across sessions
- **New skills**: `/start-feature`, `/run-steps`, `/finish-task`, `/plan-tasks`, `/do-it`, `/align-context`, `/gh-review-fix-loop`
- **Shared step inner loop** (`step-loop.md`): single source of truth for the implement → review → test → commit cycle, referenced by `/run-steps` and `/do-it`
- **Spec files** (`.aicontext/specs/`): feature-level requirements, decisions, and non-goals — survive refactors, no file paths or implementation details
- **Brief files** (`.aicontext/data/brief/`): gitignored working memory the AI appends to after each step — enables seamless session restarts via `/check-task`
- **Worklog** (`.aicontext/worklog.md`): spec and task status tracking, replaces `changelog.md`. AI-generated, gitignored.
- **Spec↔task drift detection** in `/check-task`: identifies spec requirements not covered by task steps, offers to add steps or create separate tasks
- **Requirement coverage check**: whenever the AI adds a spec requirement, it immediately verifies task step coverage
- **Configurable commit rules**: project-level defaults in `project.md`, per-task overrides in task files, personal overrides in `local.md`
- **Quality checks table** in `process.md`: configurable matrix of what checks run after steps vs after tasks
- New templates: `spec.template.md`, `brief.template.md`, `worklog.template.md`
- Specs directory (`.aicontext/specs/.gitkeep`) created during `aicontext init`
- Codex skill mirrors for all new skills
- **`/review` skill**: unified review with scope args (diff, branch, commit, path, IDE selection) — replaces `/diff-review` and `/branch-review`
- **`/deep-review` skill**: comprehensive architecture + correctness review with 11-phase methodology (DRY & KISS, Placement, Responsibilities, API Design, Edge Cases, Bugs & Security, Framework Usage, Constants & Naming, Dependencies & Testability, Error Handling, Extensibility)
- **Review criteria prompts**: `review-criteria.md`, `deep-review-criteria.md`, `review-scope.md` — shared between all tools, not just Claude Code
- **Code review template** (`code-review.template.md`): persistent review tracking with refactoring actions, findings, decisions
- **`close-step.md` prompt**: enforces brief/spec updates after each step with visible summary output — prevents agents from skipping context updates
- **`commit_body` option** in Commit Rules: controls whether commits include a body (default: `false` — subject only)
- **Active task identification** rules in `process.md`: IDE-opened file > conversation context > worklog
- **`/web-inspect` skill**: browser-based investigation using playwright-cli — open pages in headed mode, inspect elements via snapshots, check console errors, capture screenshots. Useful for UI debugging, manual AI testing, and verifying fixes visually
- **`/aic-help` and `/aic-skills` framework meta-skills**: `/aic-help` shows a quickstart guide with workflows and best practices; `/aic-skills` lists all available skills grouped by workflow stage

### Changed
- **Renamed `/start-task` → `/start-feature`**: always creates spec + task, no complexity assessment — small work uses direct conversation
- **Renamed "Acceptance Criteria" → "Requirements"** in specs: plain list (no checkboxes), detailed enough for task creation
- **Prompts as single source of truth**: all skill/agent instructions live in `.aicontext/prompts/`, skills are thin wrappers
- `/check-task` now reads three layers (spec → brief → task) with staleness checks
- `/gh-review-fix-loop` cycle reordered: fetch first → triage → fix → test → capture count → commit+push → poll
- Script paths in prompts use `.aicontext/scripts/` (universal) instead of `.claude/scripts/`
- `removeDeprecatedSkills` now cleans both `.claude/skills/` and `.codex/skills/`
- Process rule "stop after step" scoped to manual execution only (not `/run-steps`)
- Task template simplified: no acceptance criteria or out-of-scope sections (both live in spec)
- **Merged `deep-reviewer` and `standards-checker` into single `reviewer` agent** — caller specifies criteria prompt, agent is generic
- **Review prompts are self-contained workflows**: setup, scope, criteria, save with template, present — work identically inline or via agent
- **Two review tiers**: `/review` = quick correctness (after step), `/deep-review` = comprehensive (after task)
- Step inner loop simplified from 11 to 9 steps — close-step replaces separate update/brief/elevate steps
- `/run-steps` commit logic simplified: only commits per-step, per-task commits handled by `/finish-task` via `finish_action`
- `/finish-task` warns when `finish_action: nothing` but uncommitted changes exist
- PR scripts moved from `.claude/scripts/` to `.aicontext/scripts/`; `pr-reviews.js` uses `__dirname` for output path resolution

### Deprecated
- `changelog.md` — replaced by `worklog.md`. Deprecation notice injected during `aicontext update`.
- `/start-task` skill — replaced by `/start-feature`
- `/diff-review` and `/branch-review` — replaced by `/review` with scope args
- `/standards-check` — fully subsumed by `/deep-review`
- `deep-reviewer` and `standards-checker` agents — merged into single `reviewer` agent
- `.claude/scripts/` directory — scripts moved to `.aicontext/scripts/`

## [1.5.1] - 2026-03-25

### Fixed
- Upgrade command now verifies installed version after `npm install -g` and warns if version unchanged
- Removed misleading "Update available" message shown immediately after upgrade
- Version cache is now cleared after upgrade to prevent stale update notifications

## [1.5.0] - 2026-03-21

### Added
- OpenAI Codex support: 11 self-contained skills in `.codex/skills/` adapted for Codex's agent model
- New skills for Claude Code and Codex: `/standards-check`, `/draft-issue`, `/code-health`
- PR template (`pr.template.md`) for structured pull request drafting
- Project logo in `assets/logo.svg`

### Changed
- PR workflow scripts moved from `.claude/scripts/` to `.aicontext/scripts/` for tool-agnostic access (old location kept for backward compatibility)
- `standards-checker` agent model upgraded from `sonnet` to `opus`
- CLI `init` and `update` commands now copy Codex skills with override protection
- README rewritten with comprehensive workflow guides covering new feature, resume session, code review, PR triage, and more
- Package description and keywords updated to include Codex

## [1.4.0] - 2026-03-01

### Added
- Claude Code skills: 8 invocable commands (`/start`, `/check-task`, `/check-plan`, `/diff-review`, `/branch-review`, `/next-step`, `/draft-pr`, `/pr-review-check`)
- PR workflow scripts in `.claude/scripts/`: `pr-reviews.js` (fetch unresolved threads via GitHub GraphQL API) and `pr-resolve.js` (resolve threads and post replies)
- `--override-skills` flag to force-override existing skill files during `init` and `update`
- Skill override protection — existing skill files are never silently overwritten
- Data directory conventions: `code-reviews/`, `pr-drafts/`, `github-pr-reviews/` subdirectories
- `.aicontext/data/.gitignore` for ignoring user data while preserving directory structure

### Changed
- Agent model defaults upgraded from `haiku` to `sonnet` (reviewer to `opus`), with interactive `haiku` opt-in during `init`
- Replaced `.aicontext/data/.gitkeep` with `.aicontext/data/.gitignore`
- README: added Features section, improved Quick Start, expanded PR workflow docs, removed redundancies
- Lowered minimum Node.js requirement from 18 to 14.14 (tests still require 18+)

### Removed
- Deprecated `pr-review-summarizer` agent (replaced by `/pr-review-check` skill + PR scripts)


## [1.3.0] - 2026-02-25

### Added
- Claude Code subagents: 6 predefined agents (`researcher`, `reviewer`, `test-runner`, `test-writer`, `standards-checker`, `pr-review-summarizer`) in `.claude/agents/`
- Agent delegation rules in `.claude/CLAUDE.md` for automatic task routing to subagents
- Agent model configuration step in `generate.md` prompt (auto-detects model and suggests upgrades)
- Agent override protection — existing agent files are never silently overwritten during `init` and `update`
- Interactive per-file prompt when an agent file already exists: "Override? (y/N)"
- `--override-agents` flag to force-override all existing agents without prompting
- New prompt `after_step.md` for reflecting after completing a plan step
- Question numbering rule in `standards.md`

### Changed
- Renamed prompt `check_task.md` → `task.md`
- Renamed prompt `check_plan.md` → `plan.md`
- `.claude/` directory is now copied selectively: `CLAUDE.md` always updated, agents handled individually
- Deprecated prompts (`check_plan.md`, `check_task.md`) are automatically removed during `update`

## [1.2.0] - 2026-01-27

### Added
- Automatic version update checking on CLI startup
- Command `aicontext upgrade` to update the CLI tool itself
- Confirmation prompts before overwriting existing files during `init` and `update`
- Rules override priority: `rules/` → `project.md` → `local.md` (low to high)
- Documentation for `local.md` gitignore caveat and workarounds
- GitHub Actions workflow for automated testing on pull requests

### Changed
- **Renamed `.ai/` folder to `.aicontext/`** - Decided to rename the context folder to better match the project name and make its purpose clearer. Since the project is still in an early stage and not widely used yet, this feels like a good time to make the change.
- Moved task template from `.aicontext/tasks/.template.md` to `.aicontext/templates/task.template.md` for consistency
- Renamed `init.md` prompt to `start.md`
- Improved prompts and initial file generation
- Improved entry point files: added `structure.md` to loading list, removed redundant Context Priority table
- Improved task name generation rules

### Fixed
- Input validation for `upgrade` command version parameter
- Dead `setup/generate.md` copy operation in `update` command
- Stale `.ai` reference in README manual install instructions

### Removed
- `setup/install.sh` (replaced by `aicontext init`)
- `VERSION` file (now uses `package.json`)

## [1.1.0] - 2026-01-25

### Added
- `data` folder for additional task data ( screenshots, specs, etc. )
- Documentation for removing unused AI tool configurations

### Fixed
- `changelog.md` no longer overwritten during init if it already exists
- `.claude/settings.local.json` excluded from git and npm package

### Changed
- Renamed `.cursor/rules/ai-context.mdc` to `aicontext.mdc` for consistency

## [1.0.0] - 2026-01-24

### Added
- Initial release
- Core rules: `process.md`, `standards.md`
- Prompts: `init.md`, `check_task.md`, `check_plan.md`, `review.md`
- Templates for project-specific file generation
- Support for Claude Code, Cursor, and GitHub Copilot
- Installation script and documentation

# Changelog

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

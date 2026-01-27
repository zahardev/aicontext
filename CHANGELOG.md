# Changelog

## [1.2.0] - 2026-01-27

### Added
- `aicontext upgrade` command to update the CLI tool itself
- Automatic version update checking on CLI startup
- Confirmation prompts before overwriting existing files during `init` and `update`

### Changed
- **Renamed `.ai/` folder to `.aicontext/`** - Decided to rename the context folder to better match the project name and make its purpose clearer. Since the project is still in an early stage and not widely used yet, this feels like a good time to make the change.
- Moved task template from `.aicontext/tasks/.template.md` to `.aicontext/templates/task.template.md` for consistency
- Renamed `init.md` prompt to `start.md`
- Improved prompts and initial file generation
- Improved task name generation rules

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

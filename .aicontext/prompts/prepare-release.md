Prepare the release for the current version branch. Follow these steps in order:

## 1. Gather context

- Read `.aicontext/local.md` for project-specific release rules
- Determine the version from the current branch name (`version/X.Y.Z`) or `package.json`
- Run `git diff main...HEAD` to understand all changes since main
- Read all task files in `.aicontext/tasks/` that match this version prefix
- Read the current `CHANGELOG.md` and `README.md`

## 2. Update version

- Update `version` in `package.json`
- Search for any other files referencing the old version that need updating

## 3. Update CHANGELOG.md

- Add a new version section at the top following the existing Keep a Changelog format
- Categorize changes under `### Added`, `### Changed`, `### Fixed`, `### Removed` as appropriate
- Base entries on the actual git diff and task files, not assumptions
- Keep entries concise but descriptive

## 4. Check README.md

- Review README against the changes — is anything outdated or missing?
- If new features, commands, or options were added, check if README documents them
- Add a row to the **Version History** table with a short highlights summary
- Only propose README changes that are clearly needed — don't rewrite for style

## 5. Present summary

Show the user:
- Version being released
- CHANGELOG entries (for review)
- README changes (if any)
- Any issues found (missing docs, inconsistencies)

Wait for user confirmation before finalizing.

---
# Where the version number lives in your project
version_source:
  file: package.json      # e.g. package.json, pyproject.toml, Cargo.toml, VERSION
  field: version          # e.g. version, tool.poetry.version — leave blank for plain text files

# Branch to diff against when gathering changes
base_branch: main         # e.g. main, master, develop

# How the version being released is determined
# Options:
#   branch-name  — parsed from current branch name (e.g. version/1.2.3)
#   git-tag      — latest git tag
#   manual       — agent asks each time
version_detection: branch-name

# Changelog format for the public-facing CHANGELOG.md
# Options:
#   keep-a-changelog  — versioned sections with ### Added / Changed / Fixed / Removed
#   date-based        — ## YYYY-MM-DD sections with bullet entries
#   none              — no public changelog
changelog_format: keep-a-changelog

# Internal AI changelog used as input when writing the public CHANGELOG.md
# The skill reads this file to understand what changed, rather than reconstructing from git diff alone.
# Remove this line if your project does not use an internal AI changelog.
ai_changelog: .aicontext/worklog.md
---

## Files to Update

<!-- Add one row per file that needs updating during a release.
     Use relative paths from the project root (e.g. src/version.js, not just version.js).
     Hint/Notes: section heading, field name, or pattern to locate the right place.
     Examples:
     | `package.json`        | version field                   |                           |
     | `CHANGELOG.md`        | add new version section at top  | Keep a Changelog format   |
     | `README.md`           | Version History table — add row | `## Version History`      |
     | `src/constants.js`    | VERSION constant                | VERSION = "               |
-->
| File | Update | Hint/Notes |
|------|--------|------------|

## Notes

<!-- Add project-specific release rules here. Examples:
- Run `npm install` after updating package.json to sync package-lock.json
- Version tag format is vX.Y.Z
- Always update the API docs section when adding new commands
-->

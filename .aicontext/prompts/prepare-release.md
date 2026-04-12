# Prepare release

## 1. Ensure release config

If `.aicontext/release.md` doesn't exist, run first-time setup:
1. Scan for version files (`package.json`, `pyproject.toml`, `Cargo.toml`, `VERSION`), changelog, README version history, and git tags
2. Ask only for what can't be inferred
3. Generate `.aicontext/release.md` from `.aicontext/templates/release.template.md`, pre-filled with findings
4. Show the file and wait for user confirmation before continuing

## 2. Gather context

Follow `ensure-config.md` to load project settings. Read `.aicontext/local.md` (if present) and the `## Notes` section in `release.md` for project-specific rules.

Determine the version from `release.md` `version_detection`:
- `branch-name` → parse current branch (e.g. `version/X.Y.Z`)
- `git-tag` → latest git tag
- `manual` → ask the user

Read what shipped, in order:
1. **Tasks** — `.aicontext/tasks/` matching the version prefix
2. **Specs** — any `.aicontext/specs/` linked from those tasks
3. **Task-context** — `.aicontext/data/task-context/` for those tasks (if present)
4. **Git diff** — `git diff {base_branch}...HEAD`, using `project.base_branch` from `.aicontext/config.yml`
5. **AI changelog** — if `ai_changelog` is set in `release.md`, read it. If any task for this version has no entry, list them and ask before generating

## 3. Update files

For each row in the `## Files to Update` table in `release.md`:
- Apply the described change, using the Hint/Notes column to locate the right place
- If a listed file doesn't exist, ask before creating

**Changelog writing** (default — override via `### Changelog Style` in `release.md` Notes):
- Describe behavior, not implementation — what the user sees, not what the code does
- Omit refactors, renames, and internal reorganizations — only user-visible changes
- No function names, file paths, or module internals

## 4. Present summary

Show the user:
- Version being released
- Each file updated and what changed
- Any issues (missing files, inconsistencies)
- Next: `Run /commit to commit the release updates.`

Wait for user confirmation.

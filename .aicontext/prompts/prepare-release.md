Prepare the release for the current version. Follow these steps in order:

## 1. Check for release config

Check if `.aicontext/release.md` exists.

**If it exists:** read it and proceed to step 2.

**If it does not exist:** run the first-run setup:
1. Discover what you can — scan for version files (`package.json`, `pyproject.toml`, `Cargo.toml`, `VERSION`, etc.), changelog (`CHANGELOG.md`, `CHANGES.md`), README version history, git tags to infer version format and base branch
2. Ask only for what can't be determined: base branch if ambiguous, version detection strategy, whether to create `CHANGELOG.md` if none found
3. Generate `.aicontext/release.md` from `.aicontext/templates/release.template.md`, pre-filled with your findings
4. Show the generated file to the user and ask them to confirm or edit before continuing
5. Once confirmed, proceed with the release using the new config

## 2. Gather context

- Read `.aicontext/local.md` for project-specific rules (if it exists)
- Read the `## Notes` section in `release.md` for project-specific release rules
- Determine the version being released:
  - `version_detection: branch-name` → parse from current branch (e.g. `version/X.Y.Z`)
  - `version_detection: git-tag` → use the latest git tag
  - `version_detection: manual` → ask the user

Understand what was built, then verify against the diff:

1. **Specs** — read specs in `.aicontext/specs/` linked from this version's tasks. These describe the "what and why" — features, requirements, decisions.
2. **Tasks** — read all task files in `.aicontext/tasks/` that match this version prefix. Completion notes summarize what was delivered, compromises, and follow-ups.
3. **Briefs** — read briefs in `.aicontext/data/brief/` for this version's tasks (if they exist). These capture important decisions, gotchas, and patterns worth mentioning.
4. **Git diff** — run `git diff <base_branch>...HEAD` to verify nothing was missed and cross-check against the context above.
5. **AI changelog** — if `ai_changelog` is set in `release.md`: read that file as additional input. Cross-check against the task files: if any task for this version has no entry, auto-generate the missing entries and append them before proceeding.

## 3. Update files

For each row in the `## Files to Update` table in `release.md`:
- Open the file and apply the described update, using the Hint/Notes column to locate the right place
- If a file in the table does not exist, ask the user whether to create it before proceeding
- When updating a changelog file, apply these writing principles by default. If `release.md` `## Notes` contains a `### Changelog Style` subsection, use that instead:
  - **Describe behavior, not implementation** — write what the user sees or gets, not what the code does
  - **Omit internal refactoring** — renamed variables, extracted functions, reorganized files are invisible to users; only include refactors that change CLI behavior or public API
  - **No implementation details** — don't mention function names, file paths, or module internals; the changelog is for users, not developers reading the diff

## 5. Present summary

Show the user:
- Version being released
- Each file updated and what changed
- Any issues found (missing files, inconsistencies)

Wait for user confirmation before finalizing.

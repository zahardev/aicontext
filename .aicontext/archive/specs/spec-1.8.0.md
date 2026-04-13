# Spec: 1.8.0

## Problem

### PR scripts break in ESM projects
Projects with `"type": "module"` in `package.json` cause Node to treat all `.js` files as ESM. The PR workflow scripts (`pr-reviews.js`, `pr-resolve.js`) use CommonJS (`require`/`module.exports`), so they fail with a syntax error when installed into ESM projects.

### No config guard on PR creation
`draft-pr.md` has no config awareness — agents can accidentally create GitHub PRs when the user only wanted a local draft. `draft-issue` already solved this with `issue.save_to_file` and `issue.create_in_github`.

### finish-task marks done before PR review
finish-task marks the task done in worklog immediately. Users who do PR-per-task and rely on external review (CodeRabbit) need the task to stay open until after review fixes land. No way to defer the "done" marking.

### Review uses wrong criteria when invoked from run-task
`step-loop.md` and `run-task.md` say "tell the reviewer which playbook" but don't specify exact file paths. The lead agent writes a free-form prompt and can skip the path, causing `review-criteria.md` to be used instead of `deep-review-criteria.md` for full reviews. Same problem for Cursor/Copilot inline reviews.

### start.md skips project generation in VSCode
VSCode extension batches file reads in parallel. `start.md` delegated to `auto-setup.md` without enforcing sequential ordering, so the project.md existence check was bypassed and `generate.md` never ran on first start.

### Version check is slow and fragile
The `/start` update check reads `/tmp/aicontext-version-cache.json` (requires permission prompt), runs `aicontext version` CLI (spawns a process), and falls back to WebFetch — up to 5 tool calls and ~15 seconds. The `/tmp` path is shared across projects and requires explicit filesystem permission.

## Solution

### Version check is slow and fragile
Store version cache in `.aicontext/data/version.json` (project-local, gitignored). CLI writes the cache automatically when an explicit target path is provided to `aicontext version <path>`. Cache includes all three versions (`cliVersion`, `currentVersion`, `latestVersion`) so the agent reads one file. `init` and `update` seed the cache at install time.

### PR scripts break in ESM projects
Rename scripts from `.js` to `.cjs`. Node always uses CommonJS for `.cjs` files regardless of the project's module type. Add cleanup of old `.js` files during `aicontext update`.

### No config guard on PR creation
Add a `pr` config section mirroring `issue` — `save_to_file` and `create_in_github` with the same `true | false | ask` vocabulary. Rewrite `draft-pr.md` to read config and respect the guard.

### finish-task marks done before PR review
Add `after_task.pr` and `after_task.review_loop` gates to finish-task. The PR gate delegates to `draft-pr.md`; the review loop gate delegates to `gh-review-fix-loop.md`. When `review_loop` is enabled but can't run (no remote PR), ask the user to mark done or defer. Make finish-task resumable — second run detects already-verified state and silently marks done.

### Review uses wrong criteria when invoked from run-task
Spell out the exact playbook file path in both `step-loop.md` and `run-task.md` — `partial` → `.aicontext/prompts/review.md`, `full` → `.aicontext/prompts/deep-review.md`. Make the inline (Cursor/Copilot) path equally explicit.

### start.md skips project generation in VSCode
Inline `auto-setup.md` into `start.md` with an explicit sequential gate. Deprecate and remove `auto-setup.md`.

## Requirements

### Local version cache — CLI
- [x] `aicontext version <path>` writes cache to `<path>/.aicontext/data/version.json` when `.aicontext/` exists
- [x] Cache schema: `{ cliVersion, currentVersion, latestVersion, lastChecked, nextCheck }`
- [x] No cache written when no path argument (manual `aicontext version` stays print-only)
- [x] `--cache` flag removed — cache path derived from target dir
- [x] `init()` and `update()` seed version cache at install time

*Implemented by: [1.8.0-local-version-cache](../tasks/1.8.0-local-version-cache.md)*

### Local version cache — prompt
- [x] Cache file at `.aicontext/data/version.json` with YYYY-MM-DD dates
- [x] Agent pre-computes `nextCheck` from frequency config at write time
- [x] Agent runs `date` (no params) to get current date — avoids stale knowledge cutoff
- [x] Prompt uses `.aicontext/data/version.json` instead of `/tmp/aicontext-version-cache.json`
- [x] Prompt calls `aicontext version {project_root}` — agent substitutes path
- [x] Agent reads all versions from cache — no separate `.aicontext/.version` read
- [x] Offers correct command: `upgrade` (CLI behind npm), `update` (project behind CLI), or both

*Implemented by: [1.8.0-local-version-cache](../tasks/1.8.0-local-version-cache.md)*

### Issue ID flow in create-task
- [x] `create-task.md` offers three options when `{issue_id}` is in the naming pattern: provide ID, create issue, or skip
- [x] Option 2 delegates to `/draft-issue` and captures the issue number for the task filename
- [x] Option 3 drops `{issue_id}` and its separator from the filename

*Implemented by: [1.8.0-issue-id-flow](../tasks/1.8.0-issue-id-flow.md)*

### CJS script rename
- [x] `pr-reviews.js` renamed to `pr-reviews.cjs`
- [x] `pr-resolve.js` renamed to `pr-resolve.cjs`
- [x] All references updated (CLI, prompts, tests, docs, readme)
- [x] Old `.js` scripts removed during `aicontext update` via `DEPRECATED_SCRIPTS`
- [x] Changelog entry added

*Implemented by: [1.8.0-cjs-script-rename](../tasks/1.8.0-cjs-script-rename.md)*

### PR config and draft-pr rewrite
- [x] `pr` config section with `save_to_file` (default true) and `create_in_github` (default ask)
- [x] `draft-pr.md` reads config via `ensure-config.md` and respects both settings
- [x] When `create_in_github: false`, draft-pr must not create a GitHub PR under any circumstances
- [x] When `create_in_github: ask`, follow the same two-stage UX as `draft-issue` (ask, then offer to save as default)

*Implemented by: [1.8.0-pr-workflow-integration](../tasks/1.8.0-pr-workflow-integration.md)*

### finish-task PR and review loop gates
- [x] `after_task.pr` gate (true|false|ask) triggers `draft-pr.md` after push
- [x] `after_task.review_loop` gate (true|false|ask) triggers `gh-review-fix-loop.md` after PR exists
- [x] If `after_task.pr` requires push but `after_task.push` is false/skipped, ask the user before pushing
- [x] Review loop is skipped (not blocked) when no remote PR exists

*Implemented by: [1.8.0-pr-workflow-integration](../tasks/1.8.0-pr-workflow-integration.md)*

### Resumable finish-task
- [x] When review_loop enabled but can't run: ask mark done / defer
- [x] Deferred tasks show `"Run /finish-task again after PR review to mark done."` in summary
- [x] Second run detects already-verified state (completion notes filled, all steps checked) and silently marks done
- [x] Always ask "Mark task as done?" before marking — covers manual PR/review cases and incomplete external reviews

*Implemented by: [1.8.0-pr-workflow-integration](../tasks/1.8.0-pr-workflow-integration.md)*

### Config and run-task integration
- [x] `config.template.yml` includes new `pr` section and `after_task.pr` / `after_task.review_loop` fields
- [x] `run-task.md` ask-batching includes the new `after_task` fields
- [x] `ensure-config.md` backfills missing keys when config exists but lacks new sections

*Implemented by: [1.8.0-pr-workflow-integration](../tasks/1.8.0-pr-workflow-integration.md)*

### start.md parallel read fix
- [x] `start.md` enforces sequential read — step 1 must resolve before step 2
- [x] `auto-setup.md` inlined and deprecated (removed from FRAMEWORK_PROMPTS, added to DEPRECATED_PROMPTS)

*Implemented by: [1.8.0-start-parallel-read-fix](../tasks/1.8.0-start-parallel-read-fix.md)*

### Explicit review playbook paths and vocabulary rename
- [x] `step-loop.md` and `run-task.md` specify exact playbook file paths for review
- [x] Inline (Cursor/Copilot) path equally explicit
- [x] Config vocabulary renamed: `normal|deep|false|ask` (`partial`/`full` accepted as aliases)
- [x] Migration in `ensure-config.md` rewrites `partial`→`normal`, `full`→`deep`
- [x] Config template uses new vocabulary

*Implemented by: [1.8.0-explicit-review-playbook](../tasks/1.8.0-explicit-review-playbook.md)*

## Decisions

### Local version cache
- File format → JSON at `.aicontext/data/version.json` — structured machine data, not prose
- CLI cache path → derived from target dir, no `--cache` flag — simpler interface
- Cache trigger → explicit path only — avoids surprise files when running `aicontext version` manually
- Cache schema → `cliVersion` + `currentVersion` + `latestVersion` — agent reads one file, not two
- No CLI fallback → update checks require `aicontext` in PATH; without it, skip silently
- Date format → YYYY-MM-DD date-only for `lastChecked` and `nextCheck`
- Date source → agent runs `date` (no params) — works across all AI tools
- Two-version comparison → `upgrade` when CLI < npm latest, `update` when project < CLI

### CJS and PR workflow
- [rename] → `.js` to `.cjs` for both `pr-reviews.js` and `pr-resolve.js` — Node must use CJS regardless of host project's `"type": "module"`
- [cleanup] → Add `DEPRECATED_SCRIPTS` list in CLI to remove old `.js` files during update — mirrors existing `DEPRECATED_SKILLS` pattern
- [config] → Leave `pr-reviews-config.json` as-is — JSON unaffected by module resolution
- [tests] → Leave test files as `.js` — this project has no `"type": "module"`
- [changelog] → Add entry under current version

### PR workflow decisions
- Mirror the `issue` config pattern — `save_to_file` + `create_in_github`, same two-stage ask UX, no CLI flag overrides
- Reuse `gh-review-fix-loop.md` as-is with hardcoded 5 max cycles
- Push dependency for PR creation — ask user rather than silently forcing or skipping
- Resumable finish-task over separate close command — detection via completion notes + checked steps
- Automation chains must be complete — review_loop without remote PR degrades gracefully (skip + ask)

## Non-Goals

- Renaming test files to `.cjs`
- Renaming the config JSON file
- Converting scripts to ESM
- CLI flag overrides for `/draft-pr`
- Configurable max cycles for review loop
- Auto-merge after review loop passes
- Changes to `gh-review-fix-loop.md` internals

## Tasks

- [1.8.0-local-version-cache](../tasks/1.8.0-local-version-cache.md) — Local version cache: CLI writes + prompt rewrite + init/update seeding (complete)
- [1.8.0-cjs-script-rename](../tasks/1.8.0-cjs-script-rename.md) — Rename PR scripts to .cjs, update all references, add update cleanup (complete)
- [1.8.0-pr-workflow-integration](../tasks/1.8.0-pr-workflow-integration.md) — PR config, draft-pr rewrite, finish-task gates, resumable close (complete)
- [1.8.0-start-parallel-read-fix](../tasks/1.8.0-start-parallel-read-fix.md) — Fix start.md parallel read skipping project generation (complete)
- [1.8.0-explicit-review-playbook](../tasks/1.8.0-explicit-review-playbook.md) — Explicit review playbook paths in step-loop and run-task (complete)
- [1.8.0-fix-negative-happy-path](../tasks/1.8.0-fix-negative-happy-path.md) — Fix "No" as happy-path label in start-feature and finish-task (complete)
- [1.8.0-issue-id-flow](../tasks/1.8.0-issue-id-flow.md) — Three-option issue ID menu in create-task

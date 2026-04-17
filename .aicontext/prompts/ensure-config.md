# Ensure Config

Read project settings from `.aicontext/config.yml` (and `config.local.yml` if it exists — local overrides shared).

If `config.yml` doesn't exist, create it from `.aicontext/templates/config.template.yml` with defaults.

If `project.md` has commit rules or task naming settings, migrate those values into `config.yml` and remove the stale sections from `project.md`.

## Validate

Scan the config and flag problems. List any flagged values before proceeding.

1. **Missing sections** — verify these top-level sections exist: `after_step`, `after_task`, `commit`, `project`, `task_naming`, `spec_naming`, `update_check`, `claude`, `pr`, `issue`, `gh_fix_tests`. If any missing, load `.aicontext/templates/config.template.yml` and add them with defaults.
2. **Deprecated patterns** — check each value in config against this list:
   - `after_*.review`: flag if `partial` or `full`
   - `after_*.tests`: flag if `partial`, `full`, `normal`, or `deep`
   - Any key: flag if `commit.mode`, `commit.finish_action`, `after_*.deep_review`, or `after_*.full_tests` exists
   - `task_naming.pattern`: flag if contains `{task-name}`
3. **Tests type names** — for each `after_*.tests` value, split on `|`, strip `-full`/`-affected` — verify each remaining name is a row in `structure.md`'s `## Testing` table. Skip `all`, `false`, `ask`, and literal shell commands.

If check #2 or #3 flagged anything, follow `migrate-config.md`. Values still invalid after migration are handled by interactive resolution below.

## Interactive resolution

Collect all `after_step.*` and `after_task.*` fields whose value is `ask` or still invalid after checks #2/#3 and migration above.

If any fields need input, follow `resolve-asks.md` with the collected field list. Intro line before the batch: *"A few workflow preferences to set:"*

**Session memo:** if a field was already resolved earlier in this session, reuse the prior answer without re-prompting.

Return the resolved config.

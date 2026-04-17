# Ensure Config

Read project settings from `.aicontext/config.yml` (and `config.local.yml` if it exists — local overrides shared).

If `config.yml` doesn't exist, create it from `.aicontext/templates/config.template.yml` with defaults.

If `project.md` has commit rules or task naming settings, migrate those values into `config.yml` and remove the stale sections from `project.md`.

## Validate

1. **All expected top-level sections present:** `after_step`, `after_task`, `commit`, `project`, `task_naming`, `spec_naming`, `update_check`, `claude`, `pr`, `issue`, `gh_fix_tests`.
2. **No deprecated patterns** — none of these appear:
   - Keys: `commit.mode`, `commit.finish_action`, `after_*.deep_review`, `after_*.full_tests`
   - Bare values on `after_*.review`: `partial`, `full`
   - Bare values on `after_*.tests`: `partial`, `full`, `normal`, `deep`
   - Token: `{task-name}` in `task_naming.pattern` (now `{task_name}`)
3. **Tests types** — for any `after_*.tests` value, split on `|`, strip `-full`/`-affected` suffixes — every remaining name must be a row in `structure.md`'s `## Testing` table. Skip `all`, `false`, `ask`, and literal shell commands (whitespace, quotes, or shell metacharacters).

If check #1 fails, load `.aicontext/templates/config.template.yml` and add missing sections with default values.

If check #2 or #3 fails, follow `migrate-config.md`. Values still invalid after migration are handled by interactive resolution below.

**Session memo:** skip if already validated clean this session.

## Interactive resolution

Collect all `after_step.*` and `after_task.*` fields whose value is `ask` or still invalid after checks #2/#3 and migration above.

If any fields need input, follow `resolve-asks.md` with the collected field list. Intro line before the batch: *"A few workflow preferences to set:"*

**Session memo:** if a field was already resolved earlier in this session, reuse the prior answer without re-prompting.

Return the resolved config.

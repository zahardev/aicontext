# Ensure Config

**Called with:** `fields` - exact config paths the caller needs. When omitted, derive them from explicit config reads in the calling prompt.

## 1. Session memo

If config was already loaded this session, reuse the merged values and source map. Reread only a source file changed since loading, then refresh affected memoized values.

## 2. First demand

1. If `.aicontext/config.yml` is missing, follow `create-config.md`.
2. Read `.aicontext/config.yml` and `config.local.yml` if present.
3. Merge recursively by key; local values override shared values without replacing sibling keys.
4. Record whether each effective value came from shared or local config.

## 3. Requested fields

### Present value

- **Recognized:** use it.
- **`ask`:** for `after_step.*`, `after_task.*`, and `tdd`, follow `resolve-asks.md` with only that requested field. Other `ask` fields retain the interaction defined by their owning workflow.
- **Unexpected:** show the valid options, require a correction, persist it in the source file that supplied the value, and refresh the session memo.

### Missing value

1. Follow `migrate-config.md` with the requested field. Inspect only legacy aliases that can supply that field.
2. If an alias supplies the field, migrate it in its source file, refresh the session memo, and handle the resulting value as a present value.
3. Otherwise read only that field's default from `.aicontext/templates/config.template.yml`, persist it to shared config, refresh the session memo, and handle the default as a present value. A commented default counts as the default.

### Recognized values

- `after_*.review`: `normal`, `deep`, `false`, `ask`
- `after_*.tests`: type, optional `-full` or `-affected` scope, or a `|`-joined list. Requested type names must exist in `structure.md`'s `## Testing` table. Skip type lookup for `all`, `false`, `ask`, and literal shell commands.
- `after_*.commit`, `after_task.push`, `after_task.pr`, `after_task.review_loop`, `tdd`, `commit.body`, `spec_naming.derive_from_task`, `issue.save_to_file`, `gh_fix_tests.push`: allowed booleans; lifecycle fields and `tdd` also allow `ask`.
- `task_naming.source`: `git-branch`, `package-json`, `manual`
- `update_check.frequency`: `daily`, `weekly`, `biweekly`, `monthly`, `never`
- `claude.question_style`: `numbered`, `interactive`
- `issue.create_in_github`: `true`, `false`, `ask`
- Unrestricted strings and `task_naming.pattern: ask` are recognized. Task naming templates may use `{version}`, `{issue_id}`, `{date}`, and `{task_name}`.

Return only the requested effective values to the caller.

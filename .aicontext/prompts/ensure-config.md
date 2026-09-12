# Ensure Config

Load and repair only the project settings required by the active workflow.

**Called with:** `fields` - exact config paths the caller needs. When omitted, derive them from explicit config reads in the calling prompt. Never resolve unrelated fields.

## 1. Session memo

If config was already loaded this session, reuse the merged values and validation results. Reread only a source file changed since loading, then refresh affected values and validation results.

## 2. First demand

1. If `.aicontext/config.yml` is missing, follow `create-config.md`.
2. Read `.aicontext/config.yml` and `config.local.yml` if present.
3. Merge recursively by key; local values override shared values without replacing sibling keys.
4. Record whether each effective value came from shared or local config.
5. Validate all present known values once using the constraints below. Ignore unknown keys silently. Record invalid fields without surfacing them unless requested.

### Validation

- `after_*.review`: `normal`, `deep`, `false`, `ask`
- `after_*.tests`: type, optional `-full` or `-affected` scope, or a `|`-joined list. Type names must exist in `structure.md`'s `## Testing` table. Skip type lookup for `all`, `false`, `ask`, and literal shell commands.
- `after_*.commit`, `after_task.push`, `after_task.pr`, `after_task.review_loop`, `tdd`, `commit.body`, `spec_naming.derive_from_task`, `issue.save_to_file`, `gh_fix_tests.push`: allowed booleans; lifecycle fields and `tdd` also allow `ask`.
- `task_naming.source`: `git-branch`, `package-json`, `manual`
- `update_check.frequency`: `daily`, `weekly`, `biweekly`, `monthly`, `never`
- `claude.question_style`: `numbered`, `interactive`
- `issue.create_in_github`: `true`, `false`, `ask`
- Unrestricted strings, `task_naming.pattern: ask`, supported task-naming templates, and unknown extra fields are valid.

If deprecated keys, values, or tokens are present, follow `migrate-config.md` immediately. Migrate each value in its source file, reread changed sources, rebuild merged values, and revalidate affected fields.

## 3. Requested fields

For each requested field:

- **Missing:** read only its default from `.aicontext/templates/config.template.yml`, copy it into shared config, then refresh the session memo. A commented default counts as the default.
- **Invalid:** show the field's valid options, require a correction, and persist it in the source file that supplied the invalid value. Revalidate before use.
- **`ask`:** for `after_step.*`, `after_task.*`, and `tdd`, follow `resolve-asks.md` with only the requested `ask` fields. Other `ask` fields retain the interaction defined by their owning workflow.

Return only the requested effective values to the caller.

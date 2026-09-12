# Migrate Config

Supply one requested missing field from relevant legacy aliases without scanning the rest of config.

**Called with:** `field` - the requested field missing from the merged config.

## 1. Find aliases

Inspect only aliases listed for `field`. Resolve shared/local alias values with local precedence.

| Requested field | Legacy alias | Mapping |
|---|---|---|
| `after_step.commit` | `commit.mode` | `per-step` → `true`; `per-task`, `manual` → `false` |
| `after_task.commit` | `commit.mode` | `per-task` → `true`; `per-step`, `manual` → `false` |
| `after_task.commit` | `commit.finish_action` | `nothing` → `false`; `ask` → `ask`; `commit`, `commit+push` → `true` |
| `after_task.push` | `commit.finish_action` | `commit+push` → `true`; other recognized values → `false` |
| `after_task.review` | `after_task.deep_review` | `true` → `deep`; `false` → `false` |
| `after_task.tests` | `after_task.full_tests` | `true` → `all`; `false` → `false` |

For `after_task.commit`, `commit.finish_action` overrides `commit.mode` when both are present.

## 2. Migrate

If a recognized alias supplies the requested field:

1. Write the mapped value to the alias's source file.
2. Remove a single-purpose alias (`deep_review` or `full_tests`) after migration.
3. Keep `commit.mode` and `commit.finish_action` until every replacement they can supply exists; do not create unrequested replacement fields merely to remove an alias.
4. Report only the requested field's migration.

If no recognized alias supplies the requested field, return `MISSING` without inspecting or reporting other discrepancies. `ensure-config.md` restores the template default.

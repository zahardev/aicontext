# Migrate Config

Invoked by `ensure-config.md` when validation detects deprecated keys, values, or tokens. Fix the values in whichever file contains them (`config.yml` or `config.local.yml`). Do not move keys between files.

Map to the new structure, remove old keys, note the one-time migration in your reply.

## Commit keys

| Old key | New keys |
|---|---|
| `commit.mode: per-step` | `after_step.commit: true`, `after_task.commit: false` |
| `commit.mode: per-task` | `after_step.commit: false`, `after_task.commit: true` |
| `commit.mode: manual` | `after_step.commit: false`, `after_task.commit: false` |
| `commit.finish_action: nothing` | `after_task.commit: false` |
| `commit.finish_action: ask` | `after_task.commit: ask` |
| `commit.finish_action: commit` | `after_task.commit: true` |
| `commit.finish_action: commit+push` | `after_task.commit: true`, `after_task.push: true` |

If both `commit.mode` and `commit.finish_action` are present, apply `commit.mode` first, then let `commit.finish_action` override `after_task.commit` / `after_task.push`. Strip both old keys once mapped.

## Review/tests scope keys

| Old key | New key |
|---|---|
| `after_step.review: true` | `after_step.review: normal` |
| `after_step.tests: true` | `after_step.tests: normal` |
| `after_task.deep_review: true` | `after_task.review: deep` |
| `after_task.deep_review: false` | `after_task.review: false` |
| `after_task.full_tests: true` | `after_task.tests: deep` |
| `after_task.full_tests: false` | `after_task.tests: false` |

## Review vocabulary

| Old value | New value |
|---|---|
| `partial` | `normal` |
| `full` | `deep` |

Apply to `after_step.review` and `after_task.review` only.

## Tests vocabulary

See `config.template.yml` for the grammar:

| Old value | New value (after_step) | New value (after_task) |
|---|---|---|
| `partial` | `<primary-type>-affected` | `<primary-type>-affected` |
| `normal`  | `<primary-type>-affected` | `<primary-type>-affected` |
| `full`    | `all`                     | `all`                     |
| `deep`    | `all`                     | `all`                     |

Primary type = first row in `structure.md`'s `## Testing` table, or the row named `unit` if present. If no type table exists yet, leave the value untouched.

Apply to `after_step.tests` and `after_task.tests` only. Update the inline comment if present.

## Task naming token

If `task_naming.pattern` contains `{task-name}`, rewrite to `{task_name}`.

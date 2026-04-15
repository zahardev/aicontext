# Ensure Config

Read project settings from `.aicontext/config.yml` (and `config.local.yml` if it exists — local overrides shared).

If `config.yml` doesn't exist:
1. Create it from `.aicontext/templates/config.template.yml` with defaults
2. If `project.md` has existing commit rules or task naming settings, migrate those values into the new `config.yml` and remove the stale sections from `project.md`
3. Tell the user: "Created config.yml with defaults. Edit `.aicontext/config.yml` to customize."

If `config.yml` exists but is missing sections or keys present in the template, add the missing entries with their default values.

## Deprecated keys

Sweep these on every read. If any are present in `config.yml`, map to the new structure, remove the old keys, and note the one-time migration in your reply.

### Commit keys (removed in 1.7.0)

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

### Review/tests scope keys (unified in 1.7.0)

| Old key | New key |
|---|---|
| `after_step.review: true` | `after_step.review: normal` |
| `after_step.tests: true` | `after_step.tests: normal` |
| `after_task.deep_review: true` | `after_task.review: deep` |
| `after_task.deep_review: false` | `after_task.review: false` |
| `after_task.full_tests: true` | `after_task.tests: deep` |
| `after_task.full_tests: false` | `after_task.tests: false` |

After mapping, remove `after_task.deep_review` and `after_task.full_tests` from config. The boolean `true` forms above migrate to `normal`/`deep` based on timing — `after_step.*` defaults to `normal`, `after_task.*` defaults to `deep`.

### Review/tests vocabulary (renamed in 1.8.0)

| Old value | New value |
|---|---|
| `partial` | `normal` |
| `full` | `deep` |

Apply to `after_step.review`, `after_step.tests`, `after_task.review`, and `after_task.tests`. Rewrite the value in config and update the inline comment if present.

### Task naming token (renamed in 1.9.0)

If `task_naming.pattern` contains `{task-name}`, rewrite to `{task_name}` — the token was normalized to snake_case to match `{issue_id}` / `{version}` / `{date}`.
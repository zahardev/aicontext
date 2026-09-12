# Resolve Asks

**Called with:** `fields` — requested config fields that need user input (`after_step.*`, `after_task.*`, or `tdd`), including each field's source file and whether its value is `ask` or invalid.

## 1. Preflight — type-table discovery

If requested `tests` fields need a missing `## Testing` table, pass only those fields to `resolve-test-types.md`. After it returns, refresh their config values and remove resolved fields from the prompt list.

## 2. Stage 1 — decision per field

Present options using user-friendly labels, not config field names. Ask per `## Question UX` in `standards.md` — number across the entire batch. Only prompt for fields in the passed list.

**Root-level:**

| Config field | Question | Options | Config value |
|---|---|---|---|
| `tdd` | Use test-driven development? Write tests before implementation for testable plan steps. | 1) Yes (recommended), 2) No | `true` / `false` |

**After each step:**

| Config field | Question | Options | Config value |
|---|---|---|---|
| `after_step.review` | Review code after each step? | 1) No (recommended), 2) Normal review — this step's changes, 3) Deep review — architecture + correctness | `false` / `normal` / `deep` |
| `after_step.tests` | Run tests after each step? | 1) No (recommended), 2) Affected tests only, 3) All | `false` / `<primary-type>-affected` / `all` |
| `after_step.commit` | Commit after each step? | 1) No (recommended), 2) Yes | `false` / `true` |

**After task completion:**

| Config field | Question | Options | Config value |
|---|---|---|---|
| `after_task.review` | Review code after task? | 1) Deep review (recommended) — architecture + correctness, 2) Normal review — bugs + security only, 3) No | `deep` / `normal` / `false` |
| `after_task.tests` | Run tests after task? | 1) All (recommended), 2) Affected tests only, 3) No | `all` / `all-affected` / `false` |
| `after_task.commit` | Commit after task? | 1) Yes (recommended), 2) No | `true` / `false` |
| `after_task.push` | Push to remote? | 1) No (recommended), 2) Yes | `false` / `true` |
| `after_task.pr` | Draft pull request after task? | 1) No (default), 2) Yes | `false` / `true` |
| `after_task.review_loop` | Run pull request review loop after task? | 1) No (default), 2) Yes | `false` / `true` |

**Tests rows — `<primary-type>`:** resolves to the first row in `structure.md`'s `## Testing` table, or the row named `unit` if present.

## 3. Persist

- **`ask` value:** after the Stage-1 answer, ask `Save as default? (y/N)` — default N. If yes, write the answer to the source file that supplied `ask`; if no, apply it only to this run.
- **Invalid value:** explain why it is invalid and always persist the selected correction to its source file.
- **Missing value restored by `ensure-config.md`:** its template default is already in shared config; handle an `ask` default normally.

For `tests` fields, persist the explicit scope form from the table (for example, `unit-affected`, not bare `unit`). Revalidate every persisted value and refresh the config session memo.

## 4. Return

Return the resolved map to the caller.

# Resolve Asks

Prompt the user for each field in the passed list, run the preflight if needed, and return resolved values.

**Called with:** `fields` — list of `after_step.*` / `after_task.*` config fields that need user input. Caller has already collected them.

## 1. Preflight — type-table discovery

If any `tests` field is in the list AND `structure.md` has no `## Testing` type table: run `resolve-test-types.md` once before prompting. The discovery flow writes the table and persists `after_step.tests` + `after_task.tests` to explicit values — after it returns, re-read config and drop any `tests` fields it already resolved from the list.

## 2. Stage 1 — decision per field

Present options using user-friendly labels, not config field names. Ask per `## Question UX` in `standards.md` — number across the entire batch. Only prompt for fields in the passed list.

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

## 3. Stage 2 — save as default

After every Stage-1 answer, ask `Save as default? (y/N)` — default N. If y, write the answer back to `config.yml` so it won't ask again. If n, the answer applies only to this run. For the `tests` fields, save the explicit scope form shown in the "Config value" column (e.g. `unit-affected`, not bare `unit`).

## 4. Return

Return the map of resolved values to the caller.

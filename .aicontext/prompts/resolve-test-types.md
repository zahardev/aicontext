# Resolve Test Types

One-shot discovery flow. Scans the project for test commands, proposes a type mapping, and writes the confirmed result to `structure.md` (`## Testing` table) and `config.yml` (`after_*.tests` values).

Run when:
- `structure.md` has no `## Testing` type table
- `after_*.tests` is set to `ask` and the ask-batch preflight (in `resolve-asks.md`) detects a missing type table
- The user explicitly asks to set up test types

## 1. Scan

Look for test commands in common places:

| Source | Parse |
|---|---|
| `package.json` | `scripts` keys matching `test`, `test:*` |
| `Makefile` | targets starting with `test` |
| `composer.json` | `scripts.test*` |
| `pyproject.toml` / `tox.ini` | `[tool.pytest.ini_options]`, `tox` envs |
| `Cargo.toml` | presence implies `cargo test` |
| `go.mod` | presence implies `go test ./...` |
| `playwright.config.*` / `cypress.config.*` | implies an e2e type |
| `jest.config.*` / `vitest.config.*` | implies a unit type |

Record each command found.

## 2. Map to canonical types

Assign each detected command to the closest canonical type using the script name / config file:

- **unit** — `test`, `test:unit`, files under `test/`, `tests/unit/`, jest/vitest without path filter
- **integration** — `test:integration`, `test:int`, files under `tests/integration/`
- **e2e** — `test:e2e`, playwright/cypress configs, files under `e2e/`, `tests/e2e/`

Commands that don't map → list under "Other (rename to a custom type)".

If nothing is detected, propose one row: `| unit | <blank — ask user> | |`.

## 3. Propose

Show the user the proposed table and the resulting `config.yml` values:

```
Proposed type table (structure.md → ## Testing):

| Type        | Full                         | Affected                         |
|-------------|------------------------------|----------------------------------|
| unit        | <detected command>           | <suggested {files} variant or blank> |
| integration | <detected command>           |                                  |
| e2e        | <detected command>           |                                  |

Proposed config.yml:
  after_step.tests: unit-affected
  after_task.tests: all
```

For the `Affected` column suggestions:
- If Full is `node --test ...`, suggest `node --test {files}`
- If Full is `jest` or `vitest`, suggest `<runner> --findRelatedTests {files}`
- If Full is `pytest`, suggest `pytest {files}`
- If Full is `go test ./...`, leave blank (go test takes packages, not files — heuristic fallback handles it)
- Otherwise leave blank

## 4. Confirm / edit

Ask per `## Question UX` in `standards.md`:

> 1. **Accept as proposed**
> 2. **Edit** — walk each row; user can rename type, change commands, add/remove rows
> 3. **Cancel**

## 5. Write

On accept:
- Update `structure.md` `## Testing` section with the confirmed table (keep existing columns, replace rows)
- Update `config.yml`:
  - `after_step.tests` → `<primary-type>-affected` (primary = first row, or `unit` if present)
  - `after_task.tests` → `all`
  - Write explicit scope form; do not save bare type names

Report what changed in one line: `Wrote N types to structure.md; set after_step.tests=X, after_task.tests=Y in config.yml.`

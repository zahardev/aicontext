# Generate Docs

Generate project documentation from code and AIContext artifacts.

## 1. Config

Follow `ensure-config.md` to load settings. Read `docs.output_path` — default `.aicontext/docs/`.

If `docs.output_path` is not set or missing, ask:

> Where should generated docs be saved?
> 1. `.aicontext/docs/` (tracked with project)
> 2. `docs/` (project root)
> 3. Custom path

Write the chosen value to `docs.output_path` in `config.yml`.

Create the output directory if it doesn't exist.

## 2. Type Selection

Ask what to generate:

> What documentation to generate?
> 1. **Reference** — internal technical docs (architecture, config, decisions)
> 2. **Guide** — user-facing usage docs (getting started, features, how-to)
> 3. **Both**

## 3. Execute

Based on selection:

- **Reference** or **Both**: follow `generate-reference.md` with the resolved `output_path`
- **Guide** or **Both**: follow `generate-guide.md` with the resolved `output_path`

## 4. Summary

After all selected types are generated:

```
Documentation generated:
- {list of files written with paths}
```

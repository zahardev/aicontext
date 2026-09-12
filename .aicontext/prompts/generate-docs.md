# Generate Docs

Generate project documentation from code and AIContext artifacts.

## 1. Config

Follow `ensure-config.md` with `docs.output_path`, then create the resolved output directory if it does not exist.

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

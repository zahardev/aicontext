# Ensure Config

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
- **Unexpected:** use options from the caller, or read only this field's template entry. Show the options, persist the correction in its source file, and refresh the session memo.

### Missing value

1. Follow `migrate-config.md` with the requested field. Inspect only legacy aliases that can supply that field.
2. If an alias supplies the field, migrate it in its source file, refresh the session memo, and handle the resulting value as a present value.
3. Otherwise read only that field's default from `.aicontext/templates/config.template.yml`, persist it to shared config, refresh the session memo, and handle the default as a present value. A commented default counts as the default.

Return only the requested effective values to the caller.

# Ensure Config

Read project settings from `.aicontext/config.yml` (and `config.local.yml` if it exists — local overrides shared).

If `config.yml` doesn't exist:
1. Create it from `.aicontext/templates/config.template.yml` with defaults
2. If `project.md` has existing commit rules or task naming settings, migrate those values into the new `config.yml` and remove the stale sections from `project.md`
3. Tell the user: "Created config.yml with defaults. Edit `.aicontext/config.yml` to customize."

If `config.yml` exists but is missing sections or keys present in the template, add the missing entries with their default values.
# Update Check

Check for AIContext updates. Follow `ensure-config.md` to read project settings.

## 1. Read frequency

Read `update_check.frequency` from config.

- **If not set** (commented out or missing): ask before proceeding.
  > "How often should I check for AIContext updates during `/start`?"
  > 1. **weekly** (recommended)
  > 2. **daily**
  > 3. **biweekly**
  > 4. **monthly**
  > 5. **never**

  Write the chosen value to `update_check.frequency` in `config.yml`.
- **If `never`**: stop here.

## 2. Get current date

Run `date` via Bash to get the current date.

## 3. Check if it's time

Read `.aicontext/data/version.json`. If missing or unreadable, go to step 4.

Compare `nextCheck` (YYYY-MM-DD) against today's date:

- **Not due yet** → skip silently to step 5.
- **Due (today ≥ `nextCheck`)** → proceed to step 4.

## 4. Fetch latest version

Run `aicontext version {project_root}` via Bash (substitute the actual project root path). The CLI creates `.aicontext/data/version.json` with `cliVersion`, `currentVersion`, `latestVersion`, and `lastChecked`.

After that, add `nextCheck` to `.aicontext/data/version.json` — today + frequency offset:

| Frequency | Add to today |
|-----------|-------------|
| daily | 1 day |
| weekly | 7 days |
| biweekly | 14 days |
| monthly | 30 days |

If the CLI is not available, stop silently — update checks require `aicontext` in PATH.

## 5. Compare and offer upgrade

Read `cliVersion`, `currentVersion`, and `latestVersion` from the cache. Compare and offer the appropriate action:

- **CLI outdated** (`cliVersion` < `latestVersion`): `aicontext upgrade`, then `aicontext update`
- **Project outdated** (`currentVersion` < `cliVersion`): `aicontext update`
- **Neither outdated** or versions missing: stop silently.

> "AIContext update available: {description of what's outdated}. Would you like me to run the upgrade?"
> 1. **Yes** — run the appropriate command(s)
> 2. **Not now**

If the user picks "Not now", the notification reappears on the next eligible `/start`.

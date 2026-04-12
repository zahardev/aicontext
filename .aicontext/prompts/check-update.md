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

- **Not due yet** → skip to step 5.
- **Due (today ≥ `nextCheck`)** → proceed to step 4.

## 4. Fetch latest version

Run `aicontext version --cache /path/to/.aicontext/data/version.json` via Bash. The CLI checks npm and writes the cache file.

After the CLI writes the cache, update `.aicontext/data/version.json` with:

1. `lastChecked` — today (YYYY-MM-DD)
2. `nextCheck` — today + frequency offset:

| Frequency | Add to today |
|-----------|-------------|
| daily | 1 day |
| weekly | 7 days |
| biweekly | 14 days |
| monthly | 30 days |

**Fallback — `aicontext` not in PATH:** WebFetch `https://registry.npmjs.org/@zahardev/aicontext/latest` for the `version` field. Write `.aicontext/data/version.json` with `latestVersion`, `lastChecked`, and `nextCheck`.

## 5. Compare and offer upgrade

Read `.aicontext/.version` for the installed version. If missing, stop silently. Compare against `latestVersion` from the cache. If not newer, stop silently.

> "AIContext update available: v{current} → v{latest}. Would you like me to run the upgrade?"
> 1. **Yes** — run `aicontext upgrade`
> 2. **Not now**

If the user picks "Not now", the notification reappears on the next eligible `/start`.

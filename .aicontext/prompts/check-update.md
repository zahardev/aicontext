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

## 2. Check if it's time

Read `/tmp/aicontext-version-cache.json`. If missing or unreadable, go to step 3.

Compare `lastChecked` against the frequency threshold:

| Frequency | Threshold |
|-----------|-----------|
| daily | 1 day |
| weekly | 7 days |
| biweekly | 14 days |
| monthly | 30 days |

- **Time to check** (lastChecked older than threshold) → proceed to step 3.
- **Not time, cache has `latestVersion`** → compare against the installed CLI version from the cache. If an update exists, skip to step 4. Otherwise stop silently.
- **Not time, no cached update** → stop silently.

## 3. Run the check

Run `aicontext version` via Bash. The CLI checks npm, displays version info, and writes the cache file (including `lastChecked`). **Do not** read `.aicontext/.version`, query npm, or write the cache yourself — the CLI does all of this.

Parse the output. If it contains "Update available", proceed to step 4. Otherwise stop silently.

**Fallback — `aicontext` not in PATH:** read `.aicontext/.version` for the installed version, then WebFetch `https://registry.npmjs.org/@zahardev/aicontext/latest` for the `version` field. Compare. Write to `/tmp/aicontext-version-cache.json` as JSON with `latestVersion`, `timestamp` (Unix ms), and `lastChecked` (ISO). **This is the only path where the AI writes the cache.** If no update, stop silently.

## 4. Offer upgrade

> "AIContext update available: v{current} → v{latest}. Would you like me to run the upgrade?"
> 1. **Yes** — run `aicontext upgrade`
> 2. **Not now**

If the user picks "Not now", the notification reappears on the next eligible `/start`.

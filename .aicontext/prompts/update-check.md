# Update Check

Check for AIContext updates. Follow `ensure-config.md` to read project settings.

## 1. Read frequency

Read `update_check.frequency` from config.

- **If not set** (commented out or missing): ask the user for their preference before proceeding.
  > "How often should I check for AIContext updates during `/start`?"
  > 1. **weekly** (recommended)
  > 2. **daily**
  > 3. **biweekly**
  > 4. **monthly**
  > 5. **never**
  Write the chosen value to `update_check.frequency` in `config.yml`.
- **If `never`**: skip the update check entirely. Stop here.

## 2. Check if it's time

Read the cache file at `/tmp/aicontext-version-cache.json`. If the cache file doesn't exist or can't be read, proceed directly to step 3.

Compare `lastChecked` against the frequency:

| Frequency | Check if `lastChecked` is older than |
|-----------|--------------------------------------|
| daily | 1 day |
| weekly | 7 days |
| biweekly | 14 days |
| monthly | 30 days |

**If it's not time to check but the cache has a `latestVersion`**: compare it against the CLI version from the last `aicontext version` output stored in the cache. If an update exists, skip to step 4. Otherwise stop here.

**If it's not time to check and no cached update exists**: stop here silently — produce no update check output.

## 3. Run the check

Try to run `aicontext version` via Bash. The CLI handles everything: it checks the npm registry, displays version info, and writes the cache file (including `lastChecked`). **Do not** read `.aicontext/.version`, query npm, or write the cache yourself — the CLI does all of this.

Parse the output — if it contains "Update available", an update exists. If no update, stop here.

**Fallback — if `aicontext` is not in PATH** (command fails with "not found"): read the installed version from `.aicontext/.version`, then use WebFetch to query `https://registry.npmjs.org/@zahardev/aicontext/latest` and read the `version` field from the JSON response. Compare the two versions. Write the result to the cache file (`/tmp/aicontext-version-cache.json`) as JSON with `latestVersion`, `timestamp` (Unix milliseconds, e.g. `1712345678000`), and `lastChecked` (ISO date string). This is the only path where the AI writes the cache.

If no update is available, stop here silently — produce no update check output.

## 4. Offer upgrade

> "AIContext update available: v{current} → v{latest}. Would you like me to run the upgrade?"
> 1. **Yes** — run `aicontext upgrade`
> 2. **Not now**

If user picks Not now, the notification will reappear on the next eligible `/start`.

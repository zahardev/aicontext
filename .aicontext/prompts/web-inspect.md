# Web Inspect

Browser-based investigation using [playwright-cli](https://github.com/microsoft/playwright-cli) (Apache 2.0). Use this when you need to visually inspect a web page, check console errors, interact with UI elements, or capture screenshots.

## Install

If `playwright-cli` is not available, guide the user:

```bash
npm install -g @playwright/cli@latest
playwright-cli install-browser
```

After installation, verify: `playwright-cli --version`

## Core Workflow

Always use **headed mode** so the user can see the browser and intervene when needed (e.g., login, CAPTCHA).

### 1. Open the browser

```bash
playwright-cli open --headed <url>
```

### 2. Get page structure

```bash
playwright-cli snapshot
```

Returns a text representation of the page with element refs (e.g., `e1`, `e2`, `e3`). Use these refs to target elements — don't guess selectors.

### 3. Interact with elements

```bash
playwright-cli click <ref>              # click an element
playwright-cli fill <ref> "<text>"      # type into an input
playwright-cli select <ref> "<value>"   # pick a dropdown option
playwright-cli hover <ref>              # hover over element
playwright-cli check <ref>              # check a checkbox
```

After any interaction that changes the page (submit, navigation, modal), run `snapshot` again to get updated refs.

### 4. Check for errors

```bash
playwright-cli console error            # show JS errors
playwright-cli console                  # show all console messages
playwright-cli network                  # show network requests since page load
```

### 5. Capture state

```bash
playwright-cli screenshot                        # visible viewport
playwright-cli screenshot --full-page             # full scrollable page
playwright-cli screenshot <ref>                   # specific element
playwright-cli screenshot --filename "name.png"   # save with name
```

### 6. Run JavaScript

```bash
playwright-cli eval "() => document.title"
playwright-cli eval "() => window.innerWidth"
playwright-cli eval "() => document.querySelectorAll('.error').length"
```

## Authentication

**Default (recommended):** The browser opens in headed mode — the user logs in manually. This avoids sharing credentials with the AI agent.

**For repeated sessions:** The user can save and restore auth state:

```bash
playwright-cli state-save                # after manual login (filename optional)
playwright-cli state-load auth.json     # in future sessions
```

The user decides where to keep auth state files. Never ask for credentials.

## Best Practices

- **Snapshot before acting** — always get refs first, never guess selectors
- **Re-snapshot after changes** — page mutations invalidate previous refs
- **Console first for debugging** — check `console error` before visual inspection
- **Screenshots for visual issues** — when layout/styling is the question, a screenshot is more useful than a snapshot
- **Headed by default** — only use headless when explicitly requested by the user

## Advanced Commands

For commands not covered here (tabs, cookies, storage, tracing, video, network mocking, keyboard/mouse control):

```bash
playwright-cli --help              # full command list
playwright-cli --help <command>    # details for a specific command
```

# Web Inspect

Browser-based investigation using `playwright-cli`. Use when you need to visually inspect a web page, check console errors, interact with UI elements, or capture screenshots.

*If `playwright-cli` is not installed, follow `install-playwright-cli.md` first.*

## Core Workflow

Always use **headed mode** so the user can see the browser and intervene when needed (login, CAPTCHA).

### 1. Open the browser

```bash
playwright-cli open --headed <url>
```

### 2. Get page structure

```bash
playwright-cli snapshot
```

Returns a text representation of the page with element refs (`e1`, `e2`, ...). Target elements by ref, never guess selectors. Re-snapshot after any interaction that mutates the page (submit, navigation, modal).

### 3. Interact with elements

```bash
playwright-cli click <ref>              # click
playwright-cli fill <ref> "<text>"      # type into input
playwright-cli select <ref> "<value>"   # dropdown
playwright-cli hover <ref>              # hover
playwright-cli check <ref>              # checkbox
```

### 4. Check for errors

```bash
playwright-cli console error            # JS errors only — check this first when debugging
playwright-cli console                  # all console messages
playwright-cli network                  # network requests since page load
```

### 5. Capture state

```bash
playwright-cli screenshot [--full-page] [<ref>] [--filename "name.png"]
```

Viewport by default, `--full-page` for long scrollable content, `<ref>` for a specific element. Screenshots beat snapshots for layout/styling questions.

### 6. Run JavaScript

```bash
playwright-cli eval "() => document.title"
```

## Authentication

**Default:** headed mode — the user logs in manually. Never ask for credentials.

**For repeated sessions:** save and restore auth state:

```bash
playwright-cli state-save                # after manual login (filename optional)
playwright-cli state-load auth.json      # in future sessions
```

## More commands

For tabs, cookies, storage, tracing, video, network mocking, keyboard/mouse control: `playwright-cli --help` or `playwright-cli --help <command>`.

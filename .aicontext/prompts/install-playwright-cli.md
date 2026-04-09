# Install playwright-cli

`/web-inspect` requires [`@playwright/cli`](https://github.com/microsoft/playwright-cli) (Apache 2.0).

Show the user the install commands, then ask whether to run them:

```bash
npm install -g @playwright/cli@latest
playwright-cli install-browser
```

> Install playwright-cli now?
> 1. **Yes** — I'll run the commands above
> 2. **No** — I'll run them myself

**On Yes:** run the two commands via Bash, then verify with `playwright-cli --version`. On failure (permission error, network issue, wrong npm version), show the error and fall back to option 2.

**On No:** display the commands and wait for the user to run them, then verify with `playwright-cli --version` before proceeding.

# Step Inner Loop

Execute a single step from the task plan, where N is the step number.

1. **Implement** the step
2. **Review** — if After Step review is Yes in quality checks table (`.aicontext/rules/process.md`): ask `reviewer` subagent (Claude Code only; run inline in other tools)
3. **Assess** findings using the severity × effort table in `process.md`
4. **Fix** actionable issues
5. **Re-review** — repeat 2–4 up to 5 times total. If issues remain after 5 iterations, stop and tell the user: "I've done 5 review cycles — please check if there are remaining issues." The user decides to resolve manually or run another cycle.
6. **Test** — if After Step tests are Yes: ask `test-runner` subagent to run step-related tests
7. **Fix tests** — if tests fail and the fix is clear, fix and re-run
8. **Commit** — if `commit.mode` is `per-step`, delegate to `commit.md`
9. **Close step** — follow `.aicontext/prompts/close-step.md` (updates task, brief, spec and outputs a summary with counts). Do not advance to the next step until the close-step summary is output.

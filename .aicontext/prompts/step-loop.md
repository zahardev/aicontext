# Step Inner Loop

Execute a single step from the task plan.

1. **Implement** the step
2. **Review** — if After Step review is Yes in the quality checks table (`process.md`): ask `reviewer` subagent (Claude Code; inline otherwise)
3. **Assess** findings using the severity × effort table in `process.md`
4. **Fix** actionable issues
5. **Re-review** — repeat 2–4 up to 5 times total. If issues remain after 5 iterations, stop and tell the user: "I've done 5 review cycles — please check if there are remaining issues." The user decides to resolve manually or run another cycle.
6. **Test** — if After Step tests are Yes: ask `test-runner` subagent (Claude Code; inline otherwise) for step-related tests
7. **Fix tests** — if tests fail and the fix is clear, fix and re-run. Otherwise stop (see Stop Conditions in `run-task.md`).
8. **Commit** — if `commit.mode` is `per-step`, delegate to `commit.md`
9. **Close step** — follow `close-step.md` (updates task, brief, spec and outputs a summary with counts). Do not advance until the close-step summary is output.

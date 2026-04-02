# Step Inner Loop

Execute a single step from the task plan, where N is the step number.

1. **Implement** the step
2. **Review** — if After Step review is Yes in quality checks table (`.aicontext/rules/process.md`): ask `reviewer` subagent (Claude Code only; run inline in other tools)
3. **Assess** findings using the severity × effort table in `process.md`
4. **Fix** actionable issues
5. **Re-review** — repeat 2–4 up to 5 times total. If issues remain after 5 iterations, stop and tell the user: "I've done 5 review cycles — please check if there are remaining issues." The user decides to resolve manually or run another cycle.
6. **Test** — if After Step tests are Yes: ask `test-runner` subagent to run step-related tests
7. **Fix tests** — if tests fail and the fix is clear, fix and re-run
8. **Commit** — if `commit_mode` is `per-step`, commit using the configured template
9. **Update task** — check off completed items (`- [ ]` → `- [x]`) and update Last Updated date
10. **Update brief** *(required — do not advance to the next step until this is done)* — append findings prefixed with `[Step N]` (N = plan step number):
    - Codebase Patterns: patterns or conventions discovered
    - Gotchas: non-obvious issues or constraints
    - Decisions: choices made and why
    - File References: files created or modified
11. **Elevate to spec** — scan the new brief entries: does any of it change requirements, add a non-goal, or represent an architectural decision? If yes, update the appropriate spec section (Requirements, Non-goals, or Decisions). When adding a new requirement, immediately check if it's covered by an existing task step — if not, propose adding a step to the current task or creating a separate task.

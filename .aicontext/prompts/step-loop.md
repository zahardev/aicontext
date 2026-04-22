# Step Inner Loop

Execute a single step from the task plan. Reads `after_step.*` from `config.yml` per Quality Checks in `process.md`.

## Review corpus

The `reviewer` subagent needs to know *what changed* — the corpus — which depends on commit state:

| Timing | Commit state | Corpus |
|---|---|---|
| `after_step` | No commits since task start (working tree dirty) | working tree (staged + unstaged + untracked) |
| `after_step` | Last commit is from this step | `HEAD^..HEAD` — just that commit |
| `after_task` | Any | `{base-branch}...HEAD` + uncommitted working tree |

Pass the corpus explicitly to the reviewer subagent along with the resolved scope (`normal` = scoped diff, `deep` = whole-branch deep pass). When committing after each step without isolating work, the reviewer sees the cumulative working tree — this is intentional (review cumulative work), and the user is responsible for committing or stashing between steps if they want isolation.

## Loop

1. **Implement** the step
2. **Review** — if `after_step.review` resolved to `normal` or `deep`: compute corpus (see above). Call `reviewer` subagent (Claude Code) or follow the playbook inline (Cursor/Copilot). Pass the exact playbook path: `normal` → `.aicontext/prompts/review.md`, `deep` → `.aicontext/prompts/deep-review.md`
3. **Assess + fix** — fix all findings except low-severity + high-effort (note in task-context) and false positives (dismiss)
4. **Re-review** — repeat 2–3 up to 5 times total. If issues remain after 5 iterations, stop and tell the user: "I've done 5 review cycles — please check if there are remaining issues." The user decides to resolve manually or run another cycle.
5. **Test** — if `after_step.tests` resolved to anything other than `false`: compute the changed-files corpus per the Review corpus table above (same rules), call `resolve-tests.md` with the resolved value, `step` context, and the corpus. If `ERROR`: surface to the user and skip tests. If `SKIP`: report skip and continue. If `COMMANDS`: pass them to `test-runner` subagent (Claude Code) or run inline (Cursor/Copilot/Codex).
6. **Fix tests** — if tests fail and the fix is clear, fix and re-run. Otherwise stop (see Stop Conditions in `run-task.md`).
7. **Commit** — if `after_step.commit` resolved to Yes: delegate to `commit.md`
8. **Close step** — follow `close-step.md` (updates task, task-context, spec and outputs a summary with counts). Do not advance until the close-step summary is output.

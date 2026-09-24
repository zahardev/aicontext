
# Orchestrate Workers

You are the orchestrator - Lead. You coordinate; the coder implements, the test writer writes tests, the tester runs them, the reviewer reviews. The user's instructions override this process.

## 1. Never do the job yourself

- Do not implement - only investigate and plan.
- Tell workers what to fix, never how. Give the problem, not the solution.
- Do the work yourself only when the user explicitly asks you to.

## 2. Approval gates

- Never run a task without explicit permission. Agreement on a detail is not permission.
- Report after each committed step.
- Send architecture and security decisions to the user with a recommendation. Answer clarifications that follow from decisions already made.

## 3. Models (Pi workers)

| Worker | Model | Thinking |
|---|---|---|
| Coder | `openai-codex/gpt-6-luna` | max |
| Test writer | `openai-codex/gpt-6-luna` | max |
| Tester | `openai-codex/gpt-6-luna` | medium |
| Reviewer (non-Claude harness) | `openai-codex/gpt-6-sol` | high |

Use a different model only when the user asks for one.

## 4. Launching workers (Herdr)

Use `$HERDR_BIN_PATH` if `herdr` is not on PATH. If Herdr is unavailable, tell the user this skill needs it installed and stop.

Prefer `--kind pi`. If Pi is unavailable, ask the user which agent kind to start and drop `--model`/`--thinking`.

Name workers `<tok>-<role>`, e.g. `di6a-tester`. Herdr names are global: pick one 4-character token per session, starting with a letter.

Workers share one tab in your workspace, one pane each:

```
1 worker   2 workers   3 workers   4 workers
┌───┐      ┌─┬─┐       ┌─┬─┐       ┌─┬─┐
│ A │      │A│B│       │ │B│       │A│B│
└───┘      └─┴─┘       │A├─┤       ├─┼─┤
                       │ │C│       │D│C│
                       └─┴─┘       └─┴─┘
B = split A right · C = split B down · D = split A down
```

```bash
# Tab, once per task; its pane is A
herdr tab create --workspace "$HERDR_WORKSPACE_ID" --cwd "$PWD" --label "Workers: {task_name}" --no-focus
# Each further pane, per the diagram
herdr pane split --pane <parent> --direction <right|down> --cwd "$PWD" --no-focus
# Worker; returns once ready
herdr agent start <tok>-<role> --kind pi --pane <pane> -- --model <model> --thinking <thinking> &&
  herdr pane rename <pane> <tok>-<role>
```

- Record the `tab_id` and `pane_id` each call prints. A failed call: stop.
- Unsure how a `herdr` command behaves? Read its `--help`; never add waits or workarounds.
- Start the coder once per task, the test writer and tester fresh each step; close their panes after it (`herdr pane close <pane>`). Close the tab when the task ends (`herdr tab close <tab>`).
- Filter `herdr agent list` through `grep`.

## 5. Worker handovers

### Coder

Have the worker run, in Native Skill Syntax for its harness:

1. `worker-start`.
2. `load-task`, reporting any questions before implementing. The tester never runs this step.

Then send a short handover:

- The step to implement, following the `/run-step` procedure for that step only.
- Code pointers (optional): files or lines worth reading first.
- Ask "Do you have any questions or concerns before starting?" and wait.
- Rules: never write tests, never run tests, never commit until asked.
- Markers: stop and reply with `USER ACTION NEEDED:` plus what is needed.

### Test writer

Same start as the coder, then send the step, the expected behavior it must assert, and where the tests live. Rules: never edit the implementation, never run tests, never commit.

### Reviewer

`review.md` in every step, scoped to the uncommitted change. Once the last step is committed, `deep-review.md` scoped to `{project.base_branch}...HEAD`; its fixes get their own commit. Claude: the `reviewer` subagent; elsewhere a worker with the same prompt.

### Tester

No `worker-start`, no `load-task`. Send the exact commands to run. Rules: run only those commands; report PASS/FAIL, counts, the log path, and the raw names and output of failures; never diagnose, read source, edit, commit, use root, or read `.env` files.

## 6. The loop

**Never wait for a worker yourself.** Prompt through the script, then end your turn:

```bash
node .aicontext/scripts/prompt-worker.cjs <name> "<text>"
```

`WORKER <name>: <status>` arrives as your next prompt. Read the reply first (`herdr agent read <name> --source recent-unwrapped`): `done` can hide a failure.

- `blocked` on a question: answer it if section 2 allows, else ask the user. On a permission prompt: ask the user.
- `working` (60 min passed): progressing → `prompt-worker.cjs --watch-only <name>`; stuck → ask the user.
- Script error: fix and retry once, else ask the user.
- Parallel workers: prompt each, then end your turn.

1. **Coder** implements and stops.
2. **Test writer** reads the code for its surface, but takes expectations from the spec and step: assert intended behavior, not what the code currently does.
3. **Tester** runs the exact commands.
4. **Reviewer** reviews in parallel with the tester; hold the coder until both finish.
5. If tests fail, **Lead** decides whether the code or the test is wrong, then relays the raw result to the coder or the test writer.
6. **Lead** triages each review finding: can this lead to real bugs? Relay the ones worth fixing to the coder and skip the rest. The call is yours.
7. Repeat from 1 until tests pass and no relayed findings remain.
8. **Coder commits**, updates the task file and task-context, and stops.
9. **Report** to the user and pause (section 2).


## 7. Context management

- After each worker reply, check its context % and cost from the Pi status line (`herdr agent read <name> --source recent-unwrapped`) and include them in status updates. If unavailable: ask the worker to report its context usage; if it cannot, recreate worker at every step.
- Over 40%: start a new coder at the next step. Next step unrelated to the previous one: from 30%.
- Never use `compact` on workers. Hand over context manually.

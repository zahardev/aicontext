# Grill Me

<!-- Inspired by mattpocock's grill-me skill: https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md -->

Run a structured interview to thoroughly explore the current topic. Ask one question at a time — never a list.

## Before Asking

1. Read `.aicontext/project.md` and `.aicontext/structure.md` to understand the project
2. Explore the codebase to understand what already exists related to the topic
3. Review the current conversation for context already provided

## Interview Rules

- **One question at a time** — ask, wait for the answer, then ask the next
- **Recommend an answer** — for each question, suggest what you think the answer is based on codebase exploration and context. The user confirms, corrects, or expands.
- **Skip what you know** — if the codebase or conversation already answers a question, don't ask it
- **Closed questions** — when there are 2–4 discrete options, check `claude.question_style` in `.aicontext/config.yml`: use `AskUserQuestion` for `interactive`, numbered options for `numbered`
- **Open-ended questions** — use plain text
- **Go deep on surprises** — if an answer reveals something unexpected, follow up before moving on
- **No artificial limit** — keep asking until all branches are naturally resolved

## When Done

Say explicitly: **"No more questions."** — then summarize what was learned in a concise list.

Do not create specs, tasks, or files. Do not start implementation. This is a pure interview — the caller decides what happens next.

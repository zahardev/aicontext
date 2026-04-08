# Grill Me

<!-- Inspired by mattpocock's grill-me skill: https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md -->

Run a structured interview to thoroughly explore the current topic. Walk dimensions breadth-first, batching independent root questions and drilling atomically only when answers depend on prior ones. Capture decisions as you go.

## 1. Before Asking

1. Read `.aicontext/project.md` and `.aicontext/structure.md` to understand the project
2. Explore the codebase to understand what already exists related to the topic
3. Review the current conversation for context already provided

## 2. Plan Dimensions

After context gathering, build an internal list of dimensions to cover. Typical dimensions: product scope, target users, data shape, integration points, edge cases, failure modes, non-goals, success criteria. The exact list depends on the topic.

If the caller (e.g., `start-feature`) seeded a starting dimension list, use it as the initial map and extend it — do not discard it and start fresh.

This list is **internal — do not show it to the user**. It exists so you have a map and don't drift into one branch and forget the rest.

The map is **live, not fixed**: after each answer, check whether the answer reveals a new dimension. If yes, add it.

## 3. Interview Rules

- **Question pacing** — follow the Question Pacing rule in `standards.md`
- **Breadth-first walking** — cycle through unasked dimensions before going deep on any one. Touch every dimension at least once before circling back for depth on the ones that need it
- **Depth-cap exception for surprises** — if an answer reveals something unexpected, you may ask at most 1–2 follow-ups on that thread before explicitly returning to the next unasked dimension
- **Recommend an answer** — for each question, suggest what you think the answer is based on codebase exploration and context. The user confirms, corrects, or expands.
- **Skip what you know** — if the codebase or conversation already answers a dimension, don't ask it
- **Closed questions** — when there are 2–4 discrete options, check `claude.question_style` in `.aicontext/config.yml`: use `AskUserQuestion` for `interactive`, numbered options for `numbered`
- **Open-ended questions** — use plain text
- **No artificial limit** — keep asking until all dimensions are naturally resolved. 30+ rounds is acceptable when quality demands it

## 4. Track Decisions

Maintain an internal "Decisions so far" list as the interview progresses. Each entry: the dimension, the decision, and a one-line rationale. Reference this list when asking follow-ups so you don't contradict earlier answers or re-ask resolved questions.

This list is also internal during the interview — it becomes the structured summary in the closing step.

## 5. When Done

Say explicitly: **"No more questions."**

Then output the structured summary:

```
## Interview Summary

### Dimensions covered
- [dimension 1]
- [dimension 2]
- ...

### Decisions
- [dimension] → [decision] — [one-line rationale]
- ...

### Open items
- [anything left unresolved or deferred]

### Out of scope
- [anything explicitly excluded]
```

The caller copies this verbatim — do not paraphrase it yourself.

## 6. Next Action (standalone mode only)

If grill-me was invoked directly (not via `start-feature` or another orchestrator), end with:

> "Want me to create a spec, a task, or leave it here?"

When invoked via `start-feature`, skip this — the orchestrator handles the next step.

Do not create specs, tasks, or files yourself. This is a pure interview — the caller decides what happens next.

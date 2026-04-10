# Interview

Run a structured interview to thoroughly explore the current topic. Walk dimensions breadth-first, batching independent root questions and drilling atomically only when answers depend on prior ones. Capture decisions as you go.

## 1. Before Asking

1. **Purpose check (standalone mode)** — when no topic is obvious from the recent conversation and no caller (e.g., `/start-feature`) seeded one, ask *"What are we trying to decide here?"* before doing anything else.
2. Load `.aicontext/project.md` and `.aicontext/structure.md` (skip if already Read earlier in this conversation — rely on memory)
3. Explore the codebase to understand what already exists related to the topic
4. Review the current conversation for context already provided

## 2. Plan Dimensions

After context gathering, build an internal list of dimensions to cover. Typical dimensions: product scope, target users, data shape, integration points, edge cases, failure modes, non-goals, success criteria. The exact list depends on the topic.

If the caller (e.g., `start-feature`) seeded a starting dimension list, use it as the initial map and extend it — do not discard it and start fresh.

This list is **internal — do not show it to the user**. It exists so you have a map and don't drift into one branch and forget the rest.

The map is **live, not fixed**: after each answer, check whether the answer reveals a new dimension. If yes, add it.

## 3. Interview Rules

- **Question pacing and closed-question UX** — follow the Question Pacing and Question UX rules in `standards.md`
- **Breadth-first walking** — cycle through unasked dimensions before going deep on any one. Touch every dimension at least once before circling back for depth on the ones that need it
- **Surprise handling** — if an answer reveals something unexpected, ask: *does this belong in an existing dimension?* If yes, allow 1–2 follow-ups (depth-cap exception). If no, add it to the dimension map (§ 2) and continue breadth-first without drilling.
- **5 Whys for diagnostics** — when intentionally drilling into a bug, failure mode, or root cause, the 5 Whys pattern (chained "why" questions) is often the right follow-up sequence.
- **Recommend an answer** — for each question, suggest what you think the answer is based on codebase exploration and context. The user confirms, corrects, or expands.
- **Skip what you know** — if the codebase or conversation already answers a dimension, don't ask it
- **No artificial limit** — keep asking until all dimensions are naturally resolved

## 4. Track Decisions

Maintain an internal "Decisions so far" list as the interview progresses. Each entry follows the format:

```
- [dimension] → [decision] — [one-line rationale] (considered: [alternatives])
```

The `(considered: …)` suffix is **optional** and recorded only when the user explicitly rejected a named alternative during the discussion — never manufactured for completeness.

Reference this list when asking follow-ups so you don't contradict earlier answers or re-ask resolved questions. The list is internal during the interview — it becomes the structured summary in the closing step.

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
- [dimension] → [decision] — [rationale] (considered: [rejected alternative])
- ...

### Open items
- [anything left unresolved or deferred]

### Out of scope
- [anything explicitly excluded]
```

The caller copies this verbatim — do not paraphrase it yourself.

## 6. Next Action (standalone mode only)

If this skill was invoked directly (not via `start-feature` or another orchestrator), end with:

> "Want me to create a spec, a task, or leave it here?"

When invoked via `start-feature`, skip this — the orchestrator handles the next step.

Do not create specs, tasks, or files yourself. This is a pure interview — the caller decides what happens next.

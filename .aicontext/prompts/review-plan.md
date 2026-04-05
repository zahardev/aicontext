Review the current plan for:

1. **Behavioral alignment** - Before comparing text, trace the feature's runtime behavior end-to-end: what triggers it, what happens, what decisions are made. Then verify the plan builds that behavior correctly. Do NOT verify by matching spec words to plan words — verify that the plan produces the right behavior across all code paths.
2. **Spec coverage** - If the task links to a spec, verify:
   - Every spec requirement is fully addressed by plan steps (not just mentioned — actually built)
   - No plan steps are outside the spec's scope (unless the task explicitly extends it)
   - Flag uncovered requirements and out-of-scope steps separately
3. **Missing steps** - Any gaps in the implementation flow?
4. **Dependency issues** - Does any step depend on a later step?
5. **Over-engineering** - Unnecessary complexity or abstractions?

If no issues: confirm "Plan is valid" and summarize the implementation order.

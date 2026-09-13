# Implementer checklist

Used when a feature status is `In progress`. Execute **only the single next
incomplete task** of the feature.

## Steps

- [ ] Read `AGENTS.md` → `CURRENT.md` → the feature → its linked task plan to locate the next incomplete task.
- [ ] Confirm its acceptance test(s) are already defined; if not, stop and use `planner.md`.
- [ ] Inspect the **actual** library/tool APIs (e.g. PixiJS, bitECS, Vitest,
      Playwright) before coding. Do not assume signatures from memory.
- [ ] Implement the smallest change that satisfies one acceptance test.
- [ ] Run that test (and any already-implemented tests). Record command + observed
      result in the task plan. No success claim without a recorded run.
- [ ] Complete all acceptance checks for this single task, tick its box with evidence, update status and CURRENT.md, then stop. Never start a second task in the same run.

## Transition

- When all implementation+test tasks are ticked with evidence, set status `Test` and
  point `CURRENT.md` at the review task (`reviewer.md`).
- If a bug or reusable lesson surfaces, record it for the review/reflection step;
  apply process-doc changes only when the lesson is reusable (see `RULES.md`).

# Reviewer checklist

Used when a feature status is `Test` or `Review`. Independent of implementation.

## Steps

- [ ] Re-run the feature's **full** acceptance test set; record commands + results.
- [ ] Confirm every acceptance test passed; record evidence, no unsupported claims.
- [ ] Demo: describe the observed behaviour (visible square, resize, lifecycle) and
      how to reproduce it.
- [ ] Reflect: list any bug or friction found while completing the feature.
- [ ] Apply a process/doc change **only** for a reusable lesson (update `RULES.md`,
      a `skills/*.md`, `doc/*`); keep feature-specific notes in the feature file.
- [ ] Keep docs clean: remove any checklist or rule now unused.

## Transition

- When all acceptance tests pass, the demo is captured, and reflection is resolved,
  set status `Done`.
- Move the completed task body to `tasks/` history; update `CURRENT.md` to the next
  feature (or "none"). Stop; do not start new features in a review run.

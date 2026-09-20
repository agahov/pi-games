# Criteria — Implementation

Loaded during **Implement**, **Test**. Self-check before reaching Judge.
All domain terms per [`../UBIQUITOUS_LANGUAGE.md`](../UBIQUITOUS_LANGUAGE.md).

## Structure
- [ ] **One idea per function.** If a function's signature can't be read as one sentence, split it.
- [ ] **No cross-layer imports.** No direct import between Vue, ECS, or PixiJS. Only `cmd_bus`.
- [ ] **Open/closed.** New feature adds new Components and Entities. No edits to existing Systems.
- [ ] **Coupling metric.** Removing a feature touches ≤ 1 System.

## ECS
- [ ] **Components are data only.** No methods, no logic. SoA plain objects.
- [ ] **No side effects in Systems** outside mutating `World` or emitting via `cmd_bus`.

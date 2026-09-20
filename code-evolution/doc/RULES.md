# Rules

Absolute, cross-cutting. Applies to every phase, every run. No exceptions.
All domain terms are defined in [`UBIQUITOUS_LANGUAGE.md`](UBIQUITOUS_LANGUAGE.md) — one source of truth.

Phase-specific checklists are under [`criteria/`](criteria/):

| When to load | File | Used by |
|---|---|---|
| Define, Plan, Optimize | [`criteria/DOC.md`](criteria/DOC.md) | agent, when authoring or editing docs |
| Implement, Test | [`criteria/IMPLEMENT.md`](criteria/IMPLEMENT.md) | agent, when writing or testing code |
| Judge | [`criteria/REVIEW.md`](criteria/REVIEW.md) | REVIEWER skill |

## Always-On Invariants

### Structure
- **Open/closed.** A feature **adds** new components and entities. It **never edits** an existing System.
- **No cross-layer imports.** Layers communicate via `cmd_bus` only. No direct import between Vue, ECS, or PixiJS.
- **Coupling metric.** Removing a feature touches **≤ 1** System. More than 1 means the design is coupled.

### Clarity
- **No duplication.** One concept → one source doc. Other docs link to it.
- **One idea per unit.** One sentence per function. One concept per document section.

### Process
- **One task.** Work only the next incomplete task.
- **Judge is mandatory.** Every Run produces `judge.md`. No judge = not done.
- **Bug ≠ hotfix.** A bug after a feature → `reflection.md`, not a patch.
- **`CURRENT.md`** always reflects active task + status.
- **`LOG.md`** updated when any principle or criterion changes.

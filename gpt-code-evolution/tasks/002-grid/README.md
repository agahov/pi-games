# Grid tasks

- **Feature.** [002 — 8×8 grid](../../features/002-grid.md).
- **Prerequisite.** [Feature 001](../../features/001-square.md) Done; do not replace its visible square before acceptance/review.
- **Order.** One task per session:
  1. [0021 — Grid state](0021-grid-state.md)
  2. [0022 — Grid presentation](0022-grid-presentation.md)
  3. [0023 — Review and demo](0023-review-demo.md)
- **Types.** New Archetype (Cell recipe + initialization) and updated Visualization (borders); no new/extended behavior or UI.
- **Reuse.** Position + Square and RenderSystem already support multiple entities. Grid layout belongs in initialization, not a new processing system.
- **Style.** Borders remain presentation configuration; no gameplay component/tag is needed for this static feature.
- **Constraint.** Do not refactor RenderSystem for the earlier readability proposal as part of this feature.
- **Evidence.** Planning only. Python link/arithmetic checks passed (35 Markdown files, no broken links; all three grid bounds verified). Baseline `npm run test:unit && npm run test:e2e && npm run typecheck && npm run build` passed (14 unit tests, 1 browser test). No grid implementation or grid acceptance tests exist yet.
- **Type review.** Applied the change-type format; planner/ECS checklists updated. Latest link scan: 36 files, zero broken links. Reran the same baseline commands: all passed; source unchanged.

# ADR-001: Sibling Canvas Mount

## Status
Accepted — 2025-01-01

## Context
The game has two top-level DOM roots: a Vue UI overlay and a PixiJS game canvas.
We need to decide how PixiJS mounts in the DOM relative to Vue.

## Alternatives

### A: Vue template element
PixiJS attaches to a `<div ref="canvasMount">` inside a Vue component's template.
- **Pro**: All DOM is Vue-managed. Single root.
- **Con**: PixiJS canvas is nested in Vue's component tree. Vue's reactivity may interfere with PixiJS's direct canvas manipulation. Layout between the two layers requires CSS positioning within a single tree.

### B: Sibling `<div id="game">` in HTML body
PixiJS attaches to a standalone `<div>` in the body, outside the Vue mount point.
- **Pro**: Clean separation. Vue and PixiJS have no DOM relationship. Layout via CSS on body children.
- **Con**: Two DOM roots. Slightly harder to reason about layout. Must coordinate viewport between them.

## Decision
**B** — sibling `<div id="game">` in HTML body.

## Consequences
- Vue and PixiJS are DOM-independent.
- Layout is a CSS concern on `body`.
- `cmd_bus` is the only coordination between layers.

## History
- 2025-01-01: initial decision.

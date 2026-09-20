# 0014 — Browser acceptance

Status: Done
Role: implementer
Prerequisite: [0013](0013-pixi-integration.md) Done
Feature: [centered square](../../features/001-square.md)

## Scope

- Complete automated browser coverage for every observable feature acceptance criterion.
- Verify actual pixels or screenshots with explicit tolerances; canvas existence and internal-state assertions alone do not prove rendering.
- Exercise resize in one mounted session, full-viewport fitting, letterboxing, and unmount/remount without duplicate canvases.
- Combine browser lifecycle evidence with isolated tests for observer cleanup and pending initialization.
- Fix failures within this scope without weakening assertions; identify boundary changes separately.

## Acceptance

Run and record the full suite:

- `npm run test:unit`
- `npm run test:e2e`
- `npm run typecheck`
- `npm run build`

All pass. Link each [feature criterion](../../features/001-square.md) to its test/evidence, including the three specified viewport sizes, contrast, centering, unchanged game state, and teardown safety.

## Exclusions

No new behavior, architecture redesign, or self-approval as independent reviewer.

## Evidence

- **Pixel matrix.** `tests/e2e/app.spec.ts` scans rendered canvas pixels with an 8-channel tolerance and attaches PNG screenshots: 800×600 shows a centered 64×64 CSS-pixel square; 1200×900 shows 96×96; 1200×600 shows 64×64 with an 800×600 logical area and 200px side margins.
- **Presentation.** The browser matrix checks one full-viewport canvas, square centering and equal dimensions, logical-area bounds, square/background contrast, letterbox color, and resize through all three required viewports plus the existing 280×400 portrait regression in one mounted session. Geometry tolerance: 1 CSS pixel.
- **State.** `tests/unit/game-render-system.test.ts` verifies one origin square of size 64; `tests/unit/composition.test.ts` verifies resize leaves ECS values unchanged while the browser test verifies the unchanged visible square state.
- **Lifecycle.** The browser test performs the real Vue app unmount, confirms zero canvases and no post-unmount observer callbacks, remounts via the real entry module in the same document (no reload), and confirms exactly one canvas. Observer counters persist across both mounts and all created observers are disconnected after final unmount. Composition tests verify observer disconnect and repeated cleanup.
- **Pending initialization.** `tests/unit/composition.test.ts` and `tests/unit/pixi-adapter.test.ts` cover late initialization after disposal, including no presentation synchronization, no canvas attachment, and destruction of late resources.
- **Checks.** `npm run test:unit` — passed; 5 files and 14 tests. `npm run test:e2e` — passed; 2 Chromium tests with attached viewport screenshots. `npm run typecheck` — passed. `npm run build` — passed.

- **Verification.** Parent replaced reload-based remount with same-document remount and retained portrait coverage. This verifies task implementation; independent feature review remains 0015.

## Handoff

On success: mark this task Done; set feature Test; point CURRENT.md to [0015](0015-review-demo-reflection.md); stop.

# 0013 — Pixi integration

Status: Done
Role: implementer
Prerequisite: [0012](0012-game-render-system.md) Done
Feature: [centered square](../../features/001-square.md)

## Scope

- Implement PixiAdapter against the existing renderer port: create/update/remove graphics and dispose resources.
- Implement pure uniform-fit calculation using configured logical dimensions; handle zero-sized hosts without invalid transforms.
- Wire Vue host, Game, RenderSystem, PixiAdapter, and resize observation through Composition.
- Draw the square on startup and redraw on resize; no gameplay simulation loop.
- Implement idempotent teardown and cancellation/disposed handling for initialization finishing after unmount.

## Acceptance

- `npm run test:unit` passes with fit-math checks for all [feature acceptance sizes](../../features/001-square.md).
- Lifecycle tests with controlled async initialization cover normal teardown, repeated cleanup, and late resolution; observers and graphics resources are released.
- `npm run test:e2e` passes, adding a basic actual-visible-square check (not just canvas existence). Broader browser scenarios belong to 0014.
- `npm run typecheck` and `npm run build` pass.
- Confirm resizing changes presentation only, not ECS square dimensions/position.

## Exclusions

No new gameplay, generic renderer framework, performance tuning, or independent review.

## Evidence

- Delegation history: Luna ran with `--thinking max`; its first subprocess timed out after 900 seconds after writing the implementation. A second bounded Luna run completed the changes. The parent reported all four acceptance commands passing (11 unit tests and 1 browser pixel test), but the unit run emitted jsdom `HTMLCanvasElement.getContext()` diagnostics from real Pixi imports.
- `npm run test:unit` — passed; 4 files and 12 tests, including all fit sizes, controlled Composition teardown/late-resolution cases, and visible App initialization failure handling. No jsdom canvas diagnostics.
- `npm run test:e2e` — passed; 1 Chromium test. The actual Pixi canvas rendered the 64×64 centered square, and the existing 280×400 resize state confirmed logical-area pixels differ from letterbox pixels; no page or console errors.
- `npm run typecheck` — passed.
- `npm run build` — passed; Vite production build completed successfully.

The browser matrix remains the single existing test; no 0014 scenarios were added.

## Parent verification

- Added isolated tests of the real PixiAdapter with mocked Pixi constructors and injected fake resources. These verify graphic removal, decorative-background separation, DPR-aware resize, idempotent disposal, and resource destruction after late initialization without canvas attachment.
- Independently ran `npm run test:unit && npm run test:e2e && npm run typecheck && npm run build`: passed, 14 unit tests across 5 files, 1 real Chromium pixel test, typecheck, and production build. No jsdom canvas diagnostics.
- Implementation currently explicitly selects PixiJS's Canvas renderer. Pixel acceptance uses that backend; it does not establish WebGL/WebGPU compatibility.
- Review/reflection candidate: mock the external graphics runtime, not the adapter under test, when verifying adapter-owned cleanup. Composition fake-port tests alone cannot prove graphics resources are destroyed.
- Full browser matrix and independent feature review remain tasks 0014 and 0015.

## Handoff

On success: mark this task Done; keep feature In progress; point CURRENT.md to [0014](0014-browser-acceptance.md); stop.

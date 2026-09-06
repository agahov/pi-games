# Feature: test-sweep

## Why

The platform feature is functionally complete. This feature performs a quality
audit: confirm all tests pass, no false greens, no leaks, no warnings.
Also adds dedicated single-responsibility test files for each kernel module.

## Scope

- Dedicated `game-model.test.ts` (currently only via `acceptance.test.ts`)
- Confirm `command-queue.test.ts` covers pause/resume/clear
- Confirm `event-bus.test.ts` covers `off` + no-leak
- Confirm `render-system.test.ts` covers full removal pipeline
- `pnpm test` (unit + e2e) passes clean
- No console warnings on `pnpm dev`
- No memory leaks (listeners cleaned up in tests)

## Done when

- [x] All tests pass (unit + e2e) — 84 unit + 3 e2e green
- [x] No uncleaned event listeners — per-test buses; `game-model` assert `destroy()` stops propagation
- [x] `pnpm test` clean
- [x] No console **errors** on boot (`console-clean.spec.ts` guards `pageerror` + `console.error`; headless-only GL driver warnings are out of scope)

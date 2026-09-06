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

- [ ] All tests pass (unit + e2e)
- [ ] No uncleaned event listeners
- [ ] `pnpm test` clean
- [ ] No console warnings

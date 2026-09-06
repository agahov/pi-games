# Feature: test-sweep — Plan

| Task | Description | Status |
|------|-------------|--------|
| 1 | `game-model.test.ts` — dedicated event → ShallowRef (8 tests, incl. `destroy` no-leak) | ✅ done |
| 2 | `command-queue.test.ts` — audit: pause/resume/clear coverage | ✅ done |
| 3 | `event-bus.test.ts` — audit: on/off/emit/no-leak | ✅ done |
| 4 | `render-system.test.ts` — audit: full removal pipeline | ✅ done |
| 5 | `pnpm test` (unit + e2e) — full sweep | ✅ done (84 unit + 3 e2e) |
| 6 | No console errors on boot — `e2e/console-clean.spec.ts` guards `pageerror` + `console.error` | ✅ done |
| 7 | No memory leaks — per-test buses; `game-model` asserts `destroy()` stops propagation | ✅ done |

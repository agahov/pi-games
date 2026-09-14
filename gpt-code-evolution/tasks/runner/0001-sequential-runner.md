# 0001 — Sequential Luna task runner

Status: Done
Role: implementer
Scope: user-requested tooling interruption; does not execute square tasks 0014/0015.

## Outcome

[Runner](../../scripts/run_tasks.py) reads an ordered JSON task list, starts fresh Luna max-effort sessions, runs configured checks, obtains independent review, commits each passing task, and continues. It stops for issues/questions, unsafe Git state, timeout, or failed evidence. See [usage and limits](../../doc/task-runner.md).

## Acceptance evidence

- `python3 -m unittest discover -s tests/runner -v` — 8 tests passed. Disposable Git integration verifies sequential per-task commits, failed-check stop, dirty-tree refusal, reviewer-write detection; also checks blocked/missing reports, path containment, timeout and dry run. Models are faked; no live-model end-to-end runner claim.
- `python3 scripts/run_tasks.py` — dry run lists only square tasks 0014 and 0015.
- `python3 scripts/run_tasks.py --run` — exits 1 on existing dirty tree before starting a model or making a commit, as required.
- `npm run test:unit && npm run test:e2e && npm run typecheck && npm run build && git diff --check` — passes (14 unit tests, 1 Chromium test, typecheck, production build, whitespace check).

## Handoff and reflection

No project commits or new square tasks executed. Existing 0013 edits and runner files require deliberate review/commit before live execution. CURRENT.md remains pointed at square task 0014.

Reusable rule updated: one task per worker session; a controller can sequence independently checked/reviewed sessions. Per-task commits must never include a pre-existing dirty tree. Failures preserve work rather than auto-resetting it.

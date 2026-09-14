# Task runner

```text
Plan → Luna max → checks → fresh review → task commit → next task
                  Any issue/question → STOP; preserve work
```

## Usage

```sh
python3 scripts/run_tasks.py        # preview
python3 scripts/run_tasks.py --run  # execute
```

- **Requirements.** macOS/Linux, Python 3.10+, Git identity, authenticated pi, installed project dependencies and Chromium.
- **Plan.** [runner.json](../tasks/001-square/runner.json) owns order/checks. Skip Done tasks; CURRENT.md must match the next task.
- **Sessions.** One task per worker; fresh review before each local commit. Final feature review remains separate.
- **Overrides.** `--plan`, `--provider`, `--model`, `--thinking`, `--timeout` (agent: 1800s), `--check-timeout` (300s).

## Safety

- **Start.** Require a clean repository; one runner at a time. Do not edit concurrently.
- **Stop.** Failed checks, timeout, blocked/missing report, review findings, unexpected statuses, changed HEAD, or out-of-project edits.
- **Preservation.** No push, auto-stash/reset, or automatic retry. Failed work remains uncommitted; earlier commits remain.
- **Attention.** Exit nonzero with logs/report location. No interactive chat is opened.
- **Recovery.** Inspect edits. If a failed gate left a task Done, restore its unfinished status and CURRENT.md before a deliberate recovery commit; otherwise the runner skips it.
- **Limits.** Trusted shell automation, not a sandbox. Reviewer edits are checked, not OS-blocked. Known dependency advisories remain recorded follow-ups.

## Tests

```sh
python3 -m unittest discover -s tests/runner -v
```

- **Isolation.** Fake models and disposable Git repositories; no live Luna calls or project commits.

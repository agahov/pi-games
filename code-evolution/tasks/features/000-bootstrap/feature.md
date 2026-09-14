# Feature 000: Bootstrap

## Intent
Establish the agent core and prove the loop can run on its own output.

## Acceptance Scenario
- **Given**: a fresh repo with only `AGENTS.md`, `intend/INTEND.md`, and `tasks/` empty dir
- **When**: the agent runs `feature 000-bootstrap`
- **Then**:
    - [ ] Agent core exists: `AGENTS.md`, `RULES.md`, `CRITERIA.md`, `CURRENT.md`, `LOG.md`, `OPEN.md`, `skills/REVIEWER.md`, `DECISIONS.md`
    - [ ] All files are non-empty and contain real, usable content (not placeholders)
    - `CURRENT.md` points to `001-two-squares`
    - [ ] `game/` dir exists with `src/`, `tests/`, `decisions/`
    - [ ] `archive/INTEND.md` exists (moved from `intend/`)
    - [ ] `judge.md` exists with verdicts for all 14 criteria

## Status
in-progress

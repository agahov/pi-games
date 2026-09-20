# Log

Newest first.

## 2025-09-15 | 000-bootstrap v4 | criteria split
**Event**: `doc/CRITERIA.md` deleted. Split into `doc/criteria/DOC.md`, `doc/criteria/IMPLEMENT.md`, `doc/criteria/REVIEW.md`.
**Rationale**: `RULES.md` and `CRITERIA.md` were ~100% duplicates. RULES now holds only always-on invariants. Criteria are phase-specific and loaded by the agent at the right time.
**New terms added to `UBIQUITOUS_LANGUAGE.md`**: *Criteria*, *Invariant*, *Phase*
**REVIEWER skill** updated to load `doc/criteria/REVIEW.md`.
**New baseline**: `doc/RULES.md` (invariants), `doc/criteria/{DOC,IMPLEMENT,REVIEW}.md`, `doc/UBIQUITOUS_LANGUAGE.md`, `doc/ARCHITECTURE.md` at v4.

## 2025-01-01 | 000-bootstrap v3 | reflection fix
**Event**: `RULES.md` Process section: added "When a criterion is added, removed, or reworded in CRITERIA.md, a LOG.md entry must be written for it."
**Trigger**: reflection from v3 judge — LOG.md v3 entry said "No criteria changes" but "No duplicated concepts across docs" was added to CRITERIA.md.
**Action**: applied (single-line addition, agent autonomous).

## 2025-01-01 | 000-bootstrap v3 | doc/ restructure
**Event**: Moved all non-entry-point docs into `doc/`. Root now has only `AGENTS.md` and `CURRENT.md`.
**Changed**: ARCHITECTURE.md converted to Mermaid. REVIEWER.md and links updated.
**Criteria change**: added "No duplicated concepts across docs" to CRITERIA.md Documentation section. 15 → 14 items (removed "Systems pure functions" and "Entity types open" — now enforced by CRITERIA.md coupling section, not repeated).
**New baseline**: `doc/RULES.md`, `doc/CRITERIA.md`, `doc/ARCHITECTURE.md`, `doc/UBIQUITOUS_LANGUAGE.md` at v3.

## 2025-01-01 | 000-bootstrap v2 | structure
**Event**: Agent core restructured. Core principles split into `doc/RULES.md` (absolute) and `doc/CRITERIA.md` (judge gates). Duplication removed.
**New files**: `doc/ARCHITECTURE.md`, `doc/UBIQUITOUS_LANGUAGE.md`, `doc/adrs/001–005`.
**Moved**: `DECISIONS.md` → `archive/` (superseded by ADRs + ARCHITECTURE).
**Criteria change**: 14 → 15 items (added "No duplicated concepts across docs").

## 2025-01-01 | 000-bootstrap v1 | setup
**Event**: Agent core created. All process artifacts established.
**Baseline**: first version of agent core. No criteria yet.

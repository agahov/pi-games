---
name: REVIEWER
description: Load during the **Judge** phase. Produces `judge.md` by applying `doc/criteria/REVIEW.md` (which subsumes DOC + IMPLEMENT).
---

## Instructions

1. Load `doc/criteria/REVIEW.md`.
2. REVIEW.md delegates to `DOC.md` and `IMPLEMENT.md` — score each criterion there first.
3. For each criterion, write one of:
      - `✓ met` — brief justification (< 1 sentence).
      - `✗ not met` — reason and location.
      - `N/A` — why it doesn't apply.
4. No scores. This is a gate, not a grade.
5. If any `✗`: write `reflection.md` in the feature folder proposing a fix to `doc/RULES.md` or the relevant `doc/criteria/*.md`.
6. If no `✗`: no reflection needed.
7. Update `CURRENT.md` to mark the feature status as `done`.
8. If a rule or criterion changed, append an entry to `doc/LOG.md`.

## Output — `judge.md`

```
# Judge: {feature-name}

Date: {date}
Criteria: doc/criteria/

## Documentation (DOC.md)
### {criterion}
{verdict + reason}
...

## Implementation (IMPLEMENT.md)
### {criterion}
{verdict + reason}
...

## Process (REVIEW.md)
### {criterion}
{verdict + reason}
...

## Summary
{count of ✓ / ✗ / N/A}
{if any ✗: list them, point to reflection.md}
```

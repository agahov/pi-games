# Reflection: 000-bootstrap v3

## Failed criterion
`LOG.md updated if any principle changed`

## What happened
Between `CRITERIA.md` v2 and v3, the criterion "No duplicated concepts across docs" was added.
`LOG.md` v3 entry says "No criteria changes" — incorrect.

## Root cause
The log was written before "LOG.md updated if any principle changed" was fully internalised.
The agent recorded structural doc changes (moved to `doc/`) but missed the criteria content change.

## Proposed fix to RULES.md / CRITERIA.md
Add to `RULES.md` Process section:
```
- When a criterion is added, removed, or reworded in CRITERIA.md, a LOG.md entry must be written for it.
```
This is a single-line addition, agent can apply autonomously.

## Also note (not a failure)
`LOG.md` v3 entry uses `adrs/001–005` — these are now in `doc/adrs/`. The log path is stale.
Fix: update the path reference in the v3 log entry.

## Actions
- [ ] Add rule to `doc/RULES.md` Process section.
- [ ] Fix `LOG.md` v2/v3 entries: note the criteria change, update `adrs/` → `doc/adrs/` paths.
- [ ] Log the rule addition in `LOG.md`.

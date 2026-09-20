# Criteria — Review

Loaded during **Judge** by the REVIEWER skill. Final gate before a Run is done.
Subsumes `DOC.md` and `IMPLEMENT.md` — check those first, then the Process items below.

All domain terms per [`../UBIQUITOUS_LANGUAGE.md`](../UBIQUITOUS_LANGUAGE.md).

## Delegates (check these first)
- [ ] All [`DOC.md`](DOC.md) criteria met (or N/A with reason).
- [ ] All [`IMPLEMENT.md`](IMPLEMENT.md) criteria met (or N/A with reason).

## Process
- [ ] **One task.** Agent worked on the next incomplete task only.
- [ ] **`judge.md` produced** for this Run.
- [ ] **No hotfixes.** Bugs resolved via `reflection.md`, not patches.
- [ ] **`CURRENT.md` updated** to reflect new status.
- [ ] **`LOG.md` updated** when any principle or criterion changed.

## Scoring
Each item scored:
- `✓` — met, with one-sentence justification
- `✗` — not met, with reason and location
- `N/A` — not applicable, with one-sentence explanation

If any `✗`: write `reflection.md` in the feature folder, proposing a fix to `RULES.md` or the relevant `criteria/*.md`.

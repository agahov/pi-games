# Criteria — Documentation

Loaded during **Define**, **Plan**, **Optimize**. Self-check when authoring or editing any doc.
All domain terms per [`../UBIQUITOUS_LANGUAGE.md`](../UBIQUITOUS_LANGUAGE.md).

## Feature structure
- [ ] **Feature folder exists.** Trivial features are not exempt.
- [ ] **One concept per section.** No mixing concerns in a single doc section.

## Content
- [ ] **Code says it → delete the doc.** A doc exists only where code cannot say the same thing.
- [ ] **Diagrams answer questions prose cannot.** No decorative diagrams.
- [ ] **No duplicated concepts.** If a concept appears in multiple docs, one is the source; others link to it.

## ADRs
- [ ] **ADRs record *why*.** Context, alternatives considered, decision, consequences. No "what" — see `ARCHITECTURE.md`.
- [ ] **ADRs reference design, not contain it.** Link to `ARCHITECTURE.md`, don't repurpose the ADR as a design doc.

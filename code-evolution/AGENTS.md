# Agent Core

## Startup

1. Read [`CURRENT.md`](CURRENT.md).
2. Open the feature folder linked there.
3. Apply [`doc/RULES.md`](doc/RULES.md) at every step.
4. Run the pipeline: `Define → Plan → Implement → Test → Judge → Optimize → Log`.
5. Work only the next incomplete task.
6. On **Judge**, load [`doc/criteria/REVIEW.md`](doc/criteria/REVIEW.md) via the REVIEWER skill.
7. If any criterion fails → `reflection.md` → apply to [`doc/RULES.md`](doc/RULES.md) or the relevant `doc/criteria/*.md` → append to [`doc/LOG.md`](doc/LOG.md).
8. Update `CURRENT.md` when done.

## Phase → Criteria

Loaded by the agent at the start of each phase. See [`doc/RULES.md`](doc/RULES.md) for the full index.

| Phase | Criteria file |
|---|---|
| Define, Plan, Optimize | [`doc/criteria/DOC.md`](doc/criteria/DOC.md) |
| Implement, Test | [`doc/criteria/IMPLEMENT.md`](doc/criteria/IMPLEMENT.md) |
| Judge | [`doc/criteria/REVIEW.md`](doc/criteria/REVIEW.md) |

## Files

| Location | What it is |
|---|---|
| `AGENTS.md` (root) | Entry point, startup steps, pipeline → criteria map |
| `CURRENT.md` (root) | Where we are now |
| [`doc/RULES.md`](doc/RULES.md) | Absolute invariants. Always on. Links to criteria |
| [`doc/UBIQUITOUS_LANGUAGE.md`](doc/UBIQUITOUS_LANGUAGE.md) | **Sole source of truth** for all domain terms |
| [`doc/ARCHITECTURE.md`](doc/ARCHITECTURE.md) | Current 3-layer design (Mermaid) |
| [`doc/criteria/DOC.md`](doc/criteria/DOC.md) | Documentation criteria (Define/Plan/Optimize) |
| [`doc/criteria/IMPLEMENT.md`](doc/criteria/IMPLEMENT.md) | Implementation criteria (Implement/Test) |
| [`doc/criteria/REVIEW.md`](doc/criteria/REVIEW.md) | Review criteria — subsumes DOC + IMPLEMENT (Judge) |
| [`doc/LOG.md`](doc/LOG.md) | Evolution history |
| [`doc/OPEN.md`](doc/OPEN.md) | Unresolved process items |
| [`doc/adrs/`](doc/adrs/) | ADRs — history, alternatives, why |
| `tasks/features/` | Feature folders — the backlog |
| `game/` | Live game code — the benchmark |
| [`.pi/skills/reviewer/`](.pi/skills/reviewer/SKILL.md) | Reviewer agent — loads REVIEW.md at Judge phase |

## A note on ADRs vs Design

An ADR records *why a decision was made* — context, alternatives, consequences.
`ARCHITECTURE.md` is *what the system looks like now* — diagrams, current state.
ADRs reference design docs, not contain them.

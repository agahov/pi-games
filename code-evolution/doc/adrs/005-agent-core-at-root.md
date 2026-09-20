# ADR-005: Single Agent Core, Portable

## Status
Accepted — 2025-01-01

## Context
The goal is a self-improving agent that can be applied to a new game by copying it.
Where does the agent core live relative to the game code?

## Alternatives

### A: Flat structure, agent core at root
Agent core files at project root. Game in `game/` subfolder.
- **Pro**: Simple. `AGENTS.md` is the first thing seen. `cp -r` of agent core to start a new game.
- **Con**: Root is crowded.

### B: Agent core in `.agent/`, game at root
Hidden agent core directory. Game is the "product," agent is infrastructure.
- **Pro**: Product first, infra second.
- **Con**: Agent core is hidden. Hard to discover. Less visible.

### C: Separate repos
Agent core in its own repo. Game imports it via submodule or npm.
- **Pro**: Clean separation.
- **Con**: Overengineering for v1.

## Decision
**A** — agent core at root, game in `game/`.

## Consequences
- To start a new game: `cp -r AGENTS.md RULES.md CRITERIA.md ARCHITECTURE.md UBIQUITOUS_LANGUAGE.md adrs/ skills/ CURRENT.md LOG.md OPEN.md /path/to/new/game/` and `mkdir /path/to/new/game/game/`.
- Agent core files are the first thing in any new game project.
- `game/` is the live benchmark for this agent version.

## History
- 2025-01-01: initial decision.

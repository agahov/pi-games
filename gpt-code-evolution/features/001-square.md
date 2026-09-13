# Feature 001: centered square

Status: **Planned** — implementation has not started.

## Outcome

Opening the page shows one static square centered in a fixed-aspect-ratio game area. Resizing the browser preserves proportions and keeps the entire game area visible.

## Behavior

- One 64×64 world-unit square centered at world origin `(0, 0)`.
- Logical game area: 800×600 (4:3), fitted inside the full browser viewport.
- Uniform scaling; unused space is letterboxed. No cropping or stretching.
- Square contrasts with the game-area background.
- No controls, animation, or gameplay interaction.

## Acceptance criteria

- Initial game state contains exactly one square at origin with size 64×64, testable without a browser.
- An 800×600 viewport displays a 64×64 CSS-pixel square.
- A 1200×900 viewport displays a 96×96 CSS-pixel square.
- A 1200×600 viewport displays a 64×64 CSS-pixel square with 200px side margins around the game area.
- Browser checks confirm actual visible rendering, centering, contrast, and resize behavior; resizing does not change game state.
- Unmount/remount leaves one canvas and no leaked resize observers. Late initialization after unmount releases its resources safely.

## Work

Implementation and validation: [ordered task files](../tasks/001-square/README.md).

Project-wide decisions (referenced, not redefined): [architecture](../doc/architecture.md), [stack](../doc/tech-stack.md), [communication](../doc/communication.md).

# Glossary

- **Game** — the runtime owner of the bitECS world, game rules, and typed API.
- **Game API** — the typed boundary used to send commands to the Game and read selected UI state.
- **Command** — a typed request from UI/application code for a Game action.
- **bitECS world** — the authoritative ECS storage owned by the Game.
- **RenderSystem** — the presentation system that queries ECS and describes the current presentation through a renderer port.
- **Renderer port** — the small typed rendering interface injected into RenderSystem.
- **PixiAdapter** — the renderer-port implementation that owns Pixi resources, entity-to-graphic mapping, and uniform viewport fitting.
- **Composition** — lifecycle wiring that mounts the Game and presentation, observes resize, and safely tears down asynchronous work.
- **Logical area** — the configured world presentation area; browser size does not alter its world dimensions.
- **Letterboxing** — unused side or top space left when the logical area is uniformly fitted without stretching or cropping.
- **Selected UI state / UI projection** — game-derived values selected for display through typed Game API queries; not a second source of truth.
- **UI-only state** — focus and open panels owned by Vue, not game state.

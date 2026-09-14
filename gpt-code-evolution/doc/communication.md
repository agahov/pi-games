# Communication map

```mermaid
flowchart LR
  UI[Vue] -->|typed commands, when needed| API[Game API]
  API -->|validated changes| ECS[(Game-owned ECS)]
  API -->|UI projection via Composition| UI
  ECS -->|read-only queries| RS[RenderSystem]
  RS -->|create / update / remove| PA[PixiAdapter]
  PA --> Graphics[Pixi graphics]
  C[Composition] -->|order and lifetime| RS
  C -->|initialization / resize / teardown| PA
  C -->|lifetime| API
```

- **UI state.** Game-derived values are projections; focus/panels stay in Vue.
- **Commands.** Added only for interaction; the static square needs none.
- **Authority.** No direct Vue→ECS or UI→renderer synchronization.

[Boundary rationale](architecture.md)

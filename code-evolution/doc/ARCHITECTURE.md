# Architecture

Current system design. Updated when the architecture changes. No history — see `doc/adrs/` for why.

## Layers

```mermaid
graph TB
    subgraph UI["Vue (UI layer)"]
        UI_STATE["HTML overlay: buttons, labels, HUD"]
        SHALLOw_REF["shallowRef: coarse game state snapshot"]
        APP["Mount point: #app"]
    end

    subgraph BUS["cmd_bus — typed event router"]
        CMD["Commands: Vue/Pixi → ECS"]
        EVT["Events: ECS → EventAdapter"]
        TYPES["Shared types module: game/src/types/"]
    end

    subgraph ECS["bitECS 0.4.0 — logic layer"]
        ENT["Entities: StaticEntity, ChaserEntity"]
        CMP["Components: Position, Renderable, MousePosition"]
        SYS["Systems: InputSystem, ChaseSystem, RenderSystem"]
        INV["No knowledge of Vue or PixiJS"]
    end

    subgraph PX["PixiJS (render layer)"]
        PIXI_CANVAS["Canvas: sprites"]
        GAME["Mount point: #game (sibling in body)"]
        INPUT_PX["Input events → cmd_bus"]
    end

    UI_STATE -->|emit Command| CMD
    EVT -->|translate| SHALLOw_REF
    SYS ==>|emit Event| EVT
    ENT -->|query [Renderable]| PIXI_CANVAS
    INPUT_PX -->|emit InputCommand| CMD
    CMD -->|dispatch| SYS

    style UI fill:#e1f5fe
    style BUS fill:#fff9c4
    style ECS fill:#e8f5e9
    style PX fill:#fce4ec
```

## Data flow

**Vue → ECS**: Vue UI event → `cmd_bus.emit(Command)` → `cmd_bus` dispatches to ECS `InputSystem`

**ECS → Vue**: ECS system → `cmd_bus.emit(Event)` → `EventAdapter` → `shallowRef.value` → Vue re-renders

**Pixi → ECS**: Pixi input event → `cmd_bus.emit(InputCommand)` → `InputSystem` → `MousePosition` component

**ECS → Pixi**: `query(world, [Renderable, Position])` → `RenderSystem` → Pixi display object update

## DOM

```html
<body>
    <div id="app"><!-- Vue mounts here: overlay, HUD, buttons --></div>
    <div id="game"><!-- PixiJS canvas mounts here --></div>
</body>
```

## Invariants

- Vue and PixiJS do not import from each other.
- `cmd_bus` is the only path between layers and the only path to ECS.
- No layer knows about another layer's internals — only the shared types in `game/src/types/`.
- bitECS components are plain SoA objects: `Position = { x: [] as number[], y: [] as number[] }`.

## See Also

- [`doc/adrs/`](adrs/) — why each architectural decision was made
- [`doc/UBIQUITOUS_LANGUAGE.md`](UBIQUITOUS_LANGUAGE.md) — glossary for all terms above

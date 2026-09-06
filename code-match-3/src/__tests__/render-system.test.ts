/**
 * render-system.test.ts — 3×3 grid, mark one removed, assert 8 remain + 1 destroyed
 *
 * Run: `pnpm test:unit -- render-system.test`
 */

import { describe, it, expect } from 'vitest';
import { Graphics, type Container } from 'pixi.js';
import {
  renderSyncSystem,
  removeRenderSystem,
  removeWorldSystem,
} from '@/ecs/systems/render-system';
import { createEcs } from '@/ecs/world';
import { Position, Visual, RemovedComponent } from '@/ecs/components';

/** Minimal stub of a Pixi stage for testing. */
class DummyStage {
  children: Graphics[] = [];
  addChild(gfx: Graphics): void { this.children.push(gfx); }
  removeChild(gfx: Graphics): void {
    const idx = this.children.indexOf(gfx);
    if (idx >= 0) this.children.splice(idx, 1);
  }
}

function makeGrid(ecs: ReturnType<typeof createEcs>, size = 3): number[] {
  const cellSize = 64;
  const ids: number[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const id = ecs.createEntity();
      ecs.addPosition(id, col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
      ecs.addVisual(id, 0xff0000);
      ids.push(id);
    }
  }
  return ids;
}

function cast(dummy: DummyStage): Container {
  return dummy as unknown as Container;
}

describe('render-system', () => {
  it('renderSyncSystem creates a Graphics for each [Position, Visual] entity', () => {
    const ecs = createEcs();
    const containerMap = new Map<number, Graphics>();
    const stage = cast(new DummyStage());

    makeGrid(ecs, 3);
    renderSyncSystem(ecs, containerMap, stage);

    expect(containerMap.size).toBe(9);
    expect(ecs.query([Position, Visual])).toHaveLength(9);
  });

  it('renderSyncSystem positions Graphics via .x/.y (not offset drawing)', () => {
    const ecs = createEcs();
    const containerMap = new Map<number, Graphics>();
    const stage = cast(new DummyStage());

    // Place a single entity at a known position.
    const id = ecs.createEntity();
    ecs.addPosition(id, 100, 200);
    ecs.addVisual(id, 0x00ff00, 32);

    renderSyncSystem(ecs, containerMap, stage);

    const gfx = containerMap.get(id);
    expect(gfx).toBeDefined();
     // Container is positioned via .x/.y.
    expect(gfx!.x).toBe(100);
    expect(gfx!.y).toBe(200);
   });

  it('removeRenderSystem destroys one Graphics, 8 remain in stage', () => {
    const ecs = createEcs();
    const containerMap = new Map<number, Graphics>();
    const stage = new DummyStage();

    const ids = makeGrid(ecs, 3);
    renderSyncSystem(ecs, containerMap, cast(stage));
    expect(containerMap.size).toBe(9);
    expect(stage.children).toHaveLength(9);

    // Mark center cell (row=1, col=1 → index 4) for removal.
    const centerEntityId = ids[4]!;
    ecs.markRemoved(centerEntityId);

    removeRenderSystem(ecs, containerMap, cast(stage));
    expect(containerMap.size).toBe(8);
    expect(stage.children).toHaveLength(8);
    // Render cleanup: external data maps are purged.
    expect(ecs.positions.has(centerEntityId)).toBe(false);
    expect(ecs.visuals.has(centerEntityId)).toBe(false);
    // Note: entity still exists in BiteCS world until removeWorldSystem runs.
    // That is verified in the full lifecycle test below.
  });

  it('removeWorldSystem deregisters all [RemovedComponent] entities from world', () => {
    const ecs = createEcs();

    const ids = makeGrid(ecs, 3);
    for (const id of ids) ecs.markRemoved(id);
    removeWorldSystem(ecs);

    expect(ecs.query([Position])).toHaveLength(0);
    expect(ecs.query([RemovedComponent])).toHaveLength(0);
  });

  it('full lifecycle: create grid → mark removed → render-destroy → world-destroy', () => {
    const ecs = createEcs();
    const containerMap = new Map<number, Graphics>();
    const stage = new DummyStage();

    makeGrid(ecs, 3);
    expect(ecs.query([Position, Visual])).toHaveLength(9);

    renderSyncSystem(ecs, containerMap, cast(stage));
    expect(containerMap.size).toBe(9);
    expect(stage.children).toHaveLength(9);

    // Mark first entity for removal.
    const firstId = ecs.query([Position, Visual])[0]!;
    ecs.markRemoved(firstId);
    expect(ecs.query([RemovedComponent])).toHaveLength(1);

    // Perform removal cycle.
    removeRenderSystem(ecs, containerMap, cast(stage));
    expect(containerMap.size).toBe(8);
    expect(stage.children).toHaveLength(8);

    removeWorldSystem(ecs);
    expect(ecs.query([Position])).toHaveLength(8);
    expect(ecs.query([RemovedComponent])).toHaveLength(0);
  });
});

/**
 * ecs test suite — validates the BiteCS wrapper API.
 *
 * Run: `pnpm test:unit -- ecs.test`
 */

import { describe, it, expect } from 'vitest';
import { createEcs, commitRemovals, removeEntity } from '@/ecs/world';
import {
  Position,
  Visual,
  Selected,
  RemovedComponent,
} from '@/ecs/components';

describe('ecs/world.ts', () => {
  it('creates a versioned entity that exists in the world', () => {
    const ecs = createEcs();
    const id = ecs.createEntity();
    expect(id).toBeDefined();
    expect(typeof id).toBe('number');
   });

  it('addPosition stores data and registers the component', () => {
    const ecs = createEcs();
    const id = ecs.createEntity();
    ecs.addPosition(id, 10, 20);
    expect(ecs.hasComponent(id, Position)).toBe(true);
    expect(ecs.positions.get(id)).toEqual({ x: 10, y: 20 });
   });

  it('addVisual stores data and registers the component', () => {
    const ecs = createEcs();
    const id = ecs.createEntity();
    ecs.addVisual(id, 0xff0000, 32);
    expect(ecs.hasComponent(id, Visual)).toBe(true);
    expect(ecs.visuals.get(id)).toEqual({ color: 0xff0000, size: 32 });
   });

  it('addVisual uses default size of 16', () => {
    const ecs = createEcs();
    const id = ecs.createEntity();
    ecs.addVisual(id, 0x00ff00);
    expect(ecs.visuals.get(id)!.size).toBe(16);
   });

  it('setSelected(id, true) adds Selected, setSelected(id, false) removes it', () => {
    const ecs = createEcs();
    const id = ecs.createEntity();
    expect(ecs.hasComponent(id, Selected)).toBe(false);
    ecs.setSelected(id, true);
    expect(ecs.hasComponent(id, Selected)).toBe(true);
    ecs.setSelected(id, false);
    expect(ecs.hasComponent(id, Selected)).toBe(false);
   });

  it('markRemoved adds RemovedComponent but does NOT remove entity', () => {
    const ecs = createEcs();
    const id = ecs.createEntity();
    ecs.addPosition(id, 0, 0);
    ecs.addVisual(id, 0, 16);
    ecs.markRemoved(id);
    expect(ecs.hasComponent(id, RemovedComponent)).toBe(true);
    expect(ecs.hasComponent(id, Position)).toBe(true); // still alive
   });

  it('query(Position, Visual) returns only entities with both components', () => {
    const ecs = createEcs();
    const a = ecs.createEntity();
    ecs.addPosition(a, 1, 1);
    ecs.addVisual(a, 0, 16);
    const b = ecs.createEntity();
    ecs.addPosition(b, 2, 2); // no Visual
    const c = ecs.createEntity();
    ecs.addVisual(c, 0, 16); // no Position
    const results = ecs.query([Position, Visual]);
    expect(results).toEqual([a]);
   });

  it('query(RemovedComponent) returns marked-for-removal entities', () => {
    const ecs = createEcs();
    const a = ecs.createEntity();
    ecs.addPosition(a, 0, 0);
    ecs.addVisual(a, 0, 16);
    const b = ecs.createEntity();
    ecs.addPosition(b, 0, 0);
    ecs.addVisual(b, 0, 16);
    ecs.markRemoved(a);
    const results = ecs.query([RemovedComponent]);
    expect(results).toEqual([a]);
    expect(ecs.hasComponent(b, RemovedComponent)).toBe(false);
   });

  it('removeEntity + commitRemovals deregisters entity from world', () => {
    const ecs = createEcs();
    const id = ecs.createEntity();
    ecs.addPosition(id, 0, 0);
    ecs.markRemoved(id);
    removeEntity(ecs.world, id);
    commitRemovals(ecs.world);
    // After removal the entity no longer appears in queries.
    expect(ecs.query([Position])).toHaveLength(0);
   });

  it('versioned IDs reuse raw id with different version after reuse', () => {
    const ecs = createEcs();
    const id1 = ecs.createEntity();
    removeEntity(ecs.world, id1);
    commitRemovals(ecs.world);
    const id2 = ecs.createEntity();
    // Both exist in the world (raw id may be reused, version differs).
    // The wrapper returns the full versioned ID.
    expect(id1).not.toBe(id2);
   });

  it('getEntityComponents returns all components on an entity', () => {
    const ecs = createEcs();
    const id = ecs.createEntity();
    ecs.addPosition(id, 0, 0);
    ecs.addVisual(id, 0, 16);
    ecs.setSelected(id, true);
    const comps = ecs.getEntityComponents(id);
    expect(comps).toContain(Position);
    expect(comps).toContain(Visual);
    expect(comps).toContain(Selected);
    expect(comps).not.toContain(RemovedComponent);
   });
});

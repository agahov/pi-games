/**
 * input-system test suite
 *
 * Run: `pnpm test:unit -- input-system.test`
 *
 * Tests the command handling logic in isolation — no actual Pixi event
 * dispatching (that's covered by Pixi's own test suite).
 */

import { describe, it, expect, vi } from 'vitest';
import { handleCommand } from '@/ecs/systems/input-system';
import { createEcs } from '@/ecs/world';
import { createTypedBus } from '@/kernel/event-bus';
import type { GameEventMap, CommandMap } from '@/types';
import { Selected } from '@/ecs/components';

describe('input-system.ts — handleCommand', () => {
  it('selectEntity: adds Selected to target, emits entitySelected event', () => {
    const ecs = createEcs();
    const bus = createTypedBus<GameEventMap>();
    const id = ecs.createEntity();
    ecs.addPosition(id, 0, 0);
    ecs.addVisual(id, 0xff0000);

    const onEvent = vi.fn();
    bus.on('entitySelected', (payload) => onEvent(payload.entityId));

    handleCommand({ type: 'selectEntity', entityId: id } as CommandMap[keyof CommandMap], ecs, bus);

    expect(ecs.hasComponent(id, Selected)).toBe(true);
    expect(onEvent).toHaveBeenCalledWith(id);
   });

  it('selectEntity: deselects previously selected entities', () => {
    const ecs = createEcs();
    const bus = createTypedBus<GameEventMap>();

    const id1 = ecs.createEntity();
    ecs.addPosition(id1, 0, 0);
    ecs.addVisual(id1, 0xff0000);
    ecs.setSelected(id1, true);

    const id2 = ecs.createEntity();
    ecs.addPosition(id2, 0, 0);
    ecs.addVisual(id2, 0x00ff00);

    handleCommand({ type: 'selectEntity', entityId: id2 } as CommandMap[keyof CommandMap], ecs, bus);

     // old selection deselected
    expect(ecs.hasComponent(id1, Selected)).toBe(false);
     // new selection active
    expect(ecs.hasComponent(id2, Selected)).toBe(true);
   });

  it('deselectAll: clears all Selected flags', () => {
    const ecs = createEcs();
    const bus = createTypedBus<GameEventMap>();

    const id1 = ecs.createEntity();
    ecs.addPosition(id1, 0, 0);
    ecs.addVisual(id1, 0xff0000);
    ecs.setSelected(id1, true);

    const id2 = ecs.createEntity();
    ecs.addPosition(id2, 0, 0);
    ecs.addVisual(id2, 0x00ff00);
    ecs.setSelected(id2, true);

    handleCommand({ type: 'deselectAll' } as CommandMap[keyof CommandMap], ecs, bus);

    expect(ecs.hasComponent(id1, Selected)).toBe(false);
    expect(ecs.hasComponent(id2, Selected)).toBe(false);
   });
});

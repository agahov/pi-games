/**
 * ui/model test suite
 *
 * Dedicated coverage for createGameModel(): EventBus → Vue ShallowRef bridge.
 * (Previously only covered transitively by acceptance.test.ts stage 5.)
 *
 * Run: `pnpm test:unit -- game-model.test`
 */

import { describe, it, expect } from 'vitest';
import { createGameModel, type GameModel } from '@/ui/model';
import { createTypedBus } from '@/kernel/event-bus';
import type { GameEventMap } from '@/types';

describe('ui/model.ts createGameModel', () => {
  function setup(): { model: GameModel; bus: ReturnType<typeof createTypedBus<GameEventMap>> } {
    const bus = createTypedBus<GameEventMap>();
    const model = createGameModel(bus);
    return { model, bus };
   }

  it('starts with no selection and zero score', () => {
    const { model } = setup();
    expect(model.selectedEntity.value).toBeNull();
    expect(model.score.value).toBe(0);
   });

  it('exposes reactive refs accessed via .value', () => {
    const { model } = setup();
    // .value access proves these are Vue refs, not plain fields.
    expect(typeof model.selectedEntity.value).toBe('object');
    expect(typeof model.score.value).toBe('number');
   });

  it('entitySelected sets selectedEntity', () => {
    const { model, bus } = setup();
    bus.emit('entitySelected', { entityId: 42 });
    expect(model.selectedEntity.value).toBe(42);
   });

  it('entitySelected overwrites previous selection', () => {
    const { model, bus } = setup();
    bus.emit('entitySelected', { entityId: 1 });
    bus.emit('entitySelected', { entityId: 7 });
    expect(model.selectedEntity.value).toBe(7);
   });

  it('entityDestroyed clears selection only for the selected entity', () => {
    const { model, bus } = setup();
    bus.emit('entitySelected', { entityId: 5 });

    bus.emit('entityDestroyed', { entityId: 9 }); // unrelated — no change
    expect(model.selectedEntity.value).toBe(5);

    bus.emit('entityDestroyed', { entityId: 5 }); // the selected one — clears
    expect(model.selectedEntity.value).toBeNull();
   });

  it('scoreUpdated sets score', () => {
    const { model, bus } = setup();
    bus.emit('scoreUpdated', { score: 100 });
    expect(model.score.value).toBe(100);
   });

  it('destroying the bus stops propagation (no leaked listeners)', () => {
    const { model, bus } = setup();
    bus.destroy();

    bus.emit('entitySelected', { entityId: 1 });
    bus.emit('scoreUpdated', { score: 42 });

    expect(model.selectedEntity.value).toBeNull();
    expect(model.score.value).toBe(0);
   });

  it('multiple models on one bus update independently', () => {
    const bus = createTypedBus<GameEventMap>();
    const a = createGameModel(bus);
    const b = createGameModel(bus);

    bus.emit('entitySelected', { entityId: 3 });
    expect(a.selectedEntity.value).toBe(3);
    expect(b.selectedEntity.value).toBe(3);

    bus.emit('entityDestroyed', { entityId: 3 });
    expect(a.selectedEntity.value).toBeNull();
    expect(b.selectedEntity.value).toBeNull();
   });
});

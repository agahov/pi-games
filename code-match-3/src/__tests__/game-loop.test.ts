/**
 * kernel/game-loop test suite
 *
 * Uses a mock Ticker to verify phase ordering, pause/resume, and zero
 * runtime Pixi dependency (all kernel is browser-independent).
 *
 * Run: `pnpm test:unit -- game-loop.test`
 */

import { describe, it, expect } from 'vitest';
import { createGameLoop, Phase, type Ticker } from '@/kernel/game-loop';
import { createCommandQueue } from '@/kernel/command-queue';
import { createTypedBus } from '@/kernel/event-bus';
import type { CommandMap, GameEventMap } from '@/types';

/** Minimal test ticker — call `runTick()` manually. */
function makeMockTicker(): Ticker & { runTick: () => void } {
  let cb: (() => void) | null = null;
  let running = false;
  return {
    add: (fn: () => void) => { cb = fn; },
    remove: (fn: () => void) => { if (cb === fn) cb = null; },
    start: () => { running = true; },
    stop: () => { running = false; },
    runTick() {
      if (running && cb) cb();
     },
   };
}

describe('game-loop.ts', () => {
  it('systems execute in strict phase order (empty queue)', () => {
    const ticker = makeMockTicker();
    const queue = createCommandQueue<CommandMap>();
    const bus = createTypedBus<GameEventMap>();
    const log: string[] = [];
    const loop = createGameLoop<CommandMap>(ticker, queue, () => log.push('CMD'), bus);

    loop.addSystem(() => log.push('RENDER'), Phase.RENDER);
    loop.addSystem(() => log.push('AFTER'), Phase.AFTER_UPDATE);
    loop.addSystem(() => log.push('UPDATE'), Phase.UPDATE);

    loop.start();
    ticker.runTick();

      // No commands pushed; drain is a no-op; 'CMD' is absent.
    expect(log).toEqual(['UPDATE', 'AFTER', 'RENDER']);
     });

  it('COMMAND_DRAIN drains the queue each frame', () => {
    const ticker = makeMockTicker();
    const queue = createCommandQueue<CommandMap>();
    const bus = createTypedBus<GameEventMap>();
    const log: string[] = [];
    const loop = createGameLoop<CommandMap>(
      ticker, queue, (cmd) => log.push((cmd as { type: string }).type), bus,
      );

    queue.push({ type: 'selectEntity', entityId: 42 });
    loop.start();
    ticker.runTick();
    expect(log).toEqual(['selectEntity']);
       // Queue is drained after each tick.
    expect(queue.pending).toBe(0);
     });

  it('COMMAND_DRAIN runs before UPDATE / AFTER_UPDATE / RENDER', () => {
    const ticker = makeMockTicker();
    const queue = createCommandQueue<CommandMap>();
    const bus = createTypedBus<GameEventMap>();
    const log: string[] = [];
    const loop = createGameLoop<CommandMap>(ticker, queue, () => log.push('CMD'), bus);

    loop.addSystem(() => log.push('UPDATE'), Phase.UPDATE);

    queue.push({ type: 'deselectAll' });
    loop.start();
    ticker.runTick();
    expect(log).toEqual(['CMD', 'UPDATE']);
     });

  it('pause() stops ticker but does NOT clear the queue', () => {
    const ticker = makeMockTicker();
    const queue = createCommandQueue<CommandMap>();
    const loop = createGameLoop<CommandMap>(ticker, queue, () => {});

    loop.start();
    queue.push({ type: 'deselectAll' });
    queue.push({ type: 'selectEntity', entityId: 1 });
    loop.pause();

    expect(queue.paused).toBe(true);
    expect(queue.pending).toBe(2); // queue preserved
     });

  it('resume() unblocks push; pre-pause commands stay in queue', () => {
    const ticker = makeMockTicker();
    const queue = createCommandQueue<CommandMap>();
    const log: string[] = [];
    const loop = createGameLoop<CommandMap>(
      ticker, queue, (cmd) => log.push((cmd as { type: string }).type),
       );

    queue.push({ type: 'selectEntity', entityId: 1 });
    loop.pause();
    loop.resume();
      // Pre-pause command survives and is processed on the next tick.
    ticker.runTick();
    expect(log).toEqual(['selectEntity']);
    expect(queue.pending).toBe(0);
     });

  it('destroy() permanently stops all ticking', () => {
    const ticker = makeMockTicker();
    const queue = createCommandQueue<CommandMap>();
    const log: string[] = [];
    const loop = createGameLoop<CommandMap>(ticker, queue, () => log.push('CMD'));

    loop.start();
    loop.destroy();
    loop.tick(); // no-op after destroy; does not throw

    expect(log).toEqual([]);
     });

  it('no Pixi dependency: game-loop runs in pure Node', () => {
       // This test runs in Node without a browser. If game-loop.ts imported
       // pixi.js, this would fail with a module-not-found error.
    const ticker = makeMockTicker();
    const queue = createCommandQueue<CommandMap>();
    expect(() => createGameLoop<CommandMap>(ticker, queue, () => {})).not.toThrow();
     });
});

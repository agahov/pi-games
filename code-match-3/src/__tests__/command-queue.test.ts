/**
 * kernel/command-queue test suite
 *
 * Run: `pnpm test:unit -- command-queue.test`
 */

import { describe, it, expect } from 'vitest';
import { createCommandQueue } from '@/kernel/command-queue';
import type { CommandMap } from '@/types';
import { CONTROL_TYPES } from '@/types';

describe('command-queue.ts', () => {
  it('push + drain processes commands in FIFO order', () => {
    const queue = createCommandQueue<CommandMap>();
    const received: string[] = [];
    queue.push({ type: 'selectEntity', entityId: 1 });
    queue.push({ type: 'deselectAll' });
    queue.drain((cmd) => received.push(cmd.type));
    expect(received).toEqual(['selectEntity', 'deselectAll']);
   });

  it('drain returns all pending commands in one call, then queue is empty', () => {
    const queue = createCommandQueue<CommandMap>();
    queue.push({ type: 'selectEntity', entityId: 1 });
    queue.push({ type: 'selectEntity', entityId: 2 });
    queue.push({ type: 'deselectAll' });

    const received: string[] = [];
    queue.drain((cmd) => received.push(cmd.type));
    expect(received).toEqual(['selectEntity', 'selectEntity', 'deselectAll']);
    expect(queue.pending).toBe(0);
   });

  it('pause does NOT clear the queue (new semantics)', () => {
    const queue = createCommandQueue<CommandMap>();
    queue.push({ type: 'selectEntity', entityId: 1 });
    queue.push({ type: 'deselectAll' });
    expect(queue.pending).toBe(2);
    queue.pause();
    expect(queue.paused).toBe(true);
     // Queue is NOT cleared on pause.
    expect(queue.pending).toBe(2);
    const received: string[] = [];
    queue.drain((cmd) => received.push(cmd.type));
    expect(received).toEqual(['selectEntity', 'deselectAll']);
    expect(queue.pending).toBe(0);
    });

  it('pause blocks gameplay commands but allows control commands', () => {
    const queue = createCommandQueue<CommandMap>(CONTROL_TYPES);
    queue.pause();
      // Gameplay command is dropped.
    queue.push({ type: 'selectEntity', entityId: 1 });
    expect(queue.pending).toBe(0);
      // Control command passes through.
    queue.push({ type: 'resize', width: 800, height: 600 });
    expect(queue.pending).toBe(1);
    });

  it('resume allows gameplay push again', () => {
    const queue = createCommandQueue<CommandMap>(CONTROL_TYPES);
    queue.pause();
    queue.push({ type: 'selectEntity', entityId: 1 });
    expect(queue.pending).toBe(0); // blocked
    queue.resume();
    queue.push({ type: 'selectEntity', entityId: 2 });
    expect(queue.pending).toBe(1); // accepted
    });

  it('resume does not replay pre-pause state — queue is FIFO', () => {
    const queue = createCommandQueue<CommandMap>();
    queue.push({ type: 'selectEntity', entityId: 1 });
    queue.pause();
      // While paused, push gameplay command — dropped.
    queue.push({ type: 'selectEntity', entityId: 2 });
    expect(queue.pending).toBe(1); // only the pre-pause command remains
    queue.resume();
    const received: string[] = [];
    queue.drain((cmd) => received.push(cmd.type));
    expect(received).toEqual(['selectEntity']); // one command
    });

  it('clear removes pending commands without pausing', () => {
    const queue = createCommandQueue<CommandMap>();
    queue.push({ type: 'selectEntity', entityId: 1 });
    queue.push({ type: 'selectEntity', entityId: 2 });
    queue.clear();
    expect(queue.pending).toBe(0);
    expect(queue.paused).toBe(false);
    });

  it('destroy makes the queue unusable', () => {
    const queue = createCommandQueue<CommandMap>();
    queue.destroy();
    expect(queue.paused).toBe(false);
    expect(queue.pending).toBe(0);
    });

  it('drain on empty queue does not throw', () => {
    const queue = createCommandQueue<CommandMap>();
    expect(() => queue.drain(() => {})).not.toThrow();
    });

  it('type-safe: wrong push command fails to compile (compile-time assertion)', () => {
    const queue = createCommandQueue<CommandMap>();
      // @ts-expect-error — 'unknown' is not a valid CommandMap key
    queue.push({ type: 'unknown' });
    });
});

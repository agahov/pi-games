/**
 * kernel/event-bus test suite
 *
 * Run: `pnpm test:unit -- event-bus.test`
 */

import { describe, it, expect, vi } from 'vitest';
import { createTypedBus } from '@/kernel/event-bus';

type TestEvents = {
  ping: { id: number; msg: string };
  pong: { id: number };
};

describe('event-bus.ts', () => {
  it('emit notifies all registered listeners', () => {
    const bus = createTypedBus<TestEvents>();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    bus.on('ping', cb1);
    bus.on('ping', cb2);
    bus.emit('ping', { id: 1, msg: 'hello' });
    expect(cb1).toHaveBeenCalledWith({ id: 1, msg: 'hello' });
    expect(cb2).toHaveBeenCalledWith({ id: 1, msg: 'hello' });
      });

  it('off removes a single listener', () => {
    const bus = createTypedBus<TestEvents>();
    const cb = vi.fn();
    bus.on('ping', cb);
    bus.off('ping', cb);
    bus.emit('ping', { id: 2, msg: 'again' });
    expect(cb).not.toHaveBeenCalled();
      });

  it('emit for unregistered event is a no-op', () => {
    const bus = createTypedBus<TestEvents>();
    expect(() => bus.emit('pong', { id: 0 })).not.toThrow();
      });

  it('off for non-existent listener does not throw', () => {
    const bus = createTypedBus<TestEvents>();
    const cb = vi.fn();
    expect(() => bus.off('ping', cb)).not.toThrow();
      });

  it('clear removes all listeners for an event', () => {
    const bus = createTypedBus<TestEvents>();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    bus.on('ping', cb1);
    bus.on('ping', cb2);
    bus.clear('ping');
    bus.emit('ping', { id: 3, msg: 'x' });
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();
      });

  it('destroy removes all registrations', () => {
    const bus = createTypedBus<TestEvents>();
    const cb = vi.fn();
    bus.on('ping', cb);
    bus.destroy();
    bus.emit('ping', { id: 4, msg: 'z' });
    expect(cb).not.toHaveBeenCalled();
      });

  it('multiple listeners fire in registration order', () => {
    const bus = createTypedBus<TestEvents>();
    const order: string[] = [];
    bus.on('ping', () => order.push('a'));
    bus.on('ping', () => order.push('b'));
    bus.on('ping', () => order.push('c'));
    bus.emit('ping', { id: 5, msg: 'ord' });
    expect(order).toEqual(['a', 'b', 'c']);
      });

  it('type-safe: wrong event name fails to compile (compile-time assertion)', () => {
    const bus = createTypedBus<TestEvents>();
    // @ts-expect-error — 'bad' is not a key of TestEvents
    bus.on('bad', () => {});
      });
});

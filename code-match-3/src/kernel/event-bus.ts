/**
 * kernel/event-bus.ts — Typed event bus
 *
 * Minimal event dispatcher. Consumers define a record of event-name → payload
 * type and use `createTypedBus` to get a fully type-safe `on`/`off`/`emit` API.
 *
 * Zero `any` — all callbacks are parameterised by the event map.
 */

/**
 * Event map: a record from event-name → payload type.
 *
 * Example:
 *     type MyEvents = {
 *       entitySelected: { entityId: number };
 *       scoreUpdated:    { score: number };
 *      };
 */
export type EventMap = Record<string, unknown>;

/**
 * A typed event bus — all methods fully parametrized, no `any`.
 */
export interface TypedEventBus<TEvents extends EventMap = EventMap> {
    /** Register a listener for an event. */
  on<Name extends keyof TEvents>(name: Name, cb: (payload: TEvents[Name]) => void): void;
    /** Remove a previously registered listener. */
  off<Name extends keyof TEvents>(name: Name, cb: (payload: TEvents[Name]) => void): void;
    /** Emit an event, invoking all listeners with the payload. */
  emit<Name extends keyof TEvents>(name: Name, payload: TEvents[Name]): void;
    /** Remove all listeners for a specific event. */
  clear: <Name extends keyof TEvents>(name: Name) => void;
    /** Destroy all registrations — for teardown. */
  destroy: () => void;
}

// Internal — the listener map uses `any` to avoid circular type resolution
// while the public API surface is fully type-safe via the public return type.
type ListenerEntry = Map<string, Array<(payload: any) => void>>;

/**
 * Create a typed event bus.
 */
export function createTypedBus<TEvents extends EventMap = EventMap>(): TypedEventBus<TEvents> {
  const listeners: ListenerEntry = new Map();

  function on<Name extends keyof TEvents>(
    name: Name,
    cb: (payload: TEvents[Name]) => void,
    ): void {
    const key = name as string;
    const arr = listeners.get(key);
    if (arr) arr.push(cb as (payload: any) => void);
    else listeners.set(key, [cb as (payload: any) => void]);
     }

  function off<Name extends keyof TEvents>(
    name: Name,
    cb: (payload: TEvents[Name]) => void,
    ): void {
    const key = name as string;
    const arr = listeners.get(key);
    if (!arr) return;
    const idx = arr.indexOf(cb as (payload: any) => void);
    if (idx >= 0) arr.splice(idx, 1);
    if (arr.length === 0) listeners.delete(key);
     }

  function emit<Name extends keyof TEvents>(name: Name, payload: TEvents[Name]): void {
    const key = name as string;
    const arr = listeners.get(key);
    if (!arr || arr.length === 0) return;
      // Copy to avoid re-entrancy issues on mutation during emit.
    arr.slice().forEach((cb) => cb(payload));
     }

  function clear(name: keyof TEvents): void {
    listeners.delete(name as string);
     }

  function destroy(): void {
    listeners.clear();
     }

  return { on, off, emit, clear, destroy };
}

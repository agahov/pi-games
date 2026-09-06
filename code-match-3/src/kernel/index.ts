/**
 * kernel/index.ts — Barrel re-export for the kernel layer
 */

export type { Ticker } from './game-loop';
export { Phase, createGameLoop, type GameLoop } from './game-loop';
export { createTypedBus, type TypedEventBus, type EventMap } from './event-bus';
export { createCommandQueue, type CommandQueue } from './command-queue';
export { createLogger, type Logger, type LogLevel, DOMAINS } from './logger';

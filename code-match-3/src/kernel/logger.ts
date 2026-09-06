/**
 * kernel/logger.ts — Domain-scoped logger with runtime filtering
 *
 * Usage:
 *    import { createLogger } from '@/kernel/logger';
 *    const logger = createLogger(['ui', 'selection']);
 *    logger.debug('click on tile');    // "[ui:selection] DEBUG click on tile"
 *
 *     // Runtime filtering:
 *    logger.setDomains(null);    // show all
 *    logger.setDomains(['ui']); // only ui-scoped loggers log
 *    logger.setDomains([]);      // silence all
 *
 *     // Set verbosity:
 *    logger.setLevel('info');    // trace + debug suppressed
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info:  2,
  warn:  3,
  error: 4,
};

/**
 * A scoped logger with a fixed domain list and a mutable domain/level filter.
 */
export interface Logger {
     /** Log at trace level — fine-grained operational detail. */
  trace: (msg: string, ...args: unknown[]) => void;
     /** Log at debug level — developer diagnostics. */
  debug: (msg: string, ...args: unknown[]) => void;
     /** Log at info level — significant lifecycle events. */
  info:  (msg: string, ...args: unknown[]) => void;
     /** Log at warn level — recoverable problems. */
  warn:  (msg: string, ...args: unknown[]) => void;
     /** Log at error level — failures. */
  error: (msg: string, ...args: unknown[]) => void;
     /**
    * Override which domains are active.
    *    - `null`      → all domains active
    *    - `string[]`  → only these domains active
    *    - `[]`        → nothing logs
    * Default: all domains active.
    */
  setDomains: (domains: string[] | null) => void;
     /** Set the minimum log level (higher levels always pass). */
  setLevel: (level: LogLevel) => void;
     /** Current minimum log level. */
  readonly level: LogLevel;
     /** Current active domain filter. */
  readonly activeDomains: string[] | null;
}

/* ── Implementation ───────────────────────────────────────────────────────── */

export function createLogger(
  domains: readonly string[],
): Logger {
  // `null` means "no filter — all domains active".
  let activeFilter: Set<string> | null = null;
  let minLevel: LogLevel = 'debug';

  function isDomainActive(level: LogLevel): boolean {
        // Domain check: if a filter is set, at least one of our domains must match.
    if (activeFilter !== null) {
        // No intersection → skip.
      if (!domains.some((d) => activeFilter!.has(d))) return false;
      }

        // Level check.
    return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
    }

  function gate(level: LogLevel, msg: string, ...args: unknown[]): void {
    if (!isDomainActive(level)) return;

    const tag = domains.join(':');
    const line = `[${tag}] ${level.toUpperCase().padEnd(5)} ${msg}`;
     // `trace` routes to `console.debug` (no standard `console.trace` output format).
    const fn: CallableFunction =
      level === 'trace' ? console.debug : (console[level as keyof Console] as CallableFunction);
    fn(line, ...args);
     }

  const logger: Logger = {
    trace: (msg, ...args) => gate('trace', msg, ...args),
    debug: (msg, ...args) => gate('debug', msg, ...args),
    info:  (msg, ...args) => gate('info',  msg, ...args),
    warn:  (msg, ...args) => gate('warn',  msg, ...args),
    error: (msg, ...args) => gate('error', msg, ...args),
    setDomains(d: string[] | null): void {
      activeFilter = d === null ? null : new Set(d);
       },
    setLevel(l: LogLevel): void {
      minLevel = l;
       },
    get level(): LogLevel {
      return minLevel;
       },
    get activeDomains(): string[] | null {
        // Return a copy to prevent external mutation.
      if (activeFilter === null) return null;
      return Array.from(activeFilter);
       },
    };

  return logger;
}

/* ── Domain constants ─────────────────────────────────────────────────────── */

/** Pre-defined domain groups for common subsystems. */
export const DOMAINS = {
  init:      'init',
  loop:      'loop',
  render:    'render',
  input:     'input',
  ui:        'ui',
  selection: 'selection',
  event:     'event',
  command:   'command',
} as const;

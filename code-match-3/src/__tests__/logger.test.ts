/**
 * kernel/logger.test.ts — domain filter + level gating
 *
 * Run: `pnpm test:unit -- logger.test`
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLogger, DOMAINS } from '@/kernel/logger';

describe('kernel/logger.ts', () => {

  beforeEach(() => {
     vi.restoreAllMocks();
    });

  it('logs at debug level by default with domain tag', () => {
    const spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const logger = createLogger([DOMAINS.ui, DOMAINS.selection]);
    logger.debug('click on tile');

    expect(spyDebug).toHaveBeenCalledTimes(1);
    expect(spyDebug.mock.calls[0]![0]).toBe('[ui:selection] DEBUG click on tile');
     });

  it('silences when domain is filtered out', () => {
    const spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const logger = createLogger([DOMAINS.render]);
    logger.setDomains([DOMAINS.ui]);   // active domain is 'ui', logger domain is 'render'
    logger.debug('should be silenced');

    expect(spyDebug).not.toHaveBeenCalled();
     });

  it('allows when domain is in the filter', () => {
    const spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const logger = createLogger([DOMAINS.ui]);
    logger.setDomains([DOMAINS.ui]);
    logger.debug('visible');
    expect(spyDebug).toHaveBeenCalledTimes(1);
     });

  it('setLevel(info) suppresses trace and debug', () => {
    const spyInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
    const spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const logger = createLogger(['test']);
    logger.setLevel('info');

    logger.trace('suppressed');
    logger.debug('suppressed');
    logger.info('visible');

    expect(spyDebug).not.toHaveBeenCalled();
    expect(spyInfo).toHaveBeenCalledTimes(1);
     });

  it ('setDomains null re-activates all', () => {
    const spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const logger = createLogger(['excluded']);
    logger.setDomains([DOMAINS.ui]);  // excludes our domain
    logger.debug('hidden');
    expect(spyDebug).not.toHaveBeenCalled();

    logger.setDomains(null);    // restore all
    logger.debug('visible again');
    expect(spyDebug).toHaveBeenCalledTimes(1);
     });

  it('setDomains([]) silences everything', () => {
    const spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const logger = createLogger([DOMAINS.ui]);
    logger.setDomains([]);         // empty filter → nothing logs
    logger.debug('silent');
     expect(spyDebug).not.toHaveBeenCalled();
     });

  it('error level logs even when level is set to info', () => {
         // error (4) ≥ info (2), so it passes the level gate.
     const spyErr = vi.spyOn(console, 'error').mockImplementation(() => {});
     const logger = createLogger(['test']);
    logger.setLevel('info');
    logger.error('boom');
     expect(spyErr).toHaveBeenCalledTimes(1);
     });
});

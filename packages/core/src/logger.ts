/**
 * Minimal, level-gated logger.
 *
 * The form builder runs inside host applications, so unconditional `console.log`
 * calls in hot paths (condition evaluation, expression interpolation) leak noise
 * into consumer consoles and cost measurable time when a form has many fields.
 *
 * Levels are ordered; a message is emitted when its level is at or below the
 * configured threshold. `warn` is the default so genuine problems still surface
 * while diagnostic tracing stays opt-in.
 */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
};

let currentLevel: LogLevel = 'warn';

/**
 * Sets the global log level for the form builder.
 * @param level - Threshold at or below which messages are emitted
 */
export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

/** Returns the currently configured log level. */
export function getLogLevel(): LogLevel {
  return currentLevel;
}

const enabled = (level: Exclude<LogLevel, 'silent'>): boolean => LEVEL_WEIGHT[level] <= LEVEL_WEIGHT[currentLevel];

const PREFIX = '[form-builder]';

export const logger = {
  error(...args: unknown[]): void {
    if (enabled('error')) console.error(PREFIX, ...args);
  },
  warn(...args: unknown[]): void {
    if (enabled('warn')) console.warn(PREFIX, ...args);
  },
  info(...args: unknown[]): void {
    if (enabled('info')) console.info(PREFIX, ...args);
  },
  debug(...args: unknown[]): void {
    if (enabled('debug')) console.debug(PREFIX, ...args);
  }
};

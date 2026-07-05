import { writeLog } from "./config.js";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * File-first logger shared by both apps. Never writes to stdout — Claude Code
 * parses hook stdout — only errors mirror to stderr (via writeLog).
 */
export class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  debug(msg: string) {
    this.log(LogLevel.DEBUG, msg);
  }

  info(msg: string) {
    this.log(LogLevel.INFO, msg);
  }

  warn(msg: string) {
    this.log(LogLevel.WARN, msg);
  }

  error(msg: string) {
    this.log(LogLevel.ERROR, msg);
  }

  warnException(err: unknown) {
    this.warn(err instanceof Error ? err.message : String(err));
  }

  errorException(err: unknown) {
    this.error(err instanceof Error ? err.message : String(err));
  }

  private log(level: LogLevel, msg: string) {
    if (level < this.level) return;
    const isError = level >= LogLevel.ERROR;
    writeLog(`[${LogLevel[level]}] ${msg}`, isError);
  }
}

export const logger = new Logger();

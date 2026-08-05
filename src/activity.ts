// What this plugin reports on the shared activity bus, kept out of the hook logic.
import { emitEvent, TOPICS, withCause } from "../core/src/index.js";

const SOURCE = "wakatime-sync";

// A flush is one aggregate event, never one per file. It sits at debug because it
// happens constantly and nothing acts on it; failures and installs sit above the
// floor because they are worth knowing about.
export function emitHeartbeats(count: number, lineChanges: number): void {
  try {
    emitEvent({
      topic: TOPICS.syncCompleted,
      action: "heartbeats_sent",
      impact: "debug",
      outcome: "ok",
      details: {
        count,
        lineChanges,
        message: `Sent ${count} heartbeat${count === 1 ? "" : "s"} (${lineChanges} line changes)`,
      },
    }, SOURCE);
  } catch { /* tracking time is not worth breaking a session for */ }
}

export function emitSyncFailed(message: string): void {
  try {
    emitEvent({
      topic: TOPICS.syncCompleted,
      action: "sync_failed",
      impact: "warning",
      outcome: "failed",
      details: { message },
    }, SOURCE);
  } catch { /* nothing to report the failure with */ }
}

export function emitCliInstalled(version: string | null): void {
  try {
    emitEvent({
      topic: TOPICS.syncCompleted,
      action: "cli_installed",
      impact: "notice",
      outcome: "ok",
      subject: { kind: "binary", id: "wakatime-cli", label: "wakatime-cli" },
      details: { version: version || "", message: `Installed wakatime-cli ${version || ""}`.trim() },
    }, SOURCE);
  } catch { /* the install already happened */ }
}

// The host app invokes this plugin from a hook, which is the honest cause for
// everything it does.
export function withHookCause<T>(surface: string, fn: () => T): T {
  try {
    return withCause({ kind: "hook", surface }, fn) as T;
  } catch {
    return fn();
  }
}

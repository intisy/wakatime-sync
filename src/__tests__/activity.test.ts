// wakatime-sync reports what it did on the shared activity bus: routine flushes sit
// below the default noise floor, failures and installs sit above it. Each test owns
// its own home so nothing is written to the developer's real one.
import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readActivity } from "@intisy-ai/basekit";
import { emitHeartbeats, emitSyncFailed, emitCliInstalled, withHookCause } from "../activity.js";

const ENV_KEYS = ["HUB_CONFIG_DIR", "HUB_OPENCODE_DIR", "CORE_APP"];
const savedEnv: Record<string, string | undefined> = {};
const homes: string[] = [];

function tempHome(settings?: Record<string, unknown>): string {
  const home = mkdtempSync(join(tmpdir(), "wakatime-activity-"));
  homes.push(home);
  for (const key of ENV_KEYS) if (!(key in savedEnv)) savedEnv[key] = process.env[key];
  process.env.HUB_CONFIG_DIR = home;
  process.env.HUB_OPENCODE_DIR = home;
  process.env.CORE_APP = "opencode";
  mkdirSync(join(home, "config"), { recursive: true });
  if (settings) writeFileSync(join(home, "config", "settings.json"), JSON.stringify(settings), "utf8");
  return home;
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  while (homes.length) rmSync(homes.pop() as string, { recursive: true, force: true });
});

describe("wakatime-sync activity", () => {
  it("keeps routine heartbeats below the default noise floor", () => {
    const home = tempHome();
    emitHeartbeats(3, 42);
    expect(readActivity([home]).records).toHaveLength(0);
  });

  it("records heartbeats when the floor is lowered, with a readable line", () => {
    const home = tempHome({ activityMinImpact: "debug" });
    emitHeartbeats(3, 42);

    const [rec] = readActivity([home]).records;
    expect(rec.action).toBe("heartbeats_sent");
    expect(rec.impact).toBe("debug");
    expect(rec.outcome).toBe("ok");
    expect(rec.details.count).toBe(3);
    expect(rec.details.lineChanges).toBe(42);
    expect(rec.text).toContain("3");
    expect(rec.source).toBe("wakatime-sync");
  });

  it("records a failure as a warning that is visible by default", () => {
    const home = tempHome();
    emitSyncFailed("wakatime-cli exited 1");

    const [rec] = readActivity([home]).records;
    expect(rec.action).toBe("sync_failed");
    expect(rec.impact).toBe("warning");
    expect(rec.outcome).toBe("failed");
    expect(rec.text).toContain("wakatime-cli exited 1");
  });

  it("records a cli install as a notice", () => {
    const home = tempHome();
    emitCliInstalled("v1.2.3");

    const [rec] = readActivity([home]).records;
    expect(rec.action).toBe("cli_installed");
    expect(rec.impact).toBe("notice");
    expect(rec.outcome).toBe("ok");
    expect(rec.subject.kind).toBe("binary");
    expect(rec.details.version).toBe("v1.2.3");
  });

  it("names the host hook as the cause of what it emits inside a hook scope", async () => {
    const home = tempHome();
    await withHookCause("chat.message", async () => {
      await Promise.resolve();
      emitSyncFailed("boom");
    });

    const [rec] = readActivity([home]).records;
    expect(rec.cause).toEqual({ kind: "hook", surface: "chat.message" });
  });

  it("still runs the work when a cause scope cannot be established", () => {
    const home = tempHome();
    let ran = false;
    withHookCause("chat.message", () => { ran = true; });
    expect(ran).toBe(true);
    expect(readActivity([home]).records).toHaveLength(0);
  });

  it("records an install with no known version without printing an empty version", () => {
    const home = tempHome();
    emitCliInstalled(null);

    const [rec] = readActivity([home]).records;
    expect(rec.details.version).toBe("");
    expect(rec.details.message).toBe("Installed wakatime-cli");
  });
});

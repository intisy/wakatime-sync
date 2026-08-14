import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateManifest } from "../../core/api/dist/index.js";
import plugin from "../plugin.js";
import type { CapabilitySchema, PluginContext, SettingsCapability } from "../../core/api/dist/index.js";

const manifest = JSON.parse(readFileSync(new URL("../../plugin.json", import.meta.url), "utf-8"));

// Nothing here writes today, but this plugin's config and logging resolve the ambient home, so the
// home is pinned rather than left to whatever machine runs the suite.
let ambient: string;

beforeEach(() => {
  ambient = mkdtempSync(join(tmpdir(), "ws-plugin-"));
  vi.stubEnv("HUB_CONFIG_DIR", ambient);
  mkdirSync(join(ambient, "config"), { recursive: true });
});

afterEach(() => {
  vi.unstubAllEnvs();
  rmSync(ambient, { recursive: true, force: true });
});

function fakeContext(): { context: PluginContext; provided: Map<string, unknown> } {
  const provided = new Map<string, unknown>();
  const context = {
    manifest,
    host: { app: "opencode", api: 1, surfaces: ["tui"] },
    config: { all: () => ({}), get: () => undefined, set: async () => {} },
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
    paths: { home: "/home", repos: "/home/repos", plugin: "/home/plugin", cache: "/home/cache", config: "/home/config" },
    services: { register: vi.fn(), get: vi.fn(), want: vi.fn(), watch: vi.fn() },
    events: { publish: vi.fn(), subscribe: vi.fn() },
    provide: (id: string, implementation: unknown) => { provided.set(id, implementation); },
  } as unknown as PluginContext;
  return { context, provided };
}

describe("plugin.json", () => {
  it("is a valid manifest", () => {
    expect(validateManifest(manifest)).toEqual([]);
  });

  it("keeps its id equal to the repository and clone directory name", () => {
    expect(manifest.id).toBe("wakatime-sync");
  });

  it("declares exactly the capabilities activate provides", () => {
    const { context, provided } = fakeContext();
    plugin.activate(context);
    expect([...provided.keys()].sort()).toEqual([...manifest.capabilities].sort());
  });
});

describe("the settings capability", () => {
  function settings(): SettingsCapability {
    const { context, provided } = fakeContext();
    plugin.activate(context);
    return provided.get("settings") as SettingsCapability;
  }

  it("answers with the fields src/config.ts declares", async () => {
    const schema = (await settings().schema()) as CapabilitySchema;
    expect(schema.fields?.map((field) => field.key)).toEqual([
      "logging",
      "api_key",
      "api_url",
      "heartbeat_interval_seconds",
      "cli_update_interval_hours",
      "proxy",
      "hostname",
      "hide_filenames",
      "hide_project_names",
    ]);
  });

  it("marks the API key as a secret so a surface masks it", async () => {
    const schema = (await settings().schema()) as CapabilitySchema;
    expect(schema.fields?.find((field) => field.key === "api_key")?.type).toBe("secret");
  });

  it("declares no actions, because every CLI action of this plugin writes to stdout", async () => {
    const schema = (await settings().schema()) as CapabilitySchema;
    expect(schema.actions).toBeUndefined();
  });

  it("refuses an action by name instead of throwing", async () => {
    expect(await settings().run("today")).toEqual({
      ok: false,
      message: 'wakatime-sync declares no action "today"',
    });
  });
});

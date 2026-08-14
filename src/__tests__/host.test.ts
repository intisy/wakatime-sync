import { describe, expect, it } from "vitest";
import { importedByHost, shouldRunClaudeHook } from "../host.js";

describe("importedByHost", () => {
  it("is true for the generic host key", () => {
    expect(importedByHost({ INTISY_PLUGIN_LIBRARY_MODE: "1" })).toBe(true);
  });

  it("is true for the vendor-named key a host deployed earlier still sets", () => {
    expect(importedByHost({ PLUGIN_UPDATER_LIBRARY_MODE: "1" })).toBe(true);
  });

  it("is false when neither key is set", () => {
    expect(importedByHost({})).toBe(false);
  });

  it("is false for a value other than 1, so an unset-but-present key does not count", () => {
    expect(importedByHost({ INTISY_PLUGIN_LIBRARY_MODE: "0", PLUGIN_UPDATER_LIBRARY_MODE: "" })).toBe(false);
  });

  it("is true for the generic activation key", () => {
    expect(importedByHost({ INTISY_PLUGIN_ACTIVATION: "1" })).toBe(true);
  });

  it("is true for the vendor-named activation key", () => {
    expect(importedByHost({ PLUGIN_UPDATER_ACTIVATION: "1" })).toBe(true);
  });
});

describe("shouldRunClaudeHook", () => {
  it("runs the hook when Claude Code launched this process itself", () => {
    expect(shouldRunClaudeHook(true, {})).toBe(true);
  });

  it("does not run the hook when a host imported the bundle", () => {
    expect(shouldRunClaudeHook(true, { INTISY_PLUGIN_LIBRARY_MODE: "1" })).toBe(false);
  });

  it("does not run the hook when the app is not Claude Code", () => {
    expect(shouldRunClaudeHook(false, {})).toBe(false);
  });

  it("does not run the hook while a host is mid-activation", () => {
    expect(shouldRunClaudeHook(true, { INTISY_PLUGIN_ACTIVATION: "1" })).toBe(false);
  });
});

// wakatime-sync config + logging — delegated to the shared core library so
// every plugin uses one config + logging system. Public API kept stable for logger.ts.
import {
  getAppConfigDir,
  loadConfig,
  defineConfig,
  defineCapabilities,
  makeWriteLog,
} from "@intisy-ai/core";

const PACKAGE_NAME = "wakatime-sync";

// register defaults so the loader can discover + edit them (writes no file on load)
defineConfig(PACKAGE_NAME, {
  logging: true,
  // How many seconds must elapse between heartbeats (per-project rate limit).
  heartbeat_interval_seconds: 60,
  // How many hours between checks for a newer wakatime-cli binary.
  cli_update_interval_hours: 4,
  // When non-empty, written into ~/.wakatime.cfg [settings] api_key on activation.
  api_key: "",
  // WakaTime's own default API endpoint. Shown as the default so it's documented;
  // only written into ~/.wakatime.cfg when the user explicitly sets it (the merge
  // reads the on-disk config, not this default), so it never clobbers an existing cfg.
  api_url: "https://api.wakatime.com/api/v1",
  // When true, sets hidefilenames = true in ~/.wakatime.cfg [settings] on activation.
  hide_filenames: false,
  // When non-empty, written into ~/.wakatime.cfg [settings] proxy on activation.
  proxy: "",
  // When non-empty, written into ~/.wakatime.cfg [settings] hostname on activation.
  hostname: "",
  // When true, sets hide_project_names = true in ~/.wakatime.cfg [settings] on activation.
  hide_project_names: false,
});

defineCapabilities(PACKAGE_NAME, {
  fields: [
    { key: "logging", type: "boolean", label: "Logging", description: "Write this plugin's log file.", group: "General" },
    { key: "api_key", type: "secret", label: "API key", description: "Written into ~/.wakatime.cfg on activation.", group: "WakaTime account", placeholder: "waka_..." },
    { key: "api_url", type: "string", label: "API URL", group: "WakaTime account" },
    { key: "heartbeat_interval_seconds", type: "number", label: "Heartbeat interval (s)", description: "Minimum seconds between heartbeats per project.", min: 1, group: "Heartbeats" },
    { key: "cli_update_interval_hours", type: "number", label: "CLI update check (h)", min: 1, group: "Updates" },
    { key: "proxy", type: "string", label: "Proxy", description: "Written into ~/.wakatime.cfg proxy.", group: "Network" },
    { key: "hostname", type: "string", label: "Hostname", group: "Network" },
    { key: "hide_filenames", type: "boolean", label: "Hide filenames", group: "Privacy" },
    { key: "hide_project_names", type: "boolean", label: "Hide project names", group: "Privacy" },
  ],
});

export { getAppConfigDir };

export function getPluginConfig(
  configDir: string = getAppConfigDir(),
): Record<string, unknown> {
  return loadConfig(PACKAGE_NAME, configDir) as Record<string, unknown>;
}

export const writeLog = makeWriteLog(PACKAGE_NAME);

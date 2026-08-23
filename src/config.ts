// wakatime-sync config + logging — delegated to the shared core library so
// every plugin uses one config + logging system. Public API kept stable for logger.ts.
import { getAppConfigDir, loadConfig, makeWriteLog } from "@intisy-ai/core";
import type { CapabilitySchema } from "@intisy-ai/core";

const PACKAGE_NAME = "wakatime-sync";

// What each setting is called and how a surface renders it, beside the values the manifest
// declares. Data the settings capability answers with.
export const WAKATIME_SETTINGS: CapabilitySchema = {
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
};

export { getAppConfigDir };

export function getPluginConfig(
  configDir: string = getAppConfigDir(),
): Record<string, unknown> {
  return loadConfig(PACKAGE_NAME, configDir) as Record<string, unknown>;
}

export const writeLog = makeWriteLog(PACKAGE_NAME);

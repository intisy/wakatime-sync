// wakatime-sync config + logging, delegated to the shared core library so every plugin
// uses one config + logging system.
import { getAppConfigDir, loadConfig, makeWriteLog } from "@intisy-ai/core";

const PACKAGE_NAME = "wakatime-sync";

export { getAppConfigDir };

export function getPluginConfig(
  configDir: string = getAppConfigDir(),
): Record<string, unknown> {
  return loadConfig(PACKAGE_NAME, configDir) as Record<string, unknown>;
}

export const writeLog = makeWriteLog(PACKAGE_NAME);

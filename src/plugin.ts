import type { Plugin, PluginContext } from "@intisy-ai/api";
import type { SettingsCapability } from "@intisy-ai/core";
import { WAKATIME_SETTINGS } from "./settings.js";

const PLUGIN_ID = "wakatime-sync";

/**
 * This plugin's `settings` capability: the fields `src/config.ts` declares, and nothing to run.
 *
 * @remarks
 * Every action this plugin has is a CLI action that prints its answer to stdout, and a settings
 * surface may be a TUI whose screen that would corrupt, so none is declared and every action id is
 * refused by name.
 */
export function wakatimeSettings(): SettingsCapability {
  return {
    schema: () => WAKATIME_SETTINGS,
    run: async (actionId: string) => ({ ok: false, message: `${PLUGIN_ID} declares no action "${actionId}"` }),
  };
}

/** What an in-process host loads: the api plugin this bundle's default export carries. */
const plugin: Plugin = {
  activate(context: PluginContext) {
    context.provide(context.capability<SettingsCapability>("settings"), wakatimeSettings());
  },
  deactivate() {},
};

export default plugin;

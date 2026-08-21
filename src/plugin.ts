import { createSettingsCapability, SETTINGS } from "@intisy-ai/core";
import type { Plugin, PluginContext } from "@intisy-ai/api";
import type { ActionResult, SettingsCapability } from "@intisy-ai/core";
// Registers this plugin's config defaults and its settings declaration, which schema() reads back.
import "./config.js";

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
  return createSettingsCapability(PLUGIN_ID, (actionId: string): ActionResult => ({
    ok: false,
    message: `${PLUGIN_ID} declares no action "${actionId}"`,
  }));
}

/** What an in-process host loads: the api plugin this bundle's default export carries. */
const plugin: Plugin = {
  activate(context: PluginContext) {
    context.provide(SETTINGS, wakatimeSettings());
  },
  deactivate() {},
};

export default plugin;

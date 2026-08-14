/**
 * Whether a host imported this bundle for its capabilities rather than launching it as an app hook.
 *
 * @remarks
 * A host announces itself in the environment before importing anything, either as a declared library
 * import (`INTISY_PLUGIN_LIBRARY_MODE` / `PLUGIN_UPDATER_LIBRARY_MODE`) or as a mid-activation import
 * of every deployed bundle (`INTISY_PLUGIN_ACTIVATION` / `PLUGIN_UPDATER_ACTIVATION`). The vendor-named
 * keys are still read for a host deployed before the generic ones existed.
 */
export function importedByHost(env: NodeJS.ProcessEnv = process.env): boolean {
  return (
    env.INTISY_PLUGIN_LIBRARY_MODE === "1" ||
    env.PLUGIN_UPDATER_LIBRARY_MODE === "1" ||
    env.INTISY_PLUGIN_ACTIVATION === "1" ||
    env.PLUGIN_UPDATER_ACTIVATION === "1"
  );
}

/**
 * Whether this process should run the Claude Code hook.
 *
 * @remarks
 * The hook reads the process's stdin synchronously, which inside a host is the terminal the user is
 * typing into, so an announced host gets this plugin's capabilities and never the hook.
 *
 * @param isClaudeApp - whether app detection resolved to Claude Code
 */
export function shouldRunClaudeHook(isClaudeApp: boolean, env: NodeJS.ProcessEnv = process.env): boolean {
  return isClaudeApp && !importedByHost(env);
}

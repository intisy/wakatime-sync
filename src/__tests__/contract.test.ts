// Universal plugin contract (shared across the ecosystem via basekit's test-kit):
// the /<plugin>-config CLI round-trips, the slash-commands deploy, and each action
// command runs cleanly — all in isolated temp homes.
import { runPluginContract } from "@intisy-ai/basekit/testing";

runPluginContract({
  name: "wakatime-sync",
  entry: "dist/index.js",
  configName: "wakatime-sync",
  app: "both",
  commands: ["wakatime"],
  deploy: "load",
  actions: [["today"]],
  readme: true,
});

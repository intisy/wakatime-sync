// Bundle the dual-app entry into one ESM file, since OpenCode deploys a plugin as
// a single plugin/<name>.js. Shared libraries stay external: plugin-updater
// materialises them under plugin/node_modules, so every plugin in a home runs one
// copy instead of carrying its own. @opencode-ai/plugin is type-only.
import { readFileSync } from "node:fs";
import { build } from "esbuild";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"));

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: "dist/index.js",
  external: ["@opencode-ai/plugin", "@intisy-ai/basekit"],
  define: { __WAKATIME_VERSION__: JSON.stringify(pkg.version) },
  logLevel: "info",
});

console.log(`Bundled wakatime-sync v${pkg.version} -> dist/index.js`);

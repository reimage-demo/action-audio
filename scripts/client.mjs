import { build } from "esbuild";
await build({
  stdin: {
    contents: "export {ConvexClient} from 'convex/browser';",
    resolveDir: process.cwd(),
  },
  bundle: true,
  minify: true,
  format: "esm",
  platform: "browser",
  outfile: "assets/convex-client.js",
});

import { mkdir, cp, readdir, readFile, writeFile, rm } from "node:fs/promises";
import { build } from "esbuild";
import { loadEnv } from "vite";
const env = loadEnv("production", process.cwd(), "");
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const f of (await readdir(".")).filter(
  (f) =>
    /\.html$/.test(f) ||
    [
      "styles.css",
      "app.js",
      "config.js",
      "robots.txt",
      "sitemap.xml",
      "llms.txt",
    ].includes(f),
))
  await cp(f, "dist/" + f);
for (const dir of ["assets", "shared"])
  await cp(dir, "dist/" + dir, { recursive: true });
await build({
  stdin: {
    contents: "export { ConvexClient } from 'convex/browser';",
    resolveDir: process.cwd(),
  },
  bundle: true,
  minify: true,
  format: "esm",
  platform: "browser",
  outfile: "dist/assets/convex-client.js",
});
if (env.VITE_CONVEX_URL)
  await writeFile(
    "dist/config.js",
    "window.ACTION_AUDIO_CONFIG = " +
      JSON.stringify({
        convexUrl: env.VITE_CONVEX_URL,
        inventoryPreview: env.VITE_INVENTORY_PREVIEW === "true",
      }) +
      ";",
  );
if (env.SITE_URL) {
  const origin = new URL(env.SITE_URL).href.replace(/\/$/, "");
  for (const f of (await readdir("dist")).filter((f) =>
    /\.(html|txt|xml)$/.test(f),
  )) {
    const text = await readFile("dist/" + f, "utf8");
    await writeFile(
      "dist/" + f,
      text.replaceAll("https://actionaudiostorellc.com", origin),
    );
  }
}
// GitHub project sites live below a repository path, rather than the domain root.
const basePath = env.PUBLIC_BASE_PATH || "/";
if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(basePath))
  throw new Error("PUBLIC_BASE_PATH must be a slash-delimited site path.");
if (basePath !== "/") {
  const files = [
    ...(await readdir("dist")).filter((f) => /\.(html|css|js)$/.test(f)),
    ...(await readdir("dist/shared"))
      .filter((f) => f.endsWith(".js"))
      .map((f) => "shared/" + f),
  ];
  for (const file of files) {
    const text = await readFile("dist/" + file, "utf8");
    await writeFile(
      "dist/" + file,
      text.replace(/(["'`(])\/(?!\/)/g, "$1" + basePath),
    );
  }
}
await writeFile("dist/.nojekyll", "");
console.log("Public HTML/CSS/JS built in dist/.");

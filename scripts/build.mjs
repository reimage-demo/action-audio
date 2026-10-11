import { mkdir, cp, readdir, readFile, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { build, transform } from "esbuild";
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
      "site.js",
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
      text.replace(
        file.endsWith(".css") ? /(["'`(])\/(?!\/)/g : /(["'`])\/(?!\/)/g,
        "$1" + basePath,
      ),
    );
  }
}
// Version shared module imports too, so updated application code never imports a stale catalog.
const sharedVersions = await Promise.all(
  (await readdir("dist/shared"))
    .filter((f) => f.endsWith(".js"))
    .map(async (file) => [
      file,
      createHash("sha256")
        .update(await readFile("dist/shared/" + file))
        .digest("hex")
        .slice(0, 12),
    ]),
);
let appSource = await readFile("dist/app.js", "utf8");
for (const [file, version] of sharedVersions)
  appSource = appSource.replaceAll(
    `./shared/${file}"`,
    `./shared/${file}?v=${version}"`,
  );
await writeFile("dist/app.js", appSource);
// Parse the deployable JavaScript after path rewriting, before it can be published.
for (const file of [
  ...(await readdir("dist")).filter((f) => f.endsWith(".js")),
  ...(await readdir("dist/shared"))
    .filter((f) => f.endsWith(".js"))
    .map((f) => "shared/" + f),
]) {
  await transform(await readFile("dist/" + file, "utf8"), {
    loader: "js",
    sourcefile: file,
  });
}
// A new deployment must not reuse stale CSS or JavaScript from browser/CDN caches.
const assetVersions = await Promise.all(
  ["styles.css", "app.js", "site.js", "config.js"].map(async (asset) => {
    const digest = createHash("sha256")
      .update(await readFile("dist/" + asset))
      .digest("hex")
      .slice(0, 12);
    return [basePath + asset, basePath + asset + "?v=" + digest];
  }),
);
for (const file of (await readdir("dist")).filter((f) => f.endsWith(".html"))) {
  let html = await readFile("dist/" + file, "utf8");
  for (const [asset, versioned] of assetVersions)
    html = html.replaceAll('"' + asset + '"', '"' + versioned + '"');
  await writeFile("dist/" + file, html);
}
await writeFile("dist/.nojekyll", "");
console.log("Public HTML/CSS/JS built in dist/.");

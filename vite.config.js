import { defineConfig, loadEnv } from "vite";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [
      {
        name: "public-runtime-config",
        configureServer(server) {
          server.middlewares.use("/config.js", (_req, res, next) => {
            if (!env.VITE_CONVEX_URL) return next();
            res.setHeader("Content-Type", "application/javascript");
            res.end(
              "window.ACTION_AUDIO_CONFIG = " +
                JSON.stringify({
                  convexUrl: env.VITE_CONVEX_URL,
                  inventoryPreview: env.VITE_INVENTORY_PREVIEW === "true",
                }) +
                ";",
            );
          });
        },
      },
    ],
    server: {
      strictPort: true,
      proxy: {
        "/admin": {
          target: "http://127.0.0.1:5174",
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});

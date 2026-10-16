import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  plugins: [tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  build: {
    outDir: "assets/lycoris",
    emptyOutDir: true,
    minify: true,
    lib: {
      entry: "src/nazorix-hero.tsx",
      formats: ["es"],
      fileName: () => "nazorix-hero.js",
      cssFileName: "nazorix-hero",
    },
  },
});

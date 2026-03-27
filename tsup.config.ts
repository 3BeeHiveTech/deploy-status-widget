import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["cjs", "esm"],
    dts: true,
    external: ["react", "react-dom"],
    sourcemap: true,
    clean: true,
  },
  {
    entry: { api: "src/api/index.ts" },
    format: ["cjs", "esm"],
    dts: true,
    external: ["react", "react-dom"],
    sourcemap: true,
  },
]);

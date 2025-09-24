import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
    include: ["tests/unit/**/*.test.ts"],
  },
});

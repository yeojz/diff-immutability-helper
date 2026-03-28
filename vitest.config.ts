import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    exclude: ["src/**/*.bench.ts", "node_modules"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.bench.ts"],
    },
    benchmark: {
      include: ["src/**/*.bench.ts"],
    },
  },
});

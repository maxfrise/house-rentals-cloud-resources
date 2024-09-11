import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    globals: true,
    coverage: {
      provider: "istanbul",
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
});

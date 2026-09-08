import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    // Node環境で実行する（DOMを使わない純粋なロジックのテストのみのため）。
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // アプリと同じ "@/..." のimportをテストからも使えるようにする。
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

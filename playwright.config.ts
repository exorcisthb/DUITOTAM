import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // Timeout cho mỗi test
  timeout: 30_000,
  // Số lần thử lại khi test fail (hữu ích trong CI)
  retries: process.env["CI"] ? 2 : 0,
  // Chạy song song trên CI
  workers: process.env["CI"] ? 2 : undefined,
  // Reporter
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],

  use: {
    // Base URL — dev server
    baseURL: "http://localhost:8080",
    // Chụp screenshot khi test fail
    screenshot: "only-on-failure",
    // Trace file khi retry
    trace: "on-first-retry",
  },

  // Tự động khởi động dev server trước khi chạy test
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env["CI"],
    timeout: 60_000,
    env: {
      TURSO_DATABASE_URL: process.env["TURSO_DATABASE_URL"] ?? "file:./sqlite.db",
      TURSO_AUTH_TOKEN: process.env["TURSO_AUTH_TOKEN"] ?? "",
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

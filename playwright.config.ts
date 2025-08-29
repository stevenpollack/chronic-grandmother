import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: "**\/*.@(spec).?(c|m)[jt]s?(x)",
  webServer: {
    command: "npm run start",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:5173",
  },
  outputDir: 'test-results',
  timeout: 30000,
});
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  reporter: 'list',
  use: {
    baseURL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
  },
});

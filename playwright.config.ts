import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'https://app-five-beryl-65.vercel.app',
    headless: true,
  },
  timeout: 30000,
})

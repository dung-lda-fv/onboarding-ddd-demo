// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  workers: 1, // SQLite single-file DB — prevent concurrent write conflicts

  // Playwright tự động start/stop server trước/sau khi chạy tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/health',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  projects: [
    {
      name: 'smoke',
      testMatch: '**/smoke.test.ts',
      timeout: 10000
    },
    {
      name: 'features',
      testMatch: '**/feat-*.test.ts',
      timeout: 30000
    }
  ],
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/e2e-report', open: 'never' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  }
})
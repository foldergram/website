import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  workers: 1,
  reporter: 'list',
  use: {
    browserName: 'chromium',
    launchOptions: { executablePath: '/usr/bin/google-chrome' },
    headless: true,
  },
  webServer: [
    {
      command: 'python3 -m http.server 8777 --bind 127.0.0.1 --directory ../foldergram/.mocks',
      url: 'http://127.0.0.1:8777/',
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
    },
    {
      command: 'pnpm preview --port 4333',
      url: 'http://127.0.0.1:4333/',
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
    },
  ],
});

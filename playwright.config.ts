import { defineConfig, devices } from '@playwright/test';
const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;
const startCommand =
  process.platform === 'win32'
    ? `cmd.exe /d /s /c "pnpm run build && pnpm run start -- --hostname 127.0.0.1 --port ${port}"`
    : `pnpm run build && pnpm run start -- --hostname 127.0.0.1 --port ${port}`;

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/helpers/**'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : 'line',
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: startCommand,
    url: baseURL,
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 240_000,
  },
});

import { expect, test } from '@playwright/test';

import { mockAuthenticatedApp, mockPublicApp } from './helpers/mock-api';

test.describe('auth flows', () => {
  test('redirects unauthenticated users from the dashboard to login', async ({
    page,
  }) => {
    await mockPublicApp(page);

    await page.goto('/en');

    await expect(page).toHaveURL(/\/en\/login$/);
    await expect(
      page.getByText('Enter the operations workspace').first()
    ).toBeVisible();
  });

  test('validates login and loads the dashboard after sign-in', async ({
    page,
  }) => {
    await mockPublicApp(page);

    await page.goto('/en/login');

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();

    await page.getByLabel('Email').fill('admin@mobili.test');
    await page.getByLabel('Password').fill('SecureP@ss1');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nora Admin' })).toBeVisible();
  });

  test('submits forgot-password requests and shows confirmation state', async ({
    page,
  }) => {
    await mockPublicApp(page);

    await page.goto('/en/forgot-password');
    await page.getByLabel('Email').fill('admin@mobili.test');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(
      page.getByText('Password reset link sent to your email').first()
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset Password' })).toHaveCount(0);
  });

  test('switches locale from the unauthenticated pages', async ({ page }) => {
    await mockPublicApp(page);

    await page.goto('/en/login');

    await page.getByRole('button', { name: /Language/i }).click();
    await page.getByRole('menuitemradio', { name: 'Arabic' }).click();

    await expect(page).toHaveURL(/\/ar\/login$/);
    await expect
      .poll(async () =>
        page.evaluate(() => ({
          dir: document.documentElement.getAttribute('dir'),
          lang: document.documentElement.getAttribute('lang'),
        }))
      )
      .toEqual({ dir: 'rtl', lang: 'ar' });
  });

  test('logs out from the dashboard and clears the access token', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await page.goto('/en');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/\/en\/login$/);
    await expect
      .poll(async () =>
        page.evaluate(() => ({
          accessToken: window.localStorage.getItem('accessToken'),
          refreshToken: window.localStorage.getItem('refreshToken'),
        }))
      )
      .toEqual({
        accessToken: null,
        refreshToken: null,
      });
  });

  test('refreshes the session when the access token expires', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await page.goto('/en/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

    await page.evaluate(() => {
      window.localStorage.setItem('accessToken', 'expired-access-token');
    });

    await page.getByRole('button', { name: 'Refresh' }).click();

    await expect(
      page.getByRole('link', { name: /Ali Hassan/i })
    ).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => ({
          accessToken: window.localStorage.getItem('accessToken'),
          refreshToken: window.localStorage.getItem('refreshToken'),
        }))
      )
      .toEqual({
        accessToken: 'playwright-access-token-refreshed-1',
        refreshToken: 'playwright-refresh-token-rotated-1',
      });
  });
});

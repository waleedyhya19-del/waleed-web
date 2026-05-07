import path from 'node:path';

import { expect, test } from '@playwright/test';

import { mockAuthenticatedApp, mockPublicApp } from './helpers/mock-api';
import { gotoRoute } from './helpers/navigation';

test.describe('dashboard and reports flows', () => {
  test('renders dashboard metrics and recent report navigation', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await page.goto('/en');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.locator('a[href="/en/reports"]').filter({ hasText: 'Total Reports' }).first()).toContainText('5');
    await expect(page.locator('a[href="/en/users"]').filter({ hasText: 'Total Users' })).toContainText('3');

    await expect(
      page.locator('a[href="/en/reports"]').filter({ hasText: 'Total Reports' }).first()
    ).toBeVisible();
  });

  test('filters reports, opens detail, updates status, and follows the user link', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await gotoRoute(page, '/en/reports');

    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();

    await page
      .getByPlaceholder('Search by IMEI, phone, reporter, or ID')
      .fill('111111111111111');

    await expect(
      page.locator('p:visible').filter({ hasText: '111111111111111' }).first()
    ).toBeVisible();
    await expect(page.getByText('222222222222222')).toHaveCount(0);

    await page.getByRole('button', { name: 'Received' }).click();
    await page.getByRole('link', { name: /11111111/ }).click();

    await expect(page).toHaveURL(/\/en\/reports\/11111111-1111-4111-8111-111111111111$/);
    await expect(
      page.getByRole('heading', { name: 'Report Details' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '111111111111111' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Save' })
    ).toBeDisabled();

    await page.locator('button[role="combobox"]').click();
    await page.getByRole('option', { name: 'Reviewing' }).click();
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByText('Report updated successfully')
    ).toBeVisible();
    await expect(page.getByText('Reviewing').first()).toBeVisible();

    await expect(
      page.locator('a[href="/en/users/00000000-0000-4000-8000-000000000101"]')
    ).toHaveCount(1);
    await gotoRoute(page, '/en/users/00000000-0000-4000-8000-000000000101');

    await expect(page).toHaveURL(/\/en\/users\/00000000-0000-4000-8000-000000000101$/);
    await expect(page.getByRole('heading', { name: 'User Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ali Hassan' })).toBeVisible();
  });

  test('admins can create, edit, and delete a report from the dashboard', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await gotoRoute(page, '/en/reports/new');
    await expect(page.getByRole('heading', { name: 'New Report' })).toBeVisible();

    await page.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Ali Hassan' }).click();
    await page.getByLabel('IMEI Number').fill('987654321098765');
    await page.getByLabel('Phone Number').fill('+201088888888');
    await page
      .locator('input[type="file"]')
      .setInputFiles(path.join(process.cwd(), 'output', 'playwright', 'dashboard-en.png'));
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page).toHaveURL(
      /\/en\/reports\/91000000-0000-4000-8000-000000000705$/
    );

    await page.getByRole('button', { name: 'Edit Report' }).click();
    await page.getByLabel('Phone Number').fill('+201099999999');
    await page.locator('form').getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Report updated successfully')).toBeVisible();

    await page.getByRole('button', { name: 'Delete Report' }).click();
    await page
      .locator('[role="alertdialog"]')
      .getByRole('button', { name: 'Delete' })
      .click();

    await expect(page).toHaveURL(/\/en\/reports$/);
    await expect(page.getByText('Report deleted successfully')).toBeVisible();
  });

  test('renders Arabic auth routes in RTL mode', async ({ page }) => {
    await mockPublicApp(page);

    await page.goto('/ar/login');

    await expect(page).toHaveURL(/\/ar\/login$/);
    await expect
      .poll(async () =>
        page.evaluate(() => document.querySelector('[dir]')?.getAttribute('dir'))
      )
      .toBe('rtl');
  });

  test('switches locale from the dashboard and anchors the sidebar to the RTL side', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await page.goto('/en');

    await page.getByRole('button', { name: /Language/i }).click();
    await page.getByRole('menuitemradio', { name: 'Arabic' }).click();

    await expect(page).toHaveURL(/\/ar$/);
    await expect
      .poll(async () =>
        page.evaluate(() => ({
          dir: document.documentElement.getAttribute('dir'),
          lang: document.documentElement.getAttribute('lang'),
        }))
      )
      .toEqual({ dir: 'rtl', lang: 'ar' });
    await expect(
      page.locator('[data-slot="sidebar-container"][data-side="right"]')
    ).toBeVisible();
    await expect
      .poll(async () => {
        const sidebar = await page
          .locator('[data-slot="sidebar-container"][data-side="right"]')
          .boundingBox();
        const topbar = await page.locator('header').first().boundingBox();
        const viewportWidth = page.viewportSize()?.width ?? 0;

        if (!sidebar || !topbar) {
          return false;
        }

        return (
          sidebar.x >= viewportWidth / 2 &&
          sidebar.y >= topbar.y + topbar.height - 8
        );
      })
      .toBe(true);
  });
});

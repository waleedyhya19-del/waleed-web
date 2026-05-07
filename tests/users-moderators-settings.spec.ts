import { expect, test } from '@playwright/test';

import {
  mockAuthenticatedApp,
  testUsers,
} from './helpers/mock-api';
import { gotoRoute } from './helpers/navigation';

test.describe('users, moderators, and settings flows', () => {
  test('searches end users and opens the selected user profile', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await gotoRoute(page, '/en/users');
    await expect(page).toHaveURL(/\/en\/users$/);
    await expect(
      page.getByPlaceholder('Search by name, email, or phone')
    ).toBeVisible();

    await page.getByPlaceholder('Search by name, email, or phone').fill('Mariam');

    await expect(page.getByRole('link', { name: /Mariam Noor/i })).toBeVisible();
    await expect(page.getByText('Ali Hassan')).toHaveCount(0);

    await page.getByRole('link', { name: /Mariam Noor/i }).click();

    await expect(page).toHaveURL(/\/en\/users\/00000000-0000-4000-8000-000000000102$/);
    await expect(page.getByRole('heading', { name: 'User Details' })).toBeVisible();
    await expect(page.getByText('Not locked')).toBeVisible();
  });

  test('lets admins browse moderators and open a moderator detail page', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await gotoRoute(page, '/en/moderators');
    await expect(page).toHaveURL(/\/en\/moderators$/);
    await expect(
      page.getByPlaceholder('Search by name, email, or phone')
    ).toBeVisible();

    await page.getByPlaceholder('Search by name, email, or phone').fill('Karim');
    await page.getByRole('link', { name: /Karim Moderator/i }).click();

    await expect(page).toHaveURL(/\/en\/moderators\/00000000-0000-4000-8000-000000000002$/);
    await expect(
      page.getByRole('heading', { name: 'Moderator Details' })
    ).toBeVisible();
    await expect(page.getByText('Moderator', { exact: true })).toBeVisible();
  });

  test('admins can create, edit, and delete an end-user account', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await gotoRoute(page, '/en/users/new');
    await expect(page.getByRole('heading', { name: 'New User' })).toBeVisible();

    await page.getByLabel('Email').fill('created.user@mobili.test');
    await page.getByLabel('Password').fill('SecureP@ss1');
    await page.getByLabel('Display Name').fill('Created User');
    await page.getByLabel('Phone').fill('+201066666666');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page).toHaveURL(
      /\/en\/users\/90000000-0000-4000-8000-000000000205$/
    );
    await expect(page.getByRole('heading', { name: 'Created User' })).toBeVisible();

    await page.getByRole('button', { name: 'Edit User' }).click();
    await page.getByLabel('Display Name').fill('Created User Prime');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('User updated successfully')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Created User Prime' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Delete User' }).click();
    await page
      .locator('[role="alertdialog"]')
      .getByRole('button', { name: 'Delete' })
      .click();

    await expect(page).toHaveURL(/\/en\/users$/);
    await expect(page.getByText('User deleted successfully')).toBeVisible();
  });

  test('admins can create, edit, and delete a moderator account', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await gotoRoute(page, '/en/moderators/new');
    await expect(page.getByRole('heading', { name: 'New Moderator' })).toBeVisible();

    await page.getByLabel('Email').fill('created.moderator@mobili.test');
    await page.getByLabel('Password').fill('SecureP@ss1');
    await page.getByLabel('Display Name').fill('Created Moderator');
    await page.getByLabel('Phone').fill('+201077777777');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page).toHaveURL(
      /\/en\/moderators\/90000000-0000-4000-8000-000000000205$/
    );
    await expect(
      page.getByRole('heading', { name: 'Created Moderator' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit Moderator' }).click();
    await page.getByLabel('Display Name').fill('Created Moderator Prime');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('User updated successfully')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Created Moderator Prime' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Delete Moderator' }).click();
    await page
      .locator('[role="alertdialog"]')
      .getByRole('button', { name: 'Delete' })
      .click();

    await expect(page).toHaveURL(/\/en\/moderators$/);
    await expect(page.getByText('Moderator deleted successfully')).toBeVisible();
  });

  test('hides the moderators navigation item for moderators after session bootstrap', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page, {
      currentUser: testUsers.moderator,
    });

    await page.goto('/en');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Karim Moderator' })
    ).toBeVisible();
    const sidebar = page.locator('[data-sidebar="sidebar"]:visible').last();
    await expect(
      sidebar.getByRole('link', { name: 'Moderators', exact: true })
    ).toHaveCount(0);
  });

  test('redirects moderators away from admin-only moderator routes', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page, {
      currentUser: testUsers.moderator,
    });

    await gotoRoute(page, '/en/moderators');

    await expect(page).toHaveURL(/\/forbidden$/);
  });

  test('updates profile details and changes the current password from settings', async ({
    page,
  }) => {
    await mockAuthenticatedApp(page);

    await page.goto('/en/settings');

    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    await page.getByLabel('Display Name').fill('Nora Admin Prime');
    await page.getByLabel('Phone').fill('+201099999999');
    await page.getByRole('button', { name: 'Save' }).first().click();

    await expect(
      page.getByText('Settings updated successfully')
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Nora Admin Prime' })
    ).toBeVisible();

    await page.getByLabel('Current Password').fill('SecureP@ss1');
    await page.getByLabel('New Password').fill('NewSecureP@ss2');
    await page.getByLabel('Confirm Password').fill('NewSecureP@ss2');
    await page.getByRole('button', { name: 'Save' }).nth(1).click();

    await expect(
      page.getByText('Password updated successfully')
    ).toBeVisible();
    await expect(page.getByLabel('Current Password')).toHaveValue('');
    await expect(page.getByLabel('New Password')).toHaveValue('');
    await expect(page.getByLabel('Confirm Password')).toHaveValue('');
  });
});

import { test, expect } from '@playwright/test';
import { loginAsTeacher } from './helpers/auth';

test.describe('Teacher Profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto('/profile');
    await page.waitForTimeout(2000);
  });

  test('displays page header', async ({ page }) => {
    await expect(page.getByText('Teacher Profile')).toBeVisible();
  });

  test('shows user info card with name and role', async ({ page }) => {
    await expect(page.getByText('Role:')).toBeVisible();
  });

  test('shows preferences section', async ({ page }) => {
    await expect(page.getByText('Preferences')).toBeVisible();
    await expect(page.getByText('Email notifications')).toBeVisible();
    await expect(page.getByText('Language', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible();
  });
});

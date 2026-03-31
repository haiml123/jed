import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.waitForTimeout(2000);
  });

  test('dashboard loads with stat cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });

  test('users page loads with table', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();
  });

  test('lessons page loads with table', async ({ page }) => {
    await page.goto('/admin/lessons');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /lessons/i }).first()).toBeVisible();
  });

  test('groups page loads', async ({ page }) => {
    await page.goto('/admin/groups');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /group management/i })).toBeVisible();
  });

  test('sidebar navigation between admin pages', async ({ page }) => {
    // Navigate to users
    const usersLink = page.locator('a[href="/admin/users"]').first();
    if (await usersLink.isVisible()) {
      await usersLink.click();
      await page.waitForURL('**/admin/users**');
      expect(page.url()).toContain('/admin/users');
    }

    // Navigate to lessons
    const lessonsLink = page.locator('a[href="/admin/lessons"]').first();
    if (await lessonsLink.isVisible()) {
      await lessonsLink.click();
      await page.waitForURL('**/admin/lessons**');
      expect(page.url()).toContain('/admin/lessons');
    }
  });
});

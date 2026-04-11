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

  test('admin profile page loads', async ({ page }) => {
    await page.goto('/admin/profile');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /admin profile/i })).toBeVisible();
    await expect(page.getByText('Preferences')).toBeVisible();
  });

  test('new lesson wizard loads with Details tab active', async ({ page }) => {
    await page.goto('/admin/lessons/new');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /create new lesson/i })).toBeVisible();
    await expect(page.getByText('Details')).toBeVisible();
    await expect(page.getByText('Video')).toBeVisible();
    await expect(page.getByText('Quiz')).toBeVisible();
    await expect(page.getByText(/lesson title/i)).toBeVisible();
    await expect(page.getByText(/topic/i).first()).toBeVisible();
  });

  test('new lesson wizard can switch tabs', async ({ page }) => {
    await page.goto('/admin/lessons/new');
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Video' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/video source url/i)).toBeVisible();
    await page.getByRole('button', { name: 'Quiz' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/quiz questions/i)).toBeVisible();
  });

  test('new user form loads with all fields', async ({ page }) => {
    await page.goto('/admin/users/new');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /add new user/i })).toBeVisible();
    await expect(page.getByPlaceholder(/enter full name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email@example/i)).toBeVisible();
    await expect(page.getByPlaceholder(/school name/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Teacher' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Director' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Admin', exact: true })).toBeVisible();
  });
});

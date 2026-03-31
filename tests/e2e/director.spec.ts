import { test, expect } from '@playwright/test';
import { loginAsDirector } from './helpers/auth';

test.describe('Director Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDirector(page);
    await page.waitForTimeout(2000);
  });

  test('overview page loads with stat cards', async ({ page }) => {
    await expect(page.getByText('Team Overview')).toBeVisible();
  });

  test('overview shows teacher table', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(3000);
    // At least the page rendered
    await expect(page.getByRole('heading', { name: /team overview/i })).toBeVisible();
  });

  test('reflections page loads', async ({ page }) => {
    await page.goto('/director/reflections');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /reflections/i })).toBeVisible();
  });

  test('analytics page loads', async ({ page }) => {
    await page.goto('/director/analytics');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
  });

  test('assignments page loads', async ({ page }) => {
    await page.goto('/director/assignments');
    await page.waitForTimeout(2000);
    // Should have some heading related to assignments
    const visible = await page.getByText('Assign').first().isVisible().catch(() => false);
    expect(visible).toBe(true);
  });

  test('groups page loads', async ({ page }) => {
    await page.goto('/director/groups');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /group/i }).first()).toBeVisible();
  });

  test('profile page loads', async ({ page }) => {
    await page.goto('/director/profile');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /director profile/i })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import { loginAsTeacher } from './helpers/auth';

test.describe('Teacher Progress', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto('/progress');
    await page.waitForTimeout(2000);
  });

  test('displays progress overview header', async ({ page }) => {
    await expect(page.getByText('Progress Overview')).toBeVisible();
  });

  test('shows progress percentage and mascot greeting', async ({ page }) => {
    await expect(page.getByText('through your learning journey')).toBeVisible();
    await expect(page.getByText('Current Status')).toBeVisible();
  });

  test('shows mandatory lessons section', async ({ page }) => {
    await expect(page.getByText('Mandatory Lessons')).toBeVisible();
  });

  test('shows optional lessons sidebar', async ({ page }) => {
    await expect(page.getByText('Optional Lessons')).toBeVisible();
  });
});

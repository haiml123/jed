import { test, expect } from '@playwright/test';
import { loginAsTeacher } from './helpers/auth';

test.describe('Teacher Home', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
    await page.waitForTimeout(2000);
  });

  test('displays hero welcome section with mascot', async ({ page }) => {
    await expect(page.getByText(/welcome back/i).first()).toBeVisible();
    await expect(page.getByText(/next breakthrough/i).first()).toBeVisible();
    await expect(page.getByText('Continue Learning')).toBeVisible();
  });

  test('displays stat cards', async ({ page }) => {
    await expect(page.getByText('TOTAL XP')).toBeVisible();
    await expect(page.getByText('LESSONS COMPLETED')).toBeVisible();
    // Renamed per Figma designer note: formula = 40% XP + 40% lessons + 20% logins
    await expect(page.getByText(/WEEKLY PROGRESS.*ENGAGEMENT/i)).toBeVisible();
  });

  test('displays continue where you left off section', async ({ page }) => {
    await expect(page.getByText('Continue where you left off')).toBeVisible();
  });

  test('displays achievements and milestones', async ({ page }) => {
    await expect(page.getByText('Recent Achievements')).toBeVisible();
    await expect(page.getByText('Upcoming Milestones')).toBeVisible();
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.click('a[href="/progress"]');
    await page.waitForURL('**/progress**');
    expect(page.url()).toContain('/progress');

    await page.click('a[href="/profile"]');
    await page.waitForURL('**/profile**');
    expect(page.url()).toContain('/profile');

    await page.click('a[href="/home"]');
    await page.waitForURL('**/home**');
    expect(page.url()).toContain('/home');
  });
});

import { test } from '@playwright/test';

const MOBILE = { width: 375, height: 812 };

async function loginAs(page: any, role: 'teacher' | 'director' | 'admin') {
  const emails = { teacher: 'teacher@school.com', director: 'director@school.com', admin: 'admin@school.com' };
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', emails[role]);
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
}

test.describe('Mobile Screenshots', () => {
  test.use({ viewport: MOBILE });

  test('mobile-login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/jed-mobile/login.png', fullPage: true });
  });

  test('mobile-home', async ({ page }) => {
    await loginAs(page, 'teacher');
    await page.goto('/home');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/jed-mobile/home.png', fullPage: true });
  });

  test('mobile-profile', async ({ page }) => {
    await loginAs(page, 'teacher');
    await page.goto('/profile');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/jed-mobile/profile.png', fullPage: true });
  });

  test('mobile-progress', async ({ page }) => {
    await loginAs(page, 'teacher');
    await page.goto('/progress');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/jed-mobile/progress.png', fullPage: true });
  });

  test('mobile-director', async ({ page }) => {
    await loginAs(page, 'director');
    await page.goto('/director');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/jed-mobile/director.png', fullPage: true });
  });
});

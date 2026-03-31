import { test, expect } from '@playwright/test';
import { loginAsTeacher } from './helpers/auth';

test.describe('Lesson Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
    await page.waitForTimeout(2000);
  });

  test('navigates to lesson from home page', async ({ page }) => {
    const lessonLink = page.locator('a[href*="/lesson/"]').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(3000);
      expect(page.url()).toContain('/lesson/');
    }
  });

  test('video step shows player and key takeaways', async ({ page }) => {
    // Navigate to first lesson
    const lessonLink = page.locator('a[href*="/lesson/"]').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(3000);
      await expect(page.getByText('Key Takeaways').first()).toBeVisible();
      await expect(page.getByText('Skip and Continue to Exit Ticket')).toBeVisible();
      await expect(page.locator('header').getByText(/xp/i)).toBeVisible();
    }
  });

  test('skip to exit ticket works', async ({ page }) => {
    const lessonLink = page.locator('a[href*="/lesson/"]').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(3000);
      await page.getByRole('button', { name: /skip and continue/i }).first().click();
      await page.waitForTimeout(2000);
      await expect(page.getByText('EXIT TICKET', { exact: true })).toBeVisible();
    }
  });

  test('exit ticket has textarea and submit button', async ({ page }) => {
    const lessonLink = page.locator('a[href*="/lesson/"]').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(3000);
      await page.getByRole('button', { name: /skip and continue/i }).click();
      await page.waitForTimeout(1000);
      await expect(page.locator('textarea')).toBeVisible();
      await expect(page.getByText('Submit & Continue to Quiz')).toBeVisible();
    }
  });

  test('exit ticket submit leads to quiz', async ({ page }) => {
    const lessonLink = page.locator('a[href*="/lesson/"]').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(3000);
      await page.getByRole('button', { name: /skip and continue/i }).first().click();
      await page.waitForTimeout(2000);
      await page.locator('textarea').first().fill('I learned about setting clear expectations in the classroom.');
      await page.getByRole('button', { name: /submit.*continue.*quiz/i }).click();
      await page.waitForTimeout(5000);
      // Quiz shows question with answer options and progress dots
      const quizVisible = await page.getByText('Progress automatically saved').isVisible().catch(() => false);
      expect(quizVisible).toBe(true);
    }
  });

  test('quiz shows question with options', async ({ page }) => {
    const lessonLink = page.locator('a[href*="/lesson/"]').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(3000);
      // Skip to exit ticket
      await page.getByRole('button', { name: /skip and continue/i }).click();
      await page.waitForTimeout(1000);
      // Fill exit ticket
      await page.locator('textarea').fill('Test reflection');
      await page.getByText('Submit & Continue to Quiz').click();
      await page.waitForTimeout(3000);
      // Check quiz has options (buttons)
      const options = page.locator('button').filter({ hasText: /^(?!.*Submit|.*Skip|.*Exit|.*Continue)/ });
      expect(await options.count()).toBeGreaterThan(0);
    }
  });

  test('header shows XP badge', async ({ page }) => {
    const lessonLink = page.locator('a[href*="/lesson/"]').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(3000);
      await expect(page.locator('header').getByText(/xp/i)).toBeVisible();
      await expect(page.locator('header').getByText('Exit')).toBeVisible();
    }
  });

  test('exit button returns to home', async ({ page }) => {
    const lessonLink = page.locator('a[href*="/lesson/"]').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForTimeout(3000);
      await page.locator('header').getByText('Exit').click();
      await page.waitForURL('**/home**', { timeout: 5000 });
      expect(page.url()).toContain('/home');
    }
  });
});

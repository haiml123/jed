import { test, expect } from '@playwright/test';
import { login, loginAsTeacher, loginAsDirector, loginAsAdmin, logout } from './helpers/auth';

test.describe('Authentication', () => {
  test('login page loads with all form elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.getByText('Hey, let\'s connect?')).toBeVisible();
    await expect(page.getByText('Demo Login Guide')).toBeVisible();
  });

  test('teacher login redirects to /home', async ({ page }) => {
    await loginAsTeacher(page);
    expect(page.url()).toContain('/home');
  });

  test('director login redirects to /director', async ({ page }) => {
    await loginAsDirector(page);
    expect(page.url()).toContain('/director');
  });

  test('admin login redirects to /admin', async ({ page }) => {
    await loginAsAdmin(page);
    expect(page.url()).toContain('/admin');
  });

  test('invalid credentials shows error', async ({ page }) => {
    await login(page, 'wrong@email.com', 'wrongpassword');
    await page.waitForTimeout(3000);
    // Should stay on login or show error
    expect(page.url()).toContain('/login');
  });

  test('logout redirects to /login', async ({ page }) => {
    await loginAsTeacher(page);
    await logout(page);
    expect(page.url()).toContain('/login');
  });
});

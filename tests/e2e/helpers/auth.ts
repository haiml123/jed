import { Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string = 'password123') {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

export async function loginAsTeacher(page: Page) {
  await login(page, 'teacher@school.com');
  await page.waitForURL('**/home**', { timeout: 15000 });
}

export async function loginAsDirector(page: Page) {
  await login(page, 'director@school.com');
  await page.waitForURL('**/director**', { timeout: 15000 });
}

export async function loginAsAdmin(page: Page) {
  await login(page, 'admin@school.com');
  await page.waitForURL('**/admin**', { timeout: 15000 });
}

export async function logout(page: Page) {
  await page.evaluate(() => localStorage.removeItem('jed_token'));
  await page.goto('/login');
}

import { test, expect } from '@playwright/test';

test.describe('Auth flow', () => {
  test('redirects unauthenticated users from /admin to /auth', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByRole('button', { name: /Sign in with Google/i })).toBeVisible();
  });

  test('clicking Sign in with Google starts OAuth redirect', async ({ page }) => {
    await page.goto('/auth');
    const signInButton = page.getByRole('button', { name: /Sign in with Google/i });
    await expect(signInButton).toBeVisible();
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      signInButton.click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    // Verifica que abriu um fluxo externo de OAuth (Google)
    const url = popup.url();
    expect(url).toMatch(/accounts\.google\.com|google\.com/i);
  });
});


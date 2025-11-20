import { test, expect } from '@playwright/test';

test.describe('Header - navegação principal', () => {
  test('mostra botão Admin Blog e navega para /auth', async ({ page }) => {
    await page.goto('/');
    const adminBtn = page.getByRole('link', { name: /Admin Blog/i });
    await expect(adminBtn).toBeVisible();
    await adminBtn.click();
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByRole('button', { name: /Sign in with Google/i })).toBeVisible();
  });
});


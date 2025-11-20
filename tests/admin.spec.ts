import { test, expect } from '@playwright/test';

test.describe('Admin UI access', () => {
  test('New Post button creates a draft only after login (unauthenticated -> blocked)', async ({ page }) => {
    await page.goto('/admin/posts');
    // Sem login, nossa lógica redireciona para /auth
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByRole('button', { name: /Sign in with Google/i })).toBeVisible();
  });
});


import { test, expect } from '@playwright/test';

test.describe('Blog público - navegação e cliques', () => {
  test('Home → Blog: botão "Ver Todos os Artigos" navega para /blog', async ({ page }) => {
    await page.goto('/');

    const goToBlog = page.getByRole('button', { name: /Ver Todos os Artigos/i });
    await expect(goToBlog).toBeVisible();
    await goToBlog.click();

    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole('heading', { name: /Blog Técnico/i })).toBeVisible();
  });

  test('Blog: busca e clique em post (quando disponível)', async ({ page }) => {
    await page.goto('/blog');

    // Campo de busca reage à digitação
    const search = page.getByPlaceholder('Buscar artigos...');
    await expect(search).toBeVisible();
    await search.fill('vrf');
    await expect(search).toHaveValue('vrf');

    // Se houver posts, clicar no primeiro card (Link /blog/:slug)
    const postLinks = page.locator('a[href^="/blog/"]');
    const count = await postLinks.count();
    if (count > 0) {
      await postLinks.first().click();
      await expect(page).toHaveURL(/\/blog\//);

      // Verificar botões de navegação
      const voltarBtn = page.getByRole('button', { name: /Voltar ao blog/i });
      await expect(voltarBtn).toBeVisible();
      await voltarBtn.click();
      await expect(page).toHaveURL(/\/blog$/);
    } else {
      // Estado vazio em PT-BR
      await expect(
        page.getByText(/Nenhum artigo publicado ainda\.|Nenhum artigo encontrado com esses filtros\./)
      ).toBeVisible();
    }
  });
});


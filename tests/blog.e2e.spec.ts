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

  test('Blog: verifica meta tags SEO', async ({ page }) => {
    await page.goto('/blog');

    // Verifica meta tags básicas
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();

    // Verifica Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    expect(ogImage).toBeTruthy();

    // Verifica canonical URL
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('willrefrimix.com');
  });

  test('Blog: busca e clique em post (quando disponível)', async ({ page }) => {
    await page.goto('/blog');

    // Campo de busca reage à digitação
    const search = page.getByPlaceholder('Buscar artigos...');
    await expect(search).toBeVisible();
    await search.fill('vrf');
    
    // Aguarda debounce (300ms + buffer)
    await page.waitForTimeout(500);

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

  test('Blog: verifica otimização de imagens', async ({ page }) => {
    await page.goto('/blog');

    // Aguarda posts carregarem
    await page.waitForTimeout(1000);

    // Verifica se imagens tem lazy loading
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      const firstImg = images.first();
      const loading = await firstImg.getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  });

  test('Blog: verifica JSON-LD schema', async ({ page }) => {
    await page.goto('/blog');

    // Aguarda posts carregarem
    await page.waitForTimeout(1000);

    const postLinks = page.locator('a[href^="/blog/"]');
    const count = await postLinks.count();
    
    if (count > 0) {
      await postLinks.first().click();
      await expect(page).toHaveURL(/\/blog\//);

      // Verifica se há JSON-LD schema
      const schema = await page.locator('script[type="application/ld+json"]').textContent();
      expect(schema).toBeTruthy();
      
      const schemaObj = JSON.parse(schema || '{}');
      expect(schemaObj['@context']).toBe('https://schema.org');
      expect(schemaObj['@graph']).toBeTruthy();
    }
  });
});


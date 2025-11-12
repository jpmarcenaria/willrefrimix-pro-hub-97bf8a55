# Blog: Modelo de Dados, Políticas e Guia de Uso

## Estrutura de Banco (atual)
- `public.posts`: título, slug, summary, body, featured_image_url, youtube_url, `tags TEXT[]`, status (`draft|published|scheduled`), `publish_at`, `author_id`, timestamps.
- `public.images`: galeria por post com `url`, `caption`, `display_order`.
- `public.comments`: comentários básicos vinculados a `auth.users`.
- `public.profiles`: perfil espelhado de `auth.users` via trigger.
- `public.user_roles`: papéis (`admin|editor|viewer`) para controles avançados.

## Políticas RLS (aplicadas na migração 20251112)
- Inserção/Atualização: qualquer usuário autenticado pode criar/alterar seus próprios posts (`author_id = auth.uid()`).
- Exclusão: autor ou admin.
- Leitura: todos podem ler publicados; autor, editor ou admin pode ler rascunhos.

Motivação: evitar bloqueios de criação em contas sem `user_roles`, corrigindo o erro “violates row-level security policy” ao clicar em “New Post”.

## Comparação com modelos comuns de blog
- Comum: `posts`, `tags`, tabela pivô `post_tags`, `categories`.
- Projeto atual: `tags TEXT[]` embutido simplifica e reduz junções; mantém boa performance com índice GIN.
- Recomendações:
  - Se for preciso filtrar por tags com alto cardinalidade/relacionamento, migrar para `tags` + `post_tags`.
  - Adicionar `slug UNIQUE INDEX` (já presente) e validações de tamanho mínimo em `title/body` via regras de app.
  - Considerar `status` + `publish_at` para agendamento; já implementado.
  - Se papéis forem críticos, popular `user_roles` via painel admin ou seeds controlados.

## Guia de Criação/Edição de Posts
1. Acesse `/admin/posts` e clique em “New Post”. Um rascunho é criado e você é redirecionado ao editor.
2. Preencha `Title` e `Body` (obrigatórios). `Slug` é gerado automaticamente no primeiro save, se vazio.
3. Opcional: `Summary`, upload de imagem destacada e galeria (armazenadas em bucket `blog-images`).
4. YouTube: cole um link válido (`https://www.youtube.com/watch?v=...` ou `https://youtu.be/...`). O vídeo é exibido responsivamente na página de post.
5. Status:
   - `draft`: não público; visível para autor/editor/admin.
   - `published`: público; ordenado por `publish_at` quando definido.
   - `scheduled`: define data/hora futura em `publish_at`.

## Testes
- Playwright configurado para Chromium, Firefox e WebKit.
- Testes mínimos em `tests/` cobrem redirecionamentos e fluxo de autenticação inicial.

## Melhorias Futuras
- Moderar comentários; notificações de novo comentário.
- Páginas de categoria e listagem por tag com paginação.
- Editor com preview Markdown em tempo real e contagem de palavras.
- Painel de papéis (`user_roles`) com promoção a editor e admin.


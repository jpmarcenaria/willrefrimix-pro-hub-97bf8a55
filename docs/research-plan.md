# Plano de Pesquisa: Fluxo de Posts, RLS e YouTube

Objetivo: consolidar e validar o fluxo completo de criação/edição de posts com Supabase (RLS por autoria), editor/admin na UI, e incorporação responsiva de vídeos YouTube, garantindo testes e documentação.

- Branch: `research/rls-auth-youtube-playwright-docs`
- Escopo: backend (RLS/policies), frontend admin (PostList/PostEditor), blog público (BlogPost), testes E2E (Playwright), documentação.

## Tarefas

1) Ajustar RLS por autoria em `posts`
- Critérios de aceitação:
  - Usuário autenticado consegue criar rascunho; `author_id = auth.uid()` é exigido em INSERT/UPDATE.
  - Autores conseguem editar/excluir próprios posts; admins conseguem excluir qualquer post.
  - Posts `published` são visíveis para todos; autores veem seus `draft/scheduled`.
- Estimativa: 2h
- Responsável: Assistente
- Dependências: Supabase SQL Editor ou CLI disponível no projeto.

2) Validações no PostEditor (slug e YouTube)
- Critérios de aceitação:
  - `slug` é gerado quando ausente e único.
  - `youtube_url` aceita formatos `youtube.com/watch?v=` e `youtu.be/` e rejeita inválidos.
  - Salvar exibe mensagens claras de sucesso/erro.
- Estimativa: 2h
- Responsável: Assistente
- Dependências: Client Supabase, hooks de autenticação.

3) Melhorar feedback ao criar rascunho via PostList
- Critérios de aceitação:
  - Erros RLS exibem mensagem específica e instrução para aplicar migração.
  - Redireciona para o editor ao sucesso.
- Estimativa: 1h
- Responsável: Assistente
- Dependências: Políticas RLS aplicadas.

4) Playwright multi-navegadores
- Critérios de aceitação:
  - Configuração roda em `chromium`, `firefox`, `webkit`.
  - Testes básicos de auth/admin executam em todos os navegadores.
- Estimativa: 1h
- Responsável: Assistente
- Dependências: Ambiente de testes instalado.

5) Documentação técnica do modelo e guia
- Critérios de aceitação:
  - Documento cobre tabelas principais, políticas RLS, fluxo de criação/edição, embed YouTube e próximos passos.
  - Linkado no README.
- Estimativa: 1h
- Responsável: Assistente
- Dependências: Código atualizado.

6) Testes adicionais recomendados (próxima iteração)
- Critérios de aceitação:
  - E2E cria/edita/exclui post como autor.
  - Verifica visualização pública de `published` e renderização do iframe YouTube.
- Estimativa: 3h
- Responsável: Assistente
- Dependências: Sessão autenticada de teste.

## Fluxo de Execução por Tarefa
- Desenvolvimento/implementação: aplicar alterações focadas e pequenas PRs.
- Revisão por pares: checklist de políticas RLS, validações UX e mensagens.
- Testes unitários/integração: E2E com Playwright em 3 navegadores.
- Documentação: atualizar `docs/*.md` e apontar mudanças no README.

## Commits e Versionamento
- Commits incrementais por tema usando Conventional Commits:
  - `feat(db): adjust RLS policies for posts authorship`
  - `feat(admin): validate YouTube URL, ensure slug, improve RLS error feedback`
  - `test(e2e): enable Chromium, Firefox and WebKit projects`
  - `docs: add blog data model and guide`
  - `docs(research): plan with tasks and acceptance criteria`

## Entregáveis
- Migração aplicada no Supabase.
- UI admin validada no preview (`/admin/posts`).
- Configuração de testes atualizada.
- Documentação técnica e plano publicados em `docs/`.


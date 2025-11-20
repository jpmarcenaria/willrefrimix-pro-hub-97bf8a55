-- Consolidação de RLS PT-BR para postagens, imagens, perfis e funções_de_usuário
-- Objetivo: leitura pública de publicados; autoria com CRUD próprio; editor/admin com edição global; admin gerencia papéis

-- Habilitar RLS (idempotente)
ALTER TABLE IF EXISTS public.postagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."funções_de_usuário" ENABLE ROW LEVEL SECURITY;

-- Funções auxiliares baseadas em "funções_de_usuário"
-- Assume que public.app_role existe com ('admin','editor','viewer')
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."funções_de_usuário" r
    WHERE r.id_do_usuario = _user_id AND r.papel = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.can_edit_content(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."funções_de_usuário" r
    WHERE r.id_do_usuario = _user_id AND r.papel IN ('admin','editor')
  )
$$;

-- Perfis
DROP POLICY IF EXISTS "Perfis visíveis por todos" ON public.perfis;
DROP POLICY IF EXISTS "Usuário atualiza próprio perfil" ON public.perfis;

CREATE POLICY "Perfis visíveis por todos"
  ON public.perfis FOR SELECT
  USING (true);

CREATE POLICY "Usuário atualiza próprio perfil"
  ON public.perfis FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Funções de usuário (papéis)
DROP POLICY IF EXISTS "Papéis visíveis para autenticados" ON public."funções_de_usuário";
DROP POLICY IF EXISTS "Admins podem inserir papéis" ON public."funções_de_usuário";
DROP POLICY IF EXISTS "Admins podem atualizar papéis" ON public."funções_de_usuário";
DROP POLICY IF EXISTS "Admins podem deletar papéis" ON public."funções_de_usuário";

CREATE POLICY "Papéis visíveis para autenticados"
  ON public."funções_de_usuário" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem inserir papéis"
  ON public."funções_de_usuário" FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar papéis"
  ON public."funções_de_usuário" FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar papéis"
  ON public."funções_de_usuário" FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Postagens
DROP POLICY IF EXISTS "Posts: published or author/editor can read" ON public.postagens;
DROP POLICY IF EXISTS "Posts: author can insert own" ON public.postagens;
DROP POLICY IF EXISTS "Posts: author can update own" ON public.postagens;
DROP POLICY IF EXISTS "Posts: editor/admin can update any" ON public.postagens;
DROP POLICY IF EXISTS "Posts: author or admin can delete" ON public.postagens;

CREATE POLICY "Posts: published or author/editor can read"
  ON public.postagens FOR SELECT
  USING (
    (status = 'published' AND (publicado_em IS NULL OR publicado_em <= now()))
    OR id_do_autor = auth.uid()
    OR public.can_edit_content(auth.uid())
  );

CREATE POLICY "Posts: author can insert own"
  ON public.postagens FOR INSERT
  TO authenticated
  WITH CHECK (id_do_autor = auth.uid());

CREATE POLICY "Posts: author can update own"
  ON public.postagens FOR UPDATE
  TO authenticated
  USING (id_do_autor = auth.uid());

CREATE POLICY "Posts: editor/admin can update any"
  ON public.postagens FOR UPDATE
  TO authenticated
  USING (public.can_edit_content(auth.uid()));

CREATE POLICY "Posts: author or admin can delete"
  ON public.postagens FOR DELETE
  TO authenticated
  USING (id_do_autor = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Imagens
DROP POLICY IF EXISTS "Images: readable when post published or author/editor" ON public.imagens;
DROP POLICY IF EXISTS "Images: author manages images of own posts (INSERT)" ON public.imagens;
DROP POLICY IF EXISTS "Images: author updates images of own posts (UPDATE)" ON public.imagens;
DROP POLICY IF EXISTS "Images: author deletes images of own posts (DELETE)" ON public.imagens;
DROP POLICY IF EXISTS "Images: editor/admin manage all" ON public.imagens;

CREATE POLICY "Images: readable when post published or author/editor"
  ON public.imagens FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.postagens p
      WHERE p.id = imagens.post_id
        AND (
          (p.status = 'published' AND (p.publicado_em IS NULL OR p.publicado_em <= now()))
          OR p.id_do_autor = auth.uid()
          OR public.can_edit_content(auth.uid())
        )
    )
  );

CREATE POLICY "Images: author manages images of own posts (INSERT)"
  ON public.imagens FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.postagens p
      WHERE p.id = imagens.post_id AND p.id_do_autor = auth.uid()
    )
  );

CREATE POLICY "Images: author updates images of own posts (UPDATE)"
  ON public.imagens FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.postagens p
      WHERE p.id = imagens.post_id AND p.id_do_autor = auth.uid()
    )
  );

CREATE POLICY "Images: author deletes images of own posts (DELETE)"
  ON public.imagens FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.postagens p
      WHERE p.id = imagens.post_id AND p.id_do_autor = auth.uid()
    )
  );

CREATE POLICY "Images: editor/admin manage all"
  ON public.imagens FOR ALL
  TO authenticated
  USING (public.can_edit_content(auth.uid()));

-- Índices para desempenho
CREATE INDEX IF NOT EXISTS idx_postagens_status ON public.postagens(status);
CREATE INDEX IF NOT EXISTS idx_postagens_publicado_em ON public.postagens(publicado_em);
CREATE INDEX IF NOT EXISTS idx_postagens_id_do_autor ON public.postagens(id_do_autor);
CREATE INDEX IF NOT EXISTS idx_imagens_post_id ON public.imagens(post_id);


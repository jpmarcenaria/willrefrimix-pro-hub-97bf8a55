# Guia Completo: Implementação Neon BD + Admin Login
## WillRefrimix Blog

### Admin Email Configurado:
- **Email:** jgipedro@gmail.com

---

## 1️⃣ Setup Neon BD (PostgreSQL Serverless)

### Passo 1: Criar Conta Neon
1. Acesse https://neon.tech
2. Clique em "Sign Up"
3. Autentique com GitHub (jpmarcenaria)
4. Crie um novo projeto chamado "willrefrimix-blog"
5. Selecione a região: "sa-east-1" (São Paulo)

### Passo 2: Obter Connection String
Copie a string de conexão no formato:
```
postgresql://user:password@neon-endpoint.neon.tech/willrefrimix_db?sslmode=require
```

---

## 2️⃣ Criar Tabelas no Neon

Execute o seguinte SQL na query tool do Neon:

```sql
-- Tabela de Admins
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  featured_image_url VARCHAR(500),
  category VARCHAR(100),
  tags TEXT[],
  meta_description VARCHAR(160),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_slug ON posts(slug);
```

---

## 3️⃣ Criar Admin Initial com Password Hash

### Gerar Hash da Senha:

Use Node.js:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('SuaSenhaSegura123!', 10, (err, hash) => console.log(hash));"
```

### Inserir Admin no Banco:

```sql
INSERT INTO admins (email, password_hash, name) VALUES (
  'jgipedro@gmail.com',
  '$2a$10$HASH_DA_SENHA_AQUI',
  'JP Marcenaria'
);
```

---

## 4️⃣ Configurar Variáveis de Ambiente

### Arquivo `.env.local`:
```env
# Neon Database
DATABASE_URL=postgresql://user:password@neon-endpoint.neon.tech/willrefrimix_db?sslmode=require

# JWT/Auth
JWT_SECRET=sua_chave_secreta_muito_segura_e_aleatoria_minimo_32_caracteres
JWT_EXPIRES_IN=7d

# API
VITE_API_URL=/.netlify/functions
VITE_APP_URL=https://blogwillrefrimix.netlify.app
```

### Arquivo `.env.production`:
```env
DATABASE_URL=postgresql://user:password@neon-endpoint.neon.tech/willrefrimix_db?sslmode=require
JWT_SECRET=sua_chave_secreta_em_producao
JWT_EXPIRES_IN=7d
VITE_API_URL=/.netlify/functions
VITE_APP_URL=https://blogwillrefrimix.netlify.app
```

---

## 5️⃣ Instalar Dependências

```bash
npm install pg bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

---

## 6️⃣ Arquivos de Código

### A. `src/lib/auth.ts` - Lógica de Autenticação
### B. `netlify/functions/login.ts` - API de Login
### C. `netlify/functions/verify-token.ts` - Verificação de Token
### D. `src/pages/AdminLogin.tsx` - Página de Login
### E. `src/components/ProtectedRoute.tsx` - Rota Protegida

---

## 7️⃣ Deploy no Netlify

1. Configure variáveis de ambiente no Netlify
2. Push do código para o repositório
3. Deploy automático será acionado
4. Teste em: https://blogwillrefrimix.netlify.app/admin-login

---

## 🔐 Fluxo de Login

1. Usuário acessa `/admin-login`
2. Digita email e senha
3. API valida credenciais no Neon
4. Se OK: Retorna JWT token
5. Frontend armazena token em localStorage
6. Redirecionado para `/admin/dashboard`
7. Rotas protegidas verificam token

---

## ✅ Checklist de Implementação

- [ ] Conta Neon criada
- [ ] Connection string obtida
- [ ] Tabelas criadas no banco
- [ ] Admin inicial inserido com password hash
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas
- [ ] Código de autenticação implementado
- [ ] Funções do Netlify criadas
- [ ] Rotas protegidas implementadas
- [ ] Página de login criada
- [ ] Testes de login realizados
- [ ] Deploy em produção

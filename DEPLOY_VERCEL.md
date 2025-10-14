# 🚀 Configuração da Vercel - Guia de Deploy

## 📋 Checklist de Variáveis de Ambiente

Configure estas variáveis no painel da Vercel (`Settings` → `Environment Variables`):

### ✅ Obrigatórias

```bash
# 1. URL da aplicação
NEXTAUTH_URL=https://seu-app.vercel.app
# ⚠️ Substitua "seu-app" pelo nome real do seu projeto na Vercel

# 2. Secret do NextAuth (gere um novo!)
NEXTAUTH_SECRET=cole-aqui-o-resultado-do-comando-abaixo
# Para gerar: openssl rand -base64 32

# 3. Database URL (PostgreSQL)
DATABASE_URL=postgresql://usuario:senha@host:5432/database?sslmode=require
```

### 📝 Opcionais (apenas se usar Google OAuth)

```bash
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

---

## 🔧 Como Configurar na Vercel

### Passo 1: Gerar o NEXTAUTH_SECRET

Execute no seu terminal local:

```bash
openssl rand -base64 32
```

Copie o resultado (será algo como: `Kp2s5v8y/B?E(H+MbQeThWmZq4t7w!z$`)

### Passo 2: Adicionar Variáveis na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Para cada variável:
   - Cole o **nome** (ex: `NEXTAUTH_URL`)
   - Cole o **valor** (ex: `https://meu-app.vercel.app`)
   - Selecione **Production**, **Preview** e **Development**
   - Clique em **Save**

### Passo 3: Redeployar

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Selecione **Redeploy**
4. Marque **Use existing Build Cache** (opcional)
5. Clique em **Redeploy**

---

## 🐛 Troubleshooting

### Erro: "Usuário não autenticado" (401)

**Sintomas:**

```
❌ Usuário não autenticado
🔑 Token decodificado: NÃO
🍪 Cookies recebidos: SIM
```

**Soluções:**

1. **Verificar NEXTAUTH_URL:**

   ```bash
   # Deve ser EXATAMENTE a URL da Vercel
   NEXTAUTH_URL=https://seu-app.vercel.app
   # ❌ ERRADO: http://seu-app.vercel.app (sem HTTPS)
   # ❌ ERRADO: https://seu-app.vercel.app/ (com / no final)
   ```

2. **Verificar NEXTAUTH_SECRET:**

   - Deve ser o MESMO em todas as variáveis (Production, Preview, Development)
   - Deve ter pelo menos 32 caracteres
   - NÃO pode ter espaços ou quebras de linha

3. **Limpar cookies e fazer login novamente:**

   - Abra DevTools (F12)
   - Application → Cookies → Delete All
   - Faça login novamente

4. **Verificar logs da Vercel:**
   ```
   Vercel Dashboard → Deployments → [último deploy] → Runtime Logs
   ```
   Procure por erros relacionados a JWT ou NextAuth

### Erro: "Database connection failed"

**Solução:**

- Certifique-se que `DATABASE_URL` tem `?sslmode=require` no final
- Verifique se o database está acessível publicamente
- Teste a conexão localmente com a mesma URL

### Erro: "Google OAuth não funciona"

**Solução:**

1. No Google Cloud Console, adicione a URL da Vercel nas "Authorized redirect URIs":

   ```
   https://seu-app.vercel.app/api/auth/callback/google
   ```

2. Adicione também em "Authorized JavaScript origins":
   ```
   https://seu-app.vercel.app
   ```

---

## 🎯 Exemplo Completo de Configuração

### Variáveis de Ambiente da Vercel:

| Nome              | Valor                                                 | Environments                     |
| ----------------- | ----------------------------------------------------- | -------------------------------- |
| `NEXTAUTH_URL`    | `https://meu-hub.vercel.app`                          | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `Kp2s5v8y/B?E(H+MbQeThWmZq4t7w!z$`                    | Production, Preview, Development |
| `DATABASE_URL`    | `postgresql://user:pass@host:5432/db?sslmode=require` | Production, Preview, Development |

---

## ✅ Checklist Final

Antes de fazer deploy, certifique-se:

- [ ] `NEXTAUTH_URL` está configurada com a URL da Vercel (com HTTPS)
- [ ] `NEXTAUTH_SECRET` tem pelo menos 32 caracteres
- [ ] `DATABASE_URL` está configurada e acessível
- [ ] Todas as variáveis têm os mesmos valores em Production, Preview e Development
- [ ] Fez redeploy após adicionar as variáveis
- [ ] Limpou os cookies do navegador e fez login novamente
- [ ] Verificou os Runtime Logs na Vercel

---

## 📞 Suporte

Se o problema persistir:

1. **Verifique os logs:**

   ```
   Vercel → Deployments → Runtime Logs
   ```

2. **Teste localmente com as mesmas variáveis:**

   ```bash
   # Adicione no .env.local
   NEXTAUTH_URL=https://seu-app.vercel.app
   NEXTAUTH_SECRET=mesmo-secret-da-vercel
   DATABASE_URL=mesma-url-da-vercel

   # Rode local
   npm run dev
   ```

3. **Compare os cookies:**
   - DevTools → Application → Cookies
   - Compare entre local (funcionando) e produção (não funcionando)
   - Os nomes dos cookies devem ser diferentes:
     - Local: `next-auth.session-token`
     - Produção: `__Secure-next-auth.session-token`

---

**Última atualização:** 14/10/2025

# 🔐 Sistema de Recuperação e Alteração de Senha

## ✅ O que foi implementado

### 1. **Recuperação de Senha (Esqueci minha senha)**
- ✅ Página `/auth/forgot-password` - Solicitar recuperação
- ✅ Página `/auth/reset-password?token=xxx` - Definir nova senha
- ✅ API `/api/auth/forgot-password` - Gera token e envia email
- ✅ API `/api/auth/reset-password` - Valida token e redefine senha

### 2. **Alteração de Senha (Usuário logado)**
- ✅ Seção em `/configuracoes` - Alterar senha com senha atual
- ✅ API `/api/auth/change-password` - Valida senha atual e atualiza

### 3. **Serviço de Email**
- ✅ Suporte para **Resend** (recomendado)
- ✅ Suporte para **Nodemailer/SMTP** (alternativa)
- ✅ Templates HTML responsivos e bonitos
- ✅ Email de recuperação de senha
- ✅ Email de confirmação de alteração

### 4. **Banco de Dados**
- ✅ Modelo `PasswordResetToken` no Prisma
- ✅ Tokens com expiração de 1 hora
- ✅ Tokens hasheados com SHA-256

---

## 🚀 Como Configurar

### Passo 1: Executar Migration

```bash
npx prisma generate
npx prisma db push
```

Ou se estiver usando migrations:
```bash
npx prisma migrate dev --name add_password_reset_tokens
```

### Passo 2: Configurar Envio de Email

Você tem **2 opções**:

#### Opção A: Resend (RECOMENDADO) ⭐

1. **Criar conta** em: https://resend.com/
2. **Obter API Key** no dashboard
3. **Adicionar no .env**:

```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="Meu Hub <noreply@seudominio.com>"
```

**Vantagens:**
- ✅ Grátis até 3.000 emails/mês
- ✅ Fácil de configurar
- ✅ Não precisa domínio próprio (pode usar @resend.dev)
- ✅ API moderna e confiável

#### Opção B: Gmail/SMTP

1. **Ativar "App Passwords"** no Gmail:
   - https://myaccount.google.com/apppasswords
   - Gerar senha de app

2. **Descomentar no `emailService.ts`**:
   - Linhas 68-95 (implementação Nodemailer)

3. **Instalar Nodemailer**:
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

4. **Adicionar no .env**:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu@gmail.com"
SMTP_PASSWORD="sua-senha-de-app"
EMAIL_FROM="Meu Hub <seu@gmail.com>"
```

---

## 📝 Como Usar

### 1. **Usuário Esqueceu a Senha**

1. Ir em `/auth/signin`
2. Clicar em "Esqueceu a senha?"
3. Digitar o email
4. Receber email com link
5. Clicar no link → `/auth/reset-password?token=xxx`
6. Definir nova senha
7. Login automático

**Fluxo Técnico:**
```
POST /api/auth/forgot-password
  → Valida email
  → Gera token (SHA-256)
  → Salva no banco (expira em 1h)
  → Envia email com link

GET /auth/reset-password?token=xxx
  → Exibe formulário de nova senha

POST /api/auth/reset-password
  → Valida token
  → Verifica expiração
  → Hasheia nova senha (bcrypt)
  → Atualiza usuário
  → Deleta token usado
  → Envia email de confirmação
```

### 2. **Usuário Logado Quer Trocar Senha**

1. Ir em `/configuracoes`
2. Seção "🔐 Alterar Senha" (só aparece para contas com senha)
3. Digitar senha atual
4. Digitar nova senha (2x)
5. Confirmar

**Fluxo Técnico:**
```
POST /api/auth/change-password
  → Verifica autenticação (JWT)
  → Valida senha atual (bcrypt.compare)
  → Valida nova senha (mín 6 caracteres)
  → Verifica se nova ≠ atual
  → Hasheia nova senha
  → Atualiza usuário
  → Envia email de confirmação
```

---

## 🔒 Segurança Implementada

### Tokens de Recuperação
- ✅ Hasheados com SHA-256 no banco
- ✅ Expiração de 1 hora
- ✅ Únicos por usuário (deleta anteriores)
- ✅ Deletados após uso
- ✅ Token original nunca salvo no banco

### Senhas
- ✅ Hasheadas com bcrypt (10 rounds)
- ✅ Mínimo 6 caracteres
- ✅ Nova senha ≠ senha atual
- ✅ Senha atual validada antes de trocar

### Privacidade
- ✅ Não revela se email existe ("Se o email estiver cadastrado...")
- ✅ Contas OAuth não podem trocar senha
- ✅ Logs de tentativas em console

### Rate Limiting (Recomendado)
- ⚠️ Implementar limitação de tentativas
- ⚠️ Usar middleware como `express-rate-limit`

---

## 🎨 UI/UX

### Página de Recuperação (`/auth/forgot-password`)
- 🎨 Design moderno com gradiente roxo
- ✅ Mensagem de sucesso verde
- ❌ Mensagem de erro vermelha
- 💡 Dica sobre expiração (1h)
- 🔗 Link para voltar ao login

### Página de Reset (`/auth/reset-password`)
- 🎨 Design consistente
- 👁️ Mostrar/ocultar senha
- 📊 Indicador de força da senha
- ✅ Redirecionamento automático para login
- 🔗 Validação de token na URL

### Configurações (`/configuracoes`)
- 🔐 Card "Alterar Senha" (apenas para contas com senha)
- 📝 Formulário com 3 campos
- ✅ Validação em tempo real
- 💬 Toast notifications

---

## 📧 Templates de Email

### Email de Recuperação
- 📬 Assunto: "🔐 Recuperação de Senha - Meu Hub"
- 🎨 HTML responsivo com gradiente
- 🔘 Botão grande e visível
- 📋 Link alternativo (texto plano)
- ⏰ Aviso de expiração (1h)
- 🛡️ Aviso de segurança

### Email de Confirmação
- 📬 Assunto: "✅ Senha Alterada - Meu Hub"
- 🎨 Design consistente
- 📅 Timestamp da alteração
- 🚨 Aviso de segurança (contatar suporte se não foi você)

---

## 🧪 Como Testar

### Teste Local (sem email)

1. **Desabilitar envio de email** (temporariamente):
   - Em `emailService.ts`, adicionar `return true;` no início das funções
   - Copiar o `resetToken` do console log

2. **Testar fluxo**:
   ```bash
   # Solicitar recuperação
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"teste@teste.com"}'
   
   # Verificar console para ver o token
   # Usar o token na URL: /auth/reset-password?token=XXXX
   ```

### Teste com Resend (grátis)

1. Criar conta em https://resend.com/
2. Usar domínio de teste `@resend.dev`
3. Configurar `RESEND_API_KEY`
4. Testar fluxo completo

---

## 🐛 Troubleshooting

### ❌ "Tabela password_reset_tokens não existe"
```bash
npx prisma db push
```

### ❌ "Erro ao enviar email"
- Verificar se `RESEND_API_KEY` está configurada
- Verificar logs no console
- Testar manualmente em https://resend.com/docs

### ❌ "Token inválido ou expirado"
- Token expira em 1 hora
- Token só pode ser usado 1 vez
- Gerar novo token

### ❌ "Senha atual incorreta"
- Usuário está usando senha errada
- Verificar se conta tem senha (pode ser OAuth)

---

## 📚 Próximas Melhorias

- [ ] Rate limiting (limitar tentativas)
- [ ] 2FA (autenticação de 2 fatores)
- [ ] Histórico de alterações de senha
- [ ] Notificação de login em novo dispositivo
- [ ] Senhas temporárias
- [ ] Requisitos de senha mais fortes
- [ ] Bloqueio de senhas comuns

---

## 🔗 Links Úteis

- **Resend Docs**: https://resend.com/docs
- **Nodemailer Docs**: https://nodemailer.com/
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://next-auth.js.org/

---

## ✅ Checklist de Deploy

- [ ] Configurar `RESEND_API_KEY` na Vercel
- [ ] Configurar `EMAIL_FROM` com domínio real
- [ ] Rodar migration no banco de produção
- [ ] Testar recuperação em produção
- [ ] Verificar emails não caem no spam
- [ ] Configurar DNS (SPF, DKIM) se usar domínio próprio
- [ ] Implementar rate limiting
- [ ] Monitorar logs de erro

---

**Sistema completo e pronto para produção!** 🎉

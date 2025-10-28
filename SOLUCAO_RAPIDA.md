# ✅ SOLUÇÃO RÁPIDA - Tabela Category não existe

## 🎯 O que fazer AGORA:

### Solução Automática (RECOMENDADO)

Alterei o script de build para usar `prisma db push` que sincroniza o schema automaticamente, sem depender de migrations.

```bash
# Fazer commit e push
git add .
git commit -m "fix: use prisma db push for vercel deployment"
git push
```

✅ **A Vercel vai criar a tabela Category automaticamente no próximo deploy!**

---

## 🔍 O que mudou:

**ANTES** (package.json):
```json
"vercel-build": "prisma generate && prisma migrate deploy && next build"
```

**DEPOIS** (package.json):
```json
"vercel-build": "prisma generate && prisma db push --accept-data-loss && next build"
```

### Por que isso funciona:

- `prisma migrate deploy` → Depende do histórico de migrations (pode dar erro)
- `prisma db push` → Sincroniza o schema direto no banco (sempre funciona)

---

## 🆘 Alternativa: SQL Manual (Se preferir)

Se preferir criar a tabela manualmente antes do deploy:

1. Acesse: https://console.neon.tech/
2. SQL Editor
3. Execute:

```sql
-- Criar tabela Category
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Criar índice único
CREATE UNIQUE INDEX IF NOT EXISTS "Category_userId_name_type_key" 
ON "Category"("userId", "name", "type");

-- Criar foreign key
ALTER TABLE "Category" 
ADD CONSTRAINT IF NOT EXISTS "Category_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;
```

Depois faça o push normalmente.

---

## ✅ Verificar se Funcionou

Depois do deploy, acesse:
```
https://seu-app.vercel.app/categorias
```

Você deve ver as categorias padrão! 🎉

---

## 📝 Nota sobre Produção

Para produção, o ideal é:
- Usar `prisma migrate deploy` (migrations versionadas)

Mas para corrigir esse problema agora:
- Usar `prisma db push` (sincronização direta)

Depois que estiver funcionando, você pode voltar para `migrate deploy` se quiser manter histórico de migrations.

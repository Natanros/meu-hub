#!/bin/bash

# 🚀 Script de Deploy e Correção - Meu Hub
# Execute: bash quick-fix.sh

echo "🚀 === CORREÇÃO DE AUTENTICAÇÃO === 🚀"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto!"
    exit 1
fi

echo "📦 Passo 1: Verificando dependências..."
if grep -q "@auth/prisma-adapter" package.json; then
    echo "⚠️  @auth/prisma-adapter encontrado no package.json"
    echo "   (Opcional) Remover com: npm uninstall @auth/prisma-adapter"
else
    echo "✅ package.json ok"
fi

echo ""
echo "🔍 Passo 2: Verificando arquivos modificados..."
git status --short

echo ""
echo "📝 Passo 3: Adicionando arquivos..."
git add .

echo ""
echo "💬 Passo 4: Fazendo commit..."
git commit -m "fix: remover conflito entre PrismaAdapter e JWT strategy

- Removido PrismaAdapter que conflitava com JWT strategy
- Melhorado sistema de logs de autenticação
- Adicionado endpoint /api/auth/debug para diagnóstico
- Configurado cookies corretamente para produção
- Documentação completa adicionada

Refs: CORRECAO_AUTENTICACAO.md, RESUMO_CORRECAO.md"

echo ""
echo "🚀 Passo 5: Fazendo push..."
git push

echo ""
echo "✅ === PUSH CONCLUÍDO === ✅"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  Aguarde o deploy na Vercel (1-2 minutos)"
echo "    → https://vercel.com/dashboard"
echo ""
echo "2️⃣  Configure as variáveis de ambiente (se ainda não fez):"
echo "    NEXTAUTH_URL=https://seu-app.vercel.app"
echo "    NEXTAUTH_SECRET=<gere com: openssl rand -base64 32>"
echo "    DATABASE_URL=postgresql://...?sslmode=require"
echo ""
echo "3️⃣  Limpe os cookies do navegador:"
echo "    F12 → Application → Cookies → Clear All"
echo ""
echo "4️⃣  Teste o diagnóstico:"
echo "    https://seu-app.vercel.app/api/auth/debug"
echo ""
echo "5️⃣  Faça login e teste!"
echo ""
echo "📚 Documentação completa em:"
echo "    - RESUMO_CORRECAO.md"
echo "    - CORRECAO_AUTENTICACAO.md"
echo "    - DEPLOY_VERCEL.md"
echo ""

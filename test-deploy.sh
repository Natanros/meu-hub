#!/bin/bash

# 🧪 Script de teste para verificar se o projeto está pronto para deploy

echo "🚀 Testando projeto para deploy no Vercel..."
echo ""

# Verificar se arquivo .env existe
if [ -f ".env" ]; then
    echo "✅ Arquivo .env encontrado"
else
    echo "⚠️  Arquivo .env não encontrado - criando .env.local para teste..."
    echo 'DATABASE_URL="file:./dev.db"' > .env.local
fi

# Testar build
echo ""
echo "🔨 Testando build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build realizado com sucesso!"
    echo ""
    echo "📋 Checklist para deploy:"
    echo "  ✅ Build funcionando"
    echo "  📝 Configure DATABASE_URL no Vercel Dashboard"
    echo "  📝 Configure OPENAI_API_KEY no Vercel Dashboard (opcional)"
    echo "  🚀 Faça o deploy!"
    echo ""
    echo "🔗 Links úteis:"
    echo "  • Neon Database: https://neon.tech"
    echo "  • Vercel Dashboard: https://vercel.com/dashboard"
    echo "  • Supabase: https://supabase.com"
else
    echo ""
    echo "❌ Erro no build. Verifique os logs acima."
fi

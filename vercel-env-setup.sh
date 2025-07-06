# Comandos para configurar variáveis de ambiente via Vercel CLI

# 1. Login no Vercel (se ainda não fez)
vercel login

# 2. Configurar DATABASE_URL
vercel env add DATABASE_URL

# 3. Configurar OPENAI_API_KEY (opcional)
vercel env add OPENAI_API_KEY

# 4. Redeploy
vercel --prod

# 🛠️ Configuração de Desenvolvimento

## Ambiente Local (SQLite)

Para desenvolvimento local, crie um arquivo `.env.local`:

```bash
# Banco local SQLite
DATABASE_URL="file:./dev.db"

# OpenAI (opcional)
OPENAI_API_KEY="sua_chave_aqui"
```

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev                 # Servidor de desenvolvimento
npm run db:migrate         # Executar migrations
npm run db:studio          # Abrir Prisma Studio

# Build e Deploy
npm run build              # Build para produção
npm run start              # Servidor de produção
npm run vercel-build       # Build para Vercel

# Database
npm run db:push            # Sync schema (desenvolvimento)
npm run db:reset           # Reset database
```

## Switching entre SQLite e PostgreSQL

### Para desenvolvimento (SQLite):

1. Use `.env.local` com `DATABASE_URL="file:./dev.db"`
2. Execute `npm run db:push` para sincronizar

### Para produção (PostgreSQL):

1. Use `.env` com URL PostgreSQL
2. Execute `npm run db:migrate` para aplicar migrations

## Estrutura do Schema

O schema atual está configurado para PostgreSQL em produção.
Para desenvolvimento local com SQLite, use o comando `db:push` em vez de migrations.

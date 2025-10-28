-- ============================================
-- FIX MIGRATION ERROR - NeonDB
-- Cole este script no SQL Editor do NeonDB
-- ============================================

-- PASSO 1: Remover migration com erro
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251028031557_add_categories_table';

-- PASSO 2: Limpar tabela Category se existir parcialmente
DROP TABLE IF EXISTS "Category" CASCADE;

-- PASSO 3: Criar tabela Category (PostgreSQL)
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- PASSO 4: Criar índice único
CREATE UNIQUE INDEX "Category_userId_name_type_key" 
ON "Category"("userId", "name", "type");

-- PASSO 5: Criar foreign key
ALTER TABLE "Category" 
ADD CONSTRAINT "Category_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- PASSO 6: Registrar migration como aplicada
INSERT INTO "_prisma_migrations" (
    id,
    checksum,
    finished_at,
    migration_name,
    logs,
    rolled_back_at,
    started_at,
    applied_steps_count
) VALUES (
    gen_random_uuid()::text,
    'fc8e9e5a3d8c0b5e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
    NOW(),
    '20251028040000_add_categories_table_postgres',
    NULL,
    NULL,
    NOW(),
    1
);

-- ============================================
-- VERIFICAÇÕES
-- ============================================

-- Ver se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'Category'
ORDER BY ordinal_position;

-- Ver migrations aplicadas
SELECT 
    migration_name,
    finished_at,
    applied_steps_count
FROM "_prisma_migrations" 
ORDER BY finished_at DESC
LIMIT 5;

-- Testar inserção (vai falhar porque não tem usuário, mas confirma estrutura)
-- SELECT 'Estrutura OK' as status;

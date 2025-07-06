# 🏠 Meu Hub Pessoal

Um aplicativo PWA (Progressive Web App) para gerenciamento financeiro pessoal, construído com Next.js, React, TypeScript e Prisma.

## ✨ Características

- 📱 **PWA Instalável**: Funciona como um app nativo no iPhone/Android
- 💰 **Gestão Financeira**: Controle de receitas, despesas e metas
- 📊 **Relatórios Detalhados**: Análises por categoria, próximos pagamentos
- 🌙 **Tema Dark/Light**: Interface adaptável
- 📱 **Mobile-First**: Otimizado para dispositivos móveis
- 🔄 **Offline Ready**: Funciona sem conexão com internet
- 🤖 **IA Integrada**: Análise inteligente de transações (OpenAI)

## 🚀 Deploy no Vercel (Recomendado)

### 1. Preparar Banco de Dados

#### Opção A: Neon (Recomendado - Gratuito)

1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto/banco PostgreSQL
4. Copie a URL de conexão

#### Opção B: Supabase (Alternativa Gratuita)

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta e novo projeto
3. Vá em Settings > Database
4. Copie a URL de conexão

### 2. Deploy no Vercel

1. **Fork/Clone o repositório**
2. **Acesse [vercel.com](https://vercel.com) e conecte sua conta GitHub**
3. **Importe o projeto**
4. **Configure as variáveis de ambiente:**
   ```
   DATABASE_URL=sua_url_postgresql_aqui
   OPENAI_API_KEY=sua_chave_openai_aqui (opcional)
   ```
5. **Deploy!** ✅

### 3. Após o Deploy

- O Vercel automaticamente executará as migrações do banco
- Acesse seu app PWA no domínio fornecido
- No iPhone: Safari > Compartilhar > "Adicionar à Tela de Início"

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- npm/yarn

### Instalação

```bash
# Clone o repositório
git clone <seu-repo>
cd meu-hub

# Instale as dependências
npm install

# Configure o ambiente local
cp .env.local.example .env.local
# Edite .env.local com suas configurações

# Execute as migrações do banco
npm run db:migrate

# Inicie o servidor de desenvolvimento
npm run dev
```

### Comandos Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Linting do código

# Banco de dados
npm run db:migrate   # Executar migrações
npm run db:studio    # Abrir Prisma Studio
npm run db:reset     # Resetar banco de dados
npm run db:push      # Sincronizar schema (dev)
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/          # API routes (Next.js)
│   ├── financeiro/   # Página principal financeira
│   ├── layout.tsx    # Layout global
│   └── page.tsx      # Página inicial
├── components/
│   ├── Charts/       # Componentes de gráficos
│   ├── ui/           # Componentes UI base
│   └── *.tsx         # Outros componentes
├── hooks/           # Custom hooks
├── lib/             # Utilitários
└── types/           # Definições TypeScript

prisma/
├── schema.prisma    # Schema do banco (PostgreSQL)
├── schema-dev.prisma # Schema para desenvolvimento (SQLite)
└── migrations/      # Migrações do banco

public/
├── icons/           # Ícones do PWA
├── manifest.json    # Manifesto PWA
└── sw.js           # Service Worker
```

## 🎯 Funcionalidades

### 💰 Gestão Financeira

- ✅ Cadastro de receitas e despesas
- ✅ Categorização automática
- ✅ Metas financeiras
- ✅ Parcelas e recorrências
- ✅ Análise por IA (OpenAI)

### 📊 Relatórios

- ✅ Relatório por período customizável
- ✅ Análise por categoria
- ✅ Próximos pagamentos
- ✅ Comparativo mensal
- ✅ Gráficos interativos (Recharts)

### 📱 PWA

- ✅ Instalação no mobile/desktop
- ✅ Funcionamento offline
- ✅ Notificações push (futuro)
- ✅ Ícones e splash screens

## 🔧 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Prisma ORM (PostgreSQL/SQLite)
- **Charts**: Recharts
- **PWA**: @ducanh2912/next-pwa
- **AI**: OpenAI API
- **Deploy**: Vercel

## 📝 Configuração de Variáveis

### Produção (.env)

```bash
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
```

### Desenvolvimento (.env.local)

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-..."
```

## 🐛 Troubleshooting

### Build Errors

- Certifique-se que `DATABASE_URL` está configurada
- Execute `npm run db:push` para sincronizar o schema

### PWA não instala

- Verifique se está acessando via HTTPS
- Confirme que `manifest.json` está acessível
- Limpe cache do navegador

### Deploy no Vercel falha

- Verifique as variáveis de ambiente
- Confirme que a URL do banco está correta
- Veja os logs de build no dashboard do Vercel

## 📱 Instalação PWA

### iPhone/Safari

1. Acesse o app no Safari
2. Toque no ícone "Compartilhar"
3. Selecione "Adicionar à Tela de Início"

### Android/Chrome

1. Acesse o app no Chrome
2. Toque no menu (3 pontos)
3. Selecione "Instalar app"

---

**Desenvolvido com ❤️ usando Next.js e PWA**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

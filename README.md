# 💰 Meu Hub - Gestão Financeira Pessoal

Sistema completo de gestão financeira pessoal com interface moderna e relatórios detalhados.

## 🎯 Objetivo

Proporcionar uma plataforma integrada para controle financeiro pessoal, permitindo que usuários gerenciem suas receitas, despesas, orçamentos e metas de forma simples e eficiente.

## ✨ Funcionalidades Principais

### 📊 **Dashboard**

- Visão geral das finanças em tempo real
- Cartões de resumo com saldo, receitas e despesas
- Transações recentes
- Acesso rápido às principais funcionalidades

### 💸 **Centro Financeiro**

- Cadastro de transações (receitas e despesas)
- Entrada por voz com processamento de texto
- Transações parceladas e recorrentes
- Categorização por tipo
- Exportação de dados (CSV, JSON, PDF)
- Relatórios financeiros detalhados
- Dashboard de pagamentos futuros

### 🎯 **Orçamentos**

- Definição de limites por categoria
- Acompanhamento em tempo real
- Alertas de gastos
- Visualização de progresso

### 🏁 **Metas Financeiras**

- Criação de objetivos financeiros
- Vinculação de transações às metas
- Acompanhamento de progresso
- Estatísticas de metas atingidas

### 📈 **Analytics & Relatórios**

- Gráficos interativos (barras, linha, pizza)
- Análises por período (mensal, semanal, anual)
- Relatórios personalizados
- Sistema de alertas e notificações
- Backup e restauração de dados

### ⚙️ **Configurações**

- Gerenciamento de perfil
- Segurança da conta
- Preferências do sistema

## 🛠️ Tecnologias

### **Frontend**

- **Next.js 15** - Framework React com SSR
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização moderna
- **shadcn/ui** - Componentes UI

### **Backend**

- **Next.js API Routes** - Endpoints serverless
- **Prisma ORM** - Gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional

### **Autenticação**

- **NextAuth.js v5** - Autenticação completa
- Login com Google OAuth
- Login com email/senha

### **Deploy**

- **Vercel** - Hospedagem e CI/CD
- **Edge Runtime** - Performance otimizada

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- PostgreSQL (ou URL de conexão)
- npm ou yarn

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/Natanros/meu-hub.git
cd meu-hub
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/meuhub"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"
GOOGLE_CLIENT_ID="seu-client-id"
GOOGLE_CLIENT_SECRET="seu-client-secret"
```

4. **Execute as migrações do banco**

```bash
npx prisma migrate dev
```

5. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

6. **Acesse a aplicação**

```
http://localhost:3000
```

## 📦 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linter
npx prisma studio    # Abre interface visual do banco
```

## 🗄️ Estrutura do Banco de Dados

### **Principais Modelos**

- `User` - Usuários e autenticação
- `Transaction` - Transações financeiras
- `Meta` - Metas financeiras
- `Budget` - Orçamentos por categoria
- `Account` / `Session` - Autenticação NextAuth

## 🔐 Segurança

- ✅ Autenticação JWT via NextAuth
- ✅ Proteção de rotas com middleware
- ✅ Validação de dados no servidor
- ✅ SQL injection protection (Prisma)
- ✅ HTTPS obrigatório em produção
- ✅ Rate limiting em APIs sensíveis

## 📱 Progressive Web App (PWA)

- ✅ Instalável em dispositivos móveis
- ✅ Funciona offline (cache estratégico)
- ✅ Notificações push (futuro)
- ✅ Interface responsiva mobile-first

## 🎨 Design

- Interface moderna e minimalista
- Dark mode nativo
- Responsivo para mobile, tablet e desktop
- Animações suaves e transições
- Acessibilidade (WCAG)

## 📊 Roadmap

- [ ] Integração com bancos (Open Banking)
- [ ] Exportação de relatórios em PDF
- [ ] Compartilhamento de orçamentos familiares
- [ ] Machine Learning para previsões
- [ ] Aplicativo mobile nativo
- [ ] Multi-idiomas (i18n)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Nataniel**

- GitHub: [@Natanros](https://github.com/Natanros)

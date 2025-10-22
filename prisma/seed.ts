import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Lista de todas as conquistas disponíveis no sistema
const achievements = [
  // Conquistas de Orçamento
  {
    key: "BUDGET_BEGINNER",
    name: "Orçamentista Iniciante",
    description: "Crie seu primeiro orçamento mensal para qualquer categoria.",
    icon: "🌱",
  },
  {
    key: "BUDGET_MASTER",
    name: "Mestre do Orçamento",
    description:
      "Fique abaixo do orçamento em todas as categorias em um único mês.",
    icon: "🏆",
  },
  // Conquistas de Metas
  {
    key: "GOAL_SETTER",
    name: "Planejador de Metas",
    description: "Crie sua primeira meta financeira.",
    icon: "🎯",
  },
  {
    key: "GOAL_ACHIEVER",
    name: "Realizador de Sonhos",
    description: "Complete 100% de uma meta financeira.",
    icon: "⭐",
  },
  // Conquistas de Consistência
  {
    key: "STREAK_7_DAYS",
    name: "Hábito Financeiro",
    description: "Registre transações por 7 dias consecutivos.",
    icon: "🔥",
  },
  {
    key: "STREAK_30_DAYS",
    name: "Disciplina de Aço",
    description: "Registre transações por 30 dias consecutivos.",
    icon: "💪",
  },
  // Conquistas de Cadastro
  {
    key: "FIRST_TRANSACTION",
    name: "Primeiro Passo",
    description: "Cadastre sua primeira transação.",
    icon: "👟",
  },
  {
    key: "FIFTY_TRANSACTIONS",
    name: "Registrador Ativo",
    description: "Cadastre 50 transações no total.",
    icon: "✍️",
  },
];

async function main() {
  console.log("Iniciando o seeding de conquistas...");
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: achievement,
    });
  }
  console.log("Seeding de conquistas concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

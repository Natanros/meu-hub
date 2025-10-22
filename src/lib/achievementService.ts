import { prisma } from "./prisma";

type AchievementCheckEvent =
  | { type: "TRANSACTION_CREATED"; userId: string }
  | { type: "BUDGET_CREATED"; userId: string }
  | { type: "GOAL_CREATED"; userId: string }
  | { type: "GOAL_COMPLETED"; userId: string; metaId: string }
  | { type: "BUDGET_CHECK"; userId: string; year: number; month: number };

type AchievementData = {
  metaId?: string;
  year?: number;
  month?: number;
};

type NewAchievement = {
  name: string;
  description: string;
  icon: string;
};

// Mapeia a chave da conquista para sua função de verificação
const achievementCheckers: {
  [key: string]: (userId: string, data?: AchievementData) => Promise<boolean>;
} = {
  FIRST_TRANSACTION: async (userId) => {
    const count = await prisma.transaction.count({ where: { userId } });
    return count === 1;
  },
  FIFTY_TRANSACTIONS: async (userId) => {
    const count = await prisma.transaction.count({ where: { userId } });
    return count >= 50;
  },
  GOAL_SETTER: async (userId) => {
    const count = await prisma.meta.count({ where: { userId } });
    return count === 1;
  },
  BUDGET_BEGINNER: async (userId) => {
    const count = await prisma.budget.count({ where: { userId } });
    return count === 1;
  },
  // Adicione mais checkers aqui...
};

/**
 * Concede uma conquista a um usuário se ele ainda não a tiver.
 * @param userId - O ID do usuário.
 * @param achievementKey - A chave da conquista (ex: 'FIRST_TRANSACTION').
 * @returns A nova conquista concedida ou null se já a possuía.
 */
async function awardAchievement(
  userId: string,
  achievementKey: string
): Promise<NewAchievement | null> {
  const achievement = await prisma.achievement.findUnique({
    where: { key: achievementKey },
  });
  if (!achievement) {
    console.warn(`Conquista com a chave "${achievementKey}" não encontrada.`);
    return null;
  }

  const existingUnlock = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });

  if (existingUnlock) {
    return null; // Usuário já possui esta conquista
  }

  await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: achievement.id,
    },
  });

  console.log(`Usuário ${userId} desbloqueou a conquista: ${achievement.name}`);
  return {
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
  };
}

/**
 * Verifica e concede conquistas com base em um evento.
 * @param event - O evento que acionou a verificação.
 * @returns Um array de novas conquistas desbloqueadas.
 */
export async function checkAndAwardAchievements(
  event: AchievementCheckEvent
): Promise<NewAchievement[]> {
  const { userId } = event;
  const newAchievements: NewAchievement[] = [];

  const checksToRun: {
    [key: string]: (data?: AchievementData) => Promise<boolean>;
  } = {};

  // Mapeia eventos para as verificações de conquista correspondentes
  switch (event.type) {
    case "TRANSACTION_CREATED":
      checksToRun["FIRST_TRANSACTION"] = (data) =>
        achievementCheckers.FIRST_TRANSACTION(userId, data);
      checksToRun["FIFTY_TRANSACTIONS"] = (data) =>
        achievementCheckers.FIFTY_TRANSACTIONS(userId, data);
      // Adicionar verificação de streak aqui no futuro
      break;
    case "BUDGET_CREATED":
      checksToRun["BUDGET_BEGINNER"] = (data) =>
        achievementCheckers.BUDGET_BEGINNER(userId, data);
      break;
    case "GOAL_CREATED":
      checksToRun["GOAL_SETTER"] = (data) =>
        achievementCheckers.GOAL_SETTER(userId, data);
      break;
    // Adicionar mais casos de evento aqui
  }

  for (const key in checksToRun) {
    const checker = checksToRun[key];
    try {
      if (
        await checker(
          event.type === "GOAL_COMPLETED" ? { metaId: event.metaId } : {}
        )
      ) {
        const newAchievement = await awardAchievement(userId, key);
        if (newAchievement) {
          newAchievements.push(newAchievement);
        }
      }
    } catch (error) {
      console.error(`Erro ao verificar a conquista ${key}:`, error);
    }
  }

  return newAchievements;
}

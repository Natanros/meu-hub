import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca todas as conquistas disponíveis no sistema
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Busca as conquistas que o usuário já desbloqueou
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      select: { achievementId: true, unlockedAt: true },
    });

    // Mapeia os IDs das conquistas desbloqueadas para fácil acesso
    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
    );

    // Combina os dados para retornar uma lista completa
    const result = allAchievements.map((ach) => ({
      ...ach,
      unlocked: unlockedMap.has(ach.id),
      unlockedAt: unlockedMap.get(ach.id) || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar conquistas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

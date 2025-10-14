import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/auth-helper";
import { checkAndAwardAchievements } from "../../../lib/achievementService";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API Metas GET - Iniciando...");

    const user = await getAuthenticatedUser(request);

    if (!user) {
      console.log("❌ Usuário não autorizado para buscar metas");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log("✅ Usuário autorizado para buscar metas:", user.id);

    const metas = await prisma.meta.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    console.log("📊 Metas encontradas:", metas.length);
    return NextResponse.json(metas);
  } catch (error) {
    console.error("💥 Erro ao buscar metas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 API Metas POST - Iniciando...");

    const user = await getAuthenticatedUser(request);

    if (!user) {
      console.log("❌ Usuário não autorizado para criar meta");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log("✅ Usuário autorizado para criar meta:", user.id);

    const body = await request.json();
    const { nome, valor } = body;

    if (!nome || !valor) {
      return NextResponse.json(
        { error: "Nome e valor são obrigatórios" },
        { status: 400 }
      );
    }

    const meta = await prisma.meta.create({
      data: {
        nome,
        valor: Number(valor),
        userId: user.id, // Associar ao usuário logado
      },
    });

    console.log("✅ Meta criada:", meta.id);

    const newAchievements = await checkAndAwardAchievements({
      userId: user.id,
      type: "GOAL_CREATED",
    });

    return NextResponse.json({
      ...meta,
      newAchievements,
    });
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

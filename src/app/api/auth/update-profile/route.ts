import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { name } = await request.json();

    // Atualizar o usuário no banco de dados
    const updatedUser = await prisma.user.update({
      where: { email: token.email },
      data: { name },
      select: { id: true, name: true, email: true, image: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

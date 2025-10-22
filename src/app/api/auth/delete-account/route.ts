import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: token.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Excluir todas as transações do usuário
    await prisma.transaction.deleteMany({
      where: { userId: user.id },
    });

    // Excluir todas as metas do usuário
    await prisma.meta.deleteMany({
      where: { userId: user.id },
    });

    // Excluir todas as contas vinculadas
    await prisma.account.deleteMany({
      where: { userId: user.id },
    });

    // Excluir todas as sessões
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Excluir o usuário
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ message: "Conta excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

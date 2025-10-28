import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordChangedEmail } from "@/lib/emailService";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      );
    }

    // Validar nova senha
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Buscar usuário completo
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!fullUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem senha (pode ter sido cadastrado via OAuth)
    if (!fullUser.password) {
      return NextResponse.json(
        { error: "Esta conta foi criada via login social e não possui senha" },
        { status: 400 }
      );
    }

    // Verificar senha atual
    const isPasswordValid = await bcryptjs.compare(
      currentPassword,
      fullUser.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 400 }
      );
    }

    // Verificar se a nova senha é diferente da atual
    const isSamePassword = await bcryptjs.compare(
      newPassword,
      fullUser.password
    );
    if (isSamePassword) {
      return NextResponse.json(
        { error: "A nova senha deve ser diferente da senha atual" },
        { status: 400 }
      );
    }

    // Hashear nova senha
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id: fullUser.id },
      data: { password: hashedPassword },
    });

    // Enviar email de confirmação
    await sendPasswordChangedEmail(fullUser.email);

    return NextResponse.json({
      message: "Senha alterada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}

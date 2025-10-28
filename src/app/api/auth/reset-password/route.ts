import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordChangedEmail } from "@/lib/emailService";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar senha
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Hashear o token recebido para comparar com o banco
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Buscar token no banco
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!passwordResetToken) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Verificar se o token expirou
    if (passwordResetToken.expires < new Date()) {
      // Deletar token expirado
      await prisma.passwordResetToken.delete({
        where: { token: hashedToken },
      });

      return NextResponse.json(
        { error: "Token expirado. Solicite uma nova recuperação de senha." },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: passwordResetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Hashear nova senha
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Atualizar senha do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Deletar o token usado
    await prisma.passwordResetToken.delete({
      where: { token: hashedToken },
    });

    // Deletar todos os outros tokens do mesmo email (segurança)
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Enviar email de confirmação
    await sendPasswordChangedEmail(user.email);

    return NextResponse.json({
      message: "Senha alterada com sucesso! Você já pode fazer login.",
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}

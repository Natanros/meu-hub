import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/emailService";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Por segurança, sempre retornar sucesso mesmo se o email não existir
    // Isso evita que pessoas mal-intencionadas descubram quais emails estão cadastrados
    if (!user) {
      console.log(
        `Tentativa de recuperação para email não cadastrado: ${email}`
      );
      return NextResponse.json({
        message:
          "Se o email estiver cadastrado, você receberá as instruções de recuperação.",
      });
    }

    // Verificar se o usuário tem senha (pode ter sido cadastrado via OAuth)
    if (!user.password) {
      console.log(`Tentativa de recuperação para conta OAuth: ${email}`);
      return NextResponse.json({
        message:
          "Se o email estiver cadastrado, você receberá as instruções de recuperação.",
      });
    }

    // Gerar token único e seguro
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expira em 1 hora
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Deletar tokens antigos do mesmo email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Criar novo token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expires,
      },
    });

    // Enviar email com o token NÃO hasheado (o usuário precisa do token original)
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      console.error("Falha ao enviar email de recuperação");
      return NextResponse.json(
        { error: "Erro ao enviar email. Tente novamente mais tarde." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Se o email estiver cadastrado, você receberá as instruções de recuperação.",
    });
  } catch (error) {
    console.error("Erro ao processar recuperação de senha:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}

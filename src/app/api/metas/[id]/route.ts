import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/auth-helper";
import { prisma } from "../../../../lib/prisma";

// GET - Buscar uma meta específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const meta = await prisma.meta.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!meta) {
      return NextResponse.json(
        { error: "Meta não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(meta);
  } catch (error) {
    console.error("Erro ao buscar meta:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT - Atualizar uma meta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nome, valor } = body;

    if (!nome || !valor) {
      return NextResponse.json(
        { error: "Nome e valor são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a meta existe e pertence ao usuário
    const metaExistente = await prisma.meta.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!metaExistente) {
      return NextResponse.json(
        { error: "Meta não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar a meta
    const meta = await prisma.meta.update({
      where: { id },
      data: {
        nome,
        valor: Number(valor),
      },
    });

    return NextResponse.json(meta);
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE - Deletar uma meta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se a meta existe e pertence ao usuário
    const metaExistente = await prisma.meta.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!metaExistente) {
      return NextResponse.json(
        { error: "Meta não encontrada" },
        { status: 404 }
      );
    }

    // Deletar a meta
    await prisma.meta.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Meta deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar meta:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

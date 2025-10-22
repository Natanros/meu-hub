import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

// GET: Buscar orçamentos para um mês/ano específico
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json(
        { error: "Mês e ano são obrigatórios" },
        { status: 400 }
      );
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      },
      orderBy: {
        category: "asc",
      },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST: Criar ou atualizar um orçamento
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { category, amount, month, year } = await request.json();

    if (!category || amount === undefined || !month || !year) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber < 0) {
      return NextResponse.json(
        { error: "O valor do orçamento deve ser um número positivo." },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_year_month: {
          userId: user.id,
          category,
          year,
          month,
        },
      },
      update: {
        amount: amountNumber,
      },
      create: {
        userId: user.id,
        category,
        amount: amountNumber,
        month,
        year,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar/atualizar orçamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Remover um orçamento
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "O ID do orçamento é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o orçamento pertence ao usuário antes de deletar
    const budgetToDelete = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budgetToDelete || budgetToDelete.userId !== user.id) {
      return NextResponse.json(
        { error: "Orçamento não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Orçamento removido com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao remover orçamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

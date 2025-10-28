import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

// GET - Buscar todas as categorias do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar categorias do usuário
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: "desc" }, // Padrões primeiro
        { name: "asc" },
      ],
    });

    // Se o usuário não tem categorias, criar as padrões
    if (categories.length === 0) {
      const defaultExpenseCategories = [
        "Lazer",
        "Contas",
        "Saúde",
        "Transporte",
        "Mercado",
        "Cartão",
      ];

      const defaultIncomeCategories = [
        "Salário",
        "Freelance",
        "Investimentos",
        "Outros",
      ];

      const categoriesToCreate = [
        ...defaultExpenseCategories.map((name) => ({
          name,
          type: "expense",
          isDefault: true,
          userId: user.id,
        })),
        ...defaultIncomeCategories.map((name) => ({
          name,
          type: "income",
          isDefault: true,
          userId: user.id,
        })),
      ];

      await prisma.category.createMany({
        data: categoriesToCreate,
      });

      // Buscar novamente após criar
      const newCategories = await prisma.category.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      });

      return NextResponse.json(newCategories);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro ao buscar categorias" },
      { status: 500 }
    );
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Nome e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: 'Tipo deve ser "income" ou "expense"' },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const existing = await prisma.category.findUnique({
      where: {
        userId_name_type: {
          userId: user.id,
          name: name,
          type: type,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Categoria já existe" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId: user.id,
        isDefault: false,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir categoria (apenas customizadas)
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
        { error: "ID da categoria é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar categoria
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    if (category.userId !== user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    if (category.isDefault) {
      return NextResponse.json(
        { error: "Categorias padrão não podem ser excluídas" },
        { status: 400 }
      );
    }

    // Verificar se há transações usando esta categoria
    const transactionsCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        category: category.name,
      },
    });

    if (transactionsCount > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir. Existem ${transactionsCount} transação(ões) usando esta categoria.`,
        },
        { status: 400 }
      );
    }

    // Verificar se há orçamentos usando esta categoria
    const budgetsCount = await prisma.budget.count({
      where: {
        userId: user.id,
        category: category.name,
      },
    });

    if (budgetsCount > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir. Existem ${budgetsCount} orçamento(s) usando esta categoria.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Categoria excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 }
    );
  }
}

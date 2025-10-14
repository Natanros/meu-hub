import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "../../../lib/auth-helper";
import { checkAndAwardAchievements } from "../../../lib/achievementService";
import { prisma } from "../../../lib/prisma";

// GET → Listar todas do usuário logado
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API Transactions GET - Iniciando...");

    const user = await getAuthenticatedUser(request);

    if (!user) {
      console.log("❌ Usuário não autorizado");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log("✅ Usuário autorizado:", user.id);

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    console.log("📊 Transações encontradas:", transactions.length);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("💥 Erro ao buscar transações:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST → Criar transação para o usuário logado
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 API Transactions POST - Iniciando...");

    const user = await getAuthenticatedUser(request);

    if (!user) {
      console.log("❌ Usuário não autorizado para criar transação");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log("✅ Usuário autorizado para criar transação:", user.id);

    const body = await request.json();
    const {
      type,
      category,
      amount,
      description,
      date,
      metaId,
      installments,
      recurrence,
      recurrenceCount,
    } = body;

    const transactionDate = new Date(date);
    const installmentCount = installments ? Number(installments) : 1;

    // Se é parcelado, criar múltiplas transações
    if (installmentCount > 1) {
      console.log(`💳 Criando ${installmentCount} parcelas...`);

      const transactions = [];
      // Calcular valores com arredondamento estável (duas casas) e ajustar última parcela
      const baseAmount = Math.floor((amount / installmentCount) * 100) / 100; // arredonda para baixo
      const amounts: number[] = Array(installmentCount).fill(baseAmount);
      const sumBase = baseAmount * (installmentCount - 1);
      amounts[installmentCount - 1] = Number((amount - sumBase).toFixed(2));

      // Função utilitária: manter o "mesmo dia" de referência, ajustando para o último dia disponível do mês
      const originalDay = transactionDate.getDate();
      const computeInstallmentDate = (base: Date, monthsToAdd: number) => {
        // CORREÇÃO: A primeira parcela deve começar no próximo mês
        const targetMonth = base.getMonth() + monthsToAdd + 1;
        const y = base.getFullYear();
        const m = targetMonth % 12;
        const yearOffset = Math.floor(targetMonth / 12);

        const newDate = new Date(y + yearOffset, m, originalDay);

        // Se o dia não existir no mês (ex: dia 31 em fevereiro), usar o último dia do mês
        if (newDate.getMonth() !== m) {
          return new Date(y + yearOffset, m + 1, 0);
        }
        return newDate;
      };

      for (let i = 0; i < installmentCount; i++) {
        const installmentDate = computeInstallmentDate(transactionDate, i);

        const transaction = await prisma.transaction.create({
          data: {
            type,
            category,
            amount: amounts[i],
            description: `${description} (${i + 1}/${installmentCount})`,
            date: installmentDate,
            metaId: metaId || null,
            installments: installmentCount,
            recurrence: recurrence || null,
            recurrenceCount: recurrenceCount ? Number(recurrenceCount) : null,
            userId: user.id,
          },
        });

        transactions.push(transaction);
        console.log(
          `✅ Parcela ${i + 1}/${installmentCount} criada:`,

          transaction.id
        );
      }

      console.log(
        `🎉 Todas as ${installmentCount} parcelas criadas com sucesso!`
      );

      const newAchievements = await checkAndAwardAchievements({
        userId: user.id,
        type: "TRANSACTION_CREATED",
      });

      return NextResponse.json({
        success: true,
        message: `${installmentCount} parcelas criadas`,
        transactions,
        totalAmount: amount,
        newAchievements,
      });
    } else {
      // Transação única (não parcelada)
      const transaction = await prisma.transaction.create({
        data: {
          type,
          category,
          amount,
          description,
          date: transactionDate,
          metaId: metaId || null,
          installments: null,
          recurrence: recurrence || null,
          recurrenceCount: recurrenceCount ? Number(recurrenceCount) : null,
          userId: user.id,
        },
      });

      console.log("✅ Transação única criada:", transaction.id);

      const newAchievements = await checkAndAwardAchievements({
        userId: user.id,
        type: "TRANSACTION_CREATED",
      });

      return NextResponse.json({
        ...transaction,
        newAchievements,
      });
    }
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

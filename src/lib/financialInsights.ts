<<<<<<< HEAD
// src/lib/financialInsights.ts
import { Transaction } from "@prisma/client";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";
import { prisma } from "./prisma";

export interface Insight {
  type: "info" | "warning" | "success";
  title: string;
  message: string;
  icon: string;
}

type CategorySpending = {
  [category: string]: number;
};

// Função auxiliar para calcular gastos por categoria
function calculateSpendingByCategory(
  transactions: Transaction[]
): CategorySpending {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as CategorySpending);
}

/**
 * Analisa os gastos por categoria, comparando o mês atual com o anterior.
 */
export async function analyzeCategorySpending(
  userId: string
): Promise<Insight[]> {
  const insights: Insight[] = [];
  const now = new Date();

  // Período do Mês Atual
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  // Período do Mês Anterior
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  // Buscar transações dos dois períodos
  const [currentMonthTransactions, previousMonthTransactions] =
    await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          type: "expense",
          date: { gte: currentMonthStart, lte: currentMonthEnd },
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: "expense",
          date: { gte: previousMonthStart, lte: previousMonthEnd },
        },
      }),
    ]);

  const currentSpending = calculateSpendingByCategory(currentMonthTransactions);
  const previousSpending = calculateSpendingByCategory(
    previousMonthTransactions
  );

  // Comparar gastos
  for (const category in currentSpending) {
    const currentAmount = currentSpending[category];
    const previousAmount = previousSpending[category] || 0;

    if (previousAmount > 0) {
      const percentageChange =
        ((currentAmount - previousAmount) / previousAmount) * 100;

      if (percentageChange > 20) {
        // Aumento significativo
        insights.push({
          type: "warning",
          title: `Aumento em ${category}`,
          message: `Seus gastos com ${category} aumentaram ${percentageChange.toFixed(
            0
          )}% este mês (R$ ${currentAmount.toFixed(
            2
          )}) em comparação com o mês anterior (R$ ${previousAmount.toFixed(
            2
          )}).`,
          icon: "📈",
        });
      } else if (percentageChange < -20) {
        // Redução significativa
        insights.push({
          type: "success",
          title: `Redução em ${category}`,
          message: `Ótimo! Seus gastos com ${category} diminuíram ${Math.abs(
            percentageChange
          ).toFixed(0)}% este mês (R$ ${currentAmount.toFixed(
            2
          )}) em comparação com o mês anterior (R$ ${previousAmount.toFixed(
            2
          )}).`,
          icon: "📉",
        });
      }
    } else if (currentAmount > 0) {
      // Nova categoria de gasto
      insights.push({
        type: "info",
        title: `Novo Gasto em ${category}`,
        message: `Este mês você começou a gastar com ${category}, totalizando R$ ${currentAmount.toFixed(
          2
        )}.`,
        icon: "💡",
      });
    }
  }

  if (insights.length === 0 && currentMonthTransactions.length > 5) {
    insights.push({
      type: "info",
      title: "Gastos Estáveis",
      message:
        "Seus padrões de gastos por categoria estão consistentes com o mês anterior. Bom controle!",
      icon: "📊",
    });
  }

  return insights;
}

// Função principal que agrega todas as análises
export async function generateAllInsights(userId: string): Promise<Insight[]> {
  const spendingInsights = await analyzeCategorySpending(userId);
  // Futuramente, outras análises podem ser adicionadas aqui:
  // const subscriptionInsights = await analyzeSubscriptions(userId);
  // return [...spendingInsights, ...subscriptionInsights];

  return spendingInsights;
}
=======
// src/lib/financialInsights.ts
import { Transaction } from "@prisma/client";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";
import { prisma } from "./prisma";
import { Insight } from "@/types/insight";

type CategorySpending = {
  [category: string]: number;
};

// Função auxiliar para calcular gastos por categoria
function calculateSpendingByCategory(
  transactions: Transaction[]
): CategorySpending {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as CategorySpending);
}

/**
 * Analisa os gastos por categoria, comparando o mês atual com o anterior.
 */
export async function analyzeCategorySpending(
  userId: string
): Promise<Insight[]> {
  const insights: Insight[] = [];
  const now = new Date();

  // Período do Mês Atual
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  // Período do Mês Anterior
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  // Buscar transações dos dois períodos
  const [currentMonthTransactions, previousMonthTransactions] =
    await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          type: "expense",
          date: { gte: currentMonthStart, lte: currentMonthEnd },
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: "expense",
          date: { gte: previousMonthStart, lte: previousMonthEnd },
        },
      }),
    ]);

  const currentSpending = calculateSpendingByCategory(currentMonthTransactions);
  const previousSpending = calculateSpendingByCategory(
    previousMonthTransactions
  );

  // Comparar gastos
  for (const category in currentSpending) {
    const currentAmount = currentSpending[category];
    const previousAmount = previousSpending[category] || 0;

    if (previousAmount > 0) {
      const percentageChange =
        ((currentAmount - previousAmount) / previousAmount) * 100;

      if (percentageChange > 20) {
        // Aumento significativo
        insights.push({
          type: "warning",
          title: `Aumento em ${category}`,
          message: `Seus gastos com ${category} aumentaram ${percentageChange.toFixed(
            0
          )}% este mês (R$ ${currentAmount.toFixed(
            2
          )}) em comparação com o mês anterior (R$ ${previousAmount.toFixed(
            2
          )}).`,
          icon: "📈",
        });
      } else if (percentageChange < -20) {
        // Redução significativa
        insights.push({
          type: "success",
          title: `Redução em ${category}`,
          message: `Ótimo! Seus gastos com ${category} diminuíram ${Math.abs(
            percentageChange
          ).toFixed(0)}% este mês (R$ ${currentAmount.toFixed(
            2
          )}) em comparação com o mês anterior (R$ ${previousAmount.toFixed(
            2
          )}).`,
          icon: "📉",
        });
      }
    } else if (currentAmount > 0) {
      // Nova categoria de gasto
      insights.push({
        type: "info",
        title: `Novo Gasto em ${category}`,
        message: `Este mês você começou a gastar com ${category}, totalizando R$ ${currentAmount.toFixed(
          2
        )}.`,
        icon: "💡",
      });
    }
  }

  if (insights.length === 0 && currentMonthTransactions.length > 5) {
    insights.push({
      type: "info",
      title: "Gastos Estáveis",
      message:
        "Seus padrões de gastos por categoria estão consistentes com o mês anterior. Bom controle!",
      icon: "📊",
    });
  }

  return insights;
}

// Função principal que agrega todas as análises
export async function generateAllInsights(userId: string): Promise<Insight[]> {
  const spendingInsights = await analyzeCategorySpending(userId);
  // Futuramente, outras análises podem ser adicionadas aqui:
  // const subscriptionInsights = await analyzeSubscriptions(userId);
  // return [...spendingInsights, ...subscriptionInsights];

  return spendingInsights;
}
>>>>>>> 0e0c660098934615f279dd59f7bb78e4b6549ea4

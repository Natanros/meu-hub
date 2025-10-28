// src/components/features/financial/FinancialSummaryCards.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FinancialSummary } from "@/hooks/useFinancialData";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialSummaryCardsProps {
  summary: FinancialSummary;
  loading: boolean;
}

const SummaryCard = ({
  title,
  value,
  icon,
  gradient,
  textColor,
}: {
  title: string;
  value: string;
  icon: string;
  gradient: string;
  textColor: string;
}) => (
  <Card
    className={`bg-gradient-to-r ${gradient} ${textColor} border-0 shadow-lg hover:shadow-xl transition-shadow`}
  >
    <CardContent className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium opacity-90 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{value}</p>
        </div>
        <div className="text-3xl sm:text-4xl ml-2 flex-shrink-0">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const LoadingSkeleton = () => (
  <Skeleton className="h-[88px] w-full rounded-lg" />
);

export function FinancialSummaryCards({
  summary,
  loading,
}: FinancialSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  const { saldo, totalReceitas, totalDespesas } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <SummaryCard
        title="Total Receitas"
        value={`R$ ${totalReceitas.toFixed(2)}`}
        icon="📈"
        gradient="from-green-500 to-green-600 dark:from-green-600 dark:to-green-700"
        textColor="text-white"
      />
      <SummaryCard
        title="Total Despesas"
        value={`R$ ${totalDespesas.toFixed(2)}`}
        icon="📉"
        gradient="from-red-500 to-red-600 dark:from-red-600 dark:to-red-700"
        textColor="text-white"
      />
      <SummaryCard
        title="Saldo Atual"
        value={`R$ ${saldo.toFixed(2)}`}
        icon={saldo >= 0 ? "💰" : "⚠️"}
        gradient={
          saldo >= 0
            ? "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
            : "from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700"
        }
        textColor="text-white"
      />
    </div>
  );
}

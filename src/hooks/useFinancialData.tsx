// src/hooks/useFinancialData.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Transaction } from "@/types/transaction";
import { Meta } from "@/types/meta";

export interface FinancialSummary {
  saldo: number;
  totalReceitas: number;
  totalDespesas: number;
}

export function useFinancialData() {
  const { status } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinancialData = useCallback(async () => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [transactionsResponse, metasResponse] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/metas"),
      ]);

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      } else {
        console.error("Falha ao buscar transações");
        setTransactions([]);
      }

      if (metasResponse.ok) {
        const metasData = await metasResponse.json();
        setMetas(metasData);
      } else {
        console.error("Falha ao buscar metas");
        setMetas([]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
      setTransactions([]);
      setMetas([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const summary: FinancialSummary = useMemo(() => {
    const totalReceitas = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalDespesas = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const saldo = totalReceitas - totalDespesas;

    return { saldo, totalReceitas, totalDespesas };
  }, [transactions]);

  return {
    transactions,
    metas,
    summary,
    loading,
    refreshData: fetchFinancialData,
  };
}

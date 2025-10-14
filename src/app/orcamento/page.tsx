'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BudgetManager } from '@/components/features/budgets/BudgetManager';
import { Transaction } from '@/types/transaction';
import { Loader2 } from 'lucide-react';

// Extrai categorias únicas das transações
const getUniqueCategories = (transactions: Transaction[]): string[] => {
    const expenseCategories = transactions
        .filter(t => t.type === 'expense')
        .map(t => t.category);
    return [...new Set(expenseCategories)].sort();
};

export default function OrcamentoPage() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchTransactions = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/transactions');
          if (!res.ok) throw new Error('Falha ao buscar transações');
          const data: Transaction[] = await res.json();
          setTransactions(data);
          setCategories(getUniqueCategories(data));
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTransactions();
    } else if (status === 'unauthenticated') {
        setIsLoading(false);
    }
  }, [status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p>Por favor, faça login para gerenciar seus orçamentos.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Meus Orçamentos</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Defina limites de gastos mensais para suas categorias e acompanhe seu progresso.
      </p>
      <BudgetManager transactions={transactions} categories={categories} />
    </div>
  );
}

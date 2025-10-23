'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BudgetManager } from '@/components/features/budgets/BudgetManager';
import { Transaction } from '@/types/transaction';
import { Loader2 } from 'lucide-react';
import UserHeader from '@/components/layout/UserHeader';
import ProtectedRoute from '@/components/features/auth/ProtectedRoute';

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
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <UserHeader />
          
          <div className="text-center py-8 sm:py-12 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-lg shadow-xl">
            <h1 className="text-3xl sm:text-5xl font-bold mb-3">💰 Orçamentos</h1>
            <p className="text-lg sm:text-xl text-purple-100 dark:text-purple-200">
              Defina limites e acompanhe seus gastos por categoria
            </p>
          </div>

          <BudgetManager transactions={transactions} categories={categories} />
        </div>
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BudgetManager } from '@/components/features/budgets/BudgetManager';
import { Transaction } from '@/types/transaction';
import { Loader2 } from 'lucide-react';
import UserHeader from '@/components/layout/UserHeader';
import ProtectedRoute from '@/components/features/auth/ProtectedRoute';

// Lista completa de categorias de despesas (independente de ter transações)
const getAllExpenseCategories = (): string[] => {
  return [
    'Alimentação',
    'Moradia', 
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Vestuário',
    'Tecnologia',
    'Mercado',
    'Restaurante',
    'Combustível',
    'Farmácia',
    'Shopping',
    'Conta de Luz',
    'Conta de Água',
    'Internet',
    'Telefone',
    'Outros'
  ].sort();
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
          setCategories(getAllExpenseCategories()); // ✅ Sempre mostra todas as categorias
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          <UserHeader />
          
          <div className="text-center py-6 sm:py-10 md:py-12 px-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-xl shadow-xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">💰 Orçamentos</h1>
            <p className="text-sm sm:text-lg md:text-xl text-purple-100 dark:text-purple-200">
              Defina limites e acompanhe seus gastos
            </p>
          </div>

          <BudgetManager transactions={transactions} categories={categories} />
        </div>
      </div>
    </ProtectedRoute>
  );
}

/**
 * 📅 Upcoming Payments Dashboard
 * Dashboard específico para próximos pagamentos e planejamento financeiro
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Transaction, PaymentPeriod } from '@/types';
import { formatDateLocal } from '@/lib/dateUtils';

interface UpcomingPaymentsDashboardProps {
  transactions: Transaction[];
}

const UpcomingPaymentsDashboard: React.FC<UpcomingPaymentsDashboardProps> = ({ transactions }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('nextMonth');
  const [customDays, setCustomDays] = useState<number>(30);

  // Calcular dados do período selecionado
  const periodData = useMemo(() => {
    // Períodos pré-definidos (movidos para dentro do useMemo)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calcular o início da semana atual (domingo = 0, segunda = 1, etc)
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Volta para domingo
    
    // Calcular o fim da semana atual
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
    
    // Calcular o início do mês atual
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calcular o fim do mês atual
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const periods: { [key: string]: PaymentPeriod } = {
      thisWeek: {
        name: 'Esta Semana',
        start: startOfWeek,
        end: endOfWeek,
        color: 'bg-blue-50 border-blue-200 text-blue-700',
        icon: '📅'
      },
      nextWeek: {
        name: 'Próxima Semana',
        start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        color: 'bg-purple-50 border-purple-200 text-purple-700',
        icon: '📆'
      },
      thisMonth: {
        name: 'Este Mês',
        start: startOfMonth,
        end: endOfMonth,
        color: 'bg-green-50 border-green-200 text-green-700',
        icon: '🗓️'
      },
      nextMonth: {
        name: 'Próximo Mês',
        start: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0),
        color: 'bg-orange-50 border-orange-200 text-orange-700',
        icon: '📋'
      },
      next90Days: {
        name: 'Próximos 90 Dias',
        start: new Date(),
        end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        color: 'bg-red-50 border-red-200 text-red-700',
        icon: '📊'
      },
      custom: {
        name: `Próximos ${customDays} Dias`,
        start: new Date(),
        end: new Date(Date.now() + customDays * 24 * 60 * 60 * 1000),
        color: 'bg-gray-50 border-gray-200 text-gray-700',
        icon: '⚙️'
      }
    };
    
    const period = periods[selectedPeriod];
    if (!period) return { payments: [], total: 0, byCategory: {}, byDay: {}, periods };

    // Filtrar transações do período (apenas despesas)
    const payments = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      transactionDate.setHours(0, 0, 0, 0); // Normalizar para início do dia
      
      if (!period.start || !period.end) return false;
      
      const periodStart = new Date(period.start);
      periodStart.setHours(0, 0, 0, 0);
      
      const periodEnd = new Date(period.end);
      periodEnd.setHours(23, 59, 59, 999);
      
      const isExpense = t.type === 'expense';
      const isInRange = transactionDate >= periodStart && transactionDate <= periodEnd;
      
      return isExpense && isInRange;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calcular total
    const total = payments.reduce((sum, t) => sum + t.amount, 0);

    // Agrupar por categoria
    const byCategory: { [key: string]: { total: number; count: number; payments: Transaction[] } } = {};
    payments.forEach(payment => {
      const category = payment.category || 'Sem categoria';
      if (!byCategory[category]) {
        byCategory[category] = { total: 0, count: 0, payments: [] };
      }
      byCategory[category].total += payment.amount;
      byCategory[category].count += 1;
      byCategory[category].payments.push(payment);
    });

    // Agrupar por dia
    const byDay: { [key: string]: { total: number; count: number; payments: Transaction[] } } = {};
    payments.forEach(payment => {
      const dayKey = formatDateLocal(new Date(payment.date));
      if (!byDay[dayKey]) {
        byDay[dayKey] = { total: 0, count: 0, payments: [] };
      }
      byDay[dayKey].total += payment.amount;
      byDay[dayKey].count += 1;
      byDay[dayKey].payments.push(payment);
    });

    return { payments, total, byCategory, byDay, periods };
  }, [transactions, selectedPeriod, customDays]);

  // Extrair períodos do periodData
  const periods = periodData.periods;

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Determinar urgência do pagamento
  const getPaymentUrgency = (date: string) => {
    const paymentDate = new Date(date);
    const today = new Date();
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { level: 'overdue', label: 'Vencido', color: 'text-red-600 bg-red-50' };
    if (diffDays <= 3) return { level: 'urgent', label: 'Urgente', color: 'text-orange-600 bg-orange-50' };
    if (diffDays <= 7) return { level: 'soon', label: 'Em breve', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'normal', label: 'Normal', color: 'text-green-600 bg-green-50' };
  };

  const selectedPeriodInfo = periods[selectedPeriod];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden">
        <CardHeader className={`${selectedPeriodInfo?.color || 'bg-blue-50'} dark:bg-gray-800`}>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">{selectedPeriodInfo?.icon || '📅'}</span>
            <div>
              <h2 className="text-xl font-bold">Próximos Pagamentos</h2>
              <p className="text-sm opacity-80">
                {selectedPeriodInfo?.name} - {formatCurrency(periodData.total)} total
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Seletores de Período */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <button
                onClick={() => setSelectedPeriod('thisWeek')}
                className={`group relative px-6 py-4 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                  selectedPeriod === 'thisWeek'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105'
                }`}
              >
                <span className="relative z-10 flex flex-col items-center justify-center gap-1 text-xs">
                  <span className="text-xl">📅</span>
                  <span>Esta Semana</span>
                </span>
                {selectedPeriod === 'thisWeek' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                )}
              </button>

              <button
                onClick={() => setSelectedPeriod('nextWeek')}
                className={`group relative px-6 py-4 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                  selectedPeriod === 'nextWeek'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105'
                }`}
              >
                <span className="relative z-10 flex flex-col items-center justify-center gap-1 text-xs">
                  <span className="text-xl">📆</span>
                  <span>Próxima Semana</span>
                </span>
                {selectedPeriod === 'nextWeek' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                )}
              </button>

              <button
                onClick={() => setSelectedPeriod('thisMonth')}
                className={`group relative px-6 py-4 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                  selectedPeriod === 'thisMonth'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105'
                }`}
              >
                <span className="relative z-10 flex flex-col items-center justify-center gap-1 text-xs">
                  <span className="text-xl">🗓️</span>
                  <span>Este Mês</span>
                </span>
                {selectedPeriod === 'thisMonth' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                )}
              </button>

              <button
                onClick={() => setSelectedPeriod('nextMonth')}
                className={`group relative px-6 py-4 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                  selectedPeriod === 'nextMonth'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105'
                }`}
              >
                <span className="relative z-10 flex flex-col items-center justify-center gap-1 text-xs">
                  <span className="text-xl">📋</span>
                  <span>Próximo Mês</span>
                </span>
                {selectedPeriod === 'nextMonth' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                )}
              </button>

              <button
                onClick={() => setSelectedPeriod('next90Days')}
                className={`group relative px-6 py-4 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                  selectedPeriod === 'next90Days'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105'
                }`}
              >
                <span className="relative z-10 flex flex-col items-center justify-center gap-1 text-xs">
                  <span className="text-xl">📊</span>
                  <span className="text-center">Próximos<br/>90 Dias</span>
                </span>
                {selectedPeriod === 'next90Days' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                )}
              </button>
            </div>

            {/* Período Customizado */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setSelectedPeriod('custom')}
                className={`group relative px-6 py-4 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                  selectedPeriod === 'custom'
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/50 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap text-xs">
                  <span className="text-xl">⚙️</span>
                  <span>Personalizado</span>
                </span>
                {selectedPeriod === 'custom' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                )}
              </button>
              {selectedPeriod === 'custom' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className="w-20 h-10 text-sm"
                    min="1"
                    max="365"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">dias</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagamentos */}
      {periodData.payments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📋 Lista de Pagamentos ({periodData.payments.length})</span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(periodData.total)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {periodData.payments.map((payment, index) => {
                const urgency = getPaymentUrgency(payment.date);
                return (
                  <div
                    key={payment.id || index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgency.color}`}>
                          {urgency.label}
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {formatDate(payment.date)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {payment.description}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📂 {payment.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(payment.amount)}
                      </p>
                      {payment.recurrence && (
                        <p className="text-xs text-gray-500">
                          🔄 {payment.recurrence}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum pagamento pendente!</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem despesas programadas para o período selecionado.
          </p>
        </Card>
      )}

      {/* Resumo por Categoria */}
      {Object.keys(periodData.byCategory).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                Por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(periodData.byCategory)
                  .sort(([,a], [,b]) => b.total - a.total)
                  .map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{category}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {data.count} {data.count === 1 ? 'pagamento' : 'pagamentos'}
                        </p>
                      </div>
                      <p className="font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(data.total)}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline por Dia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(periodData.byDay)
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .map(([date, data]) => (
                    <div key={date} className="flex items-center justify-between p-2 rounded border-l-4 border-red-400 bg-red-50 dark:bg-red-950">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {formatDate(date)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {data.count} {data.count === 1 ? 'pagamento' : 'pagamentos'}
                        </p>
                      </div>
                      <p className="font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(data.total)}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UpcomingPaymentsDashboard;

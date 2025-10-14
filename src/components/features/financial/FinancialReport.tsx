/**
 * 📊 Financial Report Component
 * Relatório financeiro com filtros de data e insights
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Transaction } from '@/types/transaction';

interface FinancialReportProps {
  transactions: Transaction[];
}

interface DateRange {
  start: string;
  end: string;
}

interface ReportData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  transacoesPeriodo: Transaction[];
  receitasPorCategoria: { [key: string]: number };
  despesasPorCategoria: { [key: string]: number };
  proximosPagamentos: Transaction[];
  metricasComparativas: {
    mesAnterior?: {
      receitas: number;
      despesas: number;
      saldo: number;
    };
  };
}

const FinancialReport: React.FC<FinancialReportProps> = ({ transactions }) => {
  // Estados
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '',
    end: ''
  });
  const [activeFilter, setActiveFilter] = useState<'thisMonth' | 'nextMonth' | 'thisYear' | 'custom'>('thisMonth');

  // Configurar datas padrão
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setDateRange({
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    });
  }, []);

  // Filtros rápidos
  const setQuickFilter = (filter: typeof activeFilter) => {
    const today = new Date();
    let start: Date, end: Date;

    switch (filter) {
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'nextMonth':
        start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
    setActiveFilter(filter);
  };

  // Calcular dados do relatório
  const reportData = useMemo((): ReportData => {
    if (!dateRange.start || !dateRange.end) {
      return {
        totalReceitas: 0,
        totalDespesas: 0,
        saldo: 0,
        transacoesPeriodo: [],
        receitasPorCategoria: {},
        despesasPorCategoria: {},
        proximosPagamentos: [],
        metricasComparativas: {}
      };
    }

    // Filtrar transações por período
    const startDate = new Date(dateRange.start + 'T00:00:00');
    const endDate = new Date(dateRange.end + 'T23:59:59.999');
    
    const transacoesPeriodo = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      
      // Normalizar datas para comparação (remover horário)
      const txDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      return txDateOnly >= startDateOnly && txDateOnly <= endDateOnly;
    });

    // Calcular totais
    const totalReceitas = transacoesPeriodo
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDespesas = transacoesPeriodo
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const saldo = totalReceitas - totalDespesas;

    // Agrupar por categoria
    const receitasPorCategoria: { [key: string]: number } = {};
    const despesasPorCategoria: { [key: string]: number } = {};

    transacoesPeriodo.forEach(t => {
      const categoria = t.category || 'Sem categoria';
      if (t.type === 'income') {
        receitasPorCategoria[categoria] = (receitasPorCategoria[categoria] || 0) + t.amount;
      } else {
        despesasPorCategoria[categoria] = (despesasPorCategoria[categoria] || 0) + t.amount;
      }
    });

    // Próximos pagamentos (próximos 30 dias)
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const proximosPagamentos = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate >= today && 
               transactionDate <= next30Days;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    // Métricas comparativas (mês anterior)
    const mesAnterior = {
      start: new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1),
      end: new Date(startDate.getFullYear(), startDate.getMonth(), 0)
    };

    const transacoesMesAnterior = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= mesAnterior.start && transactionDate <= mesAnterior.end;
    });

    const metricasComparativas = {
      mesAnterior: {
        receitas: transacoesMesAnterior
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        despesas: transacoesMesAnterior
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
        saldo: 0
      }
    };
    metricasComparativas.mesAnterior.saldo = 
      metricasComparativas.mesAnterior.receitas - metricasComparativas.mesAnterior.despesas;

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      transacoesPeriodo,
      receitasPorCategoria,
      despesasPorCategoria,
      proximosPagamentos,
      metricasComparativas
    };
  }, [transactions, dateRange]);

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular percentual de mudança
  const calcularPercentualMudanca = (atual: number, anterior: number) => {
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return ((atual - anterior) / anterior) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Relatório Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros de Data */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setQuickFilter('thisMonth')}
              className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                activeFilter === 'thisMonth'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                <span className="text-lg">📅</span>
                <span>Este Mês</span>
              </span>
              {activeFilter === 'thisMonth' && (
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              )}
            </button>

            <button
              onClick={() => setQuickFilter('nextMonth')}
              className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                activeFilter === 'nextMonth'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                <span className="text-lg">📆</span>
                <span>Próximo Mês</span>
              </span>
              {activeFilter === 'nextMonth' && (
                <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              )}
            </button>

            <button
              onClick={() => setQuickFilter('thisYear')}
              className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                activeFilter === 'thisYear'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50 scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                <span className="text-lg">📊</span>
                <span>Este Ano</span>
              </span>
              {activeFilter === 'thisYear' && (
                <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              )}
            </button>

            <button
              onClick={() => setActiveFilter('custom')}
              className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                activeFilter === 'custom'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                <span className="text-lg">⚙️</span>
                <span>Personalizado</span>
              </span>
              {activeFilter === 'custom' && (
                <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data Inicial</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange({ ...dateRange, start: e.target.value });
                  setActiveFilter('custom');
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Final</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange({ ...dateRange, end: e.target.value });
                  setActiveFilter('custom');
                }}
              />
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Receitas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(reportData.totalReceitas)}
                </p>
                {reportData.metricasComparativas.mesAnterior && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {calcularPercentualMudanca(
                      reportData.totalReceitas,
                      reportData.metricasComparativas.mesAnterior.receitas
                    ).toFixed(1)}% vs mês anterior
                  </p>
                )}
              </div>
              <span className="text-3xl text-green-500">📈</span>
            </div>
          </Card>

          <Card className="p-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Despesas</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(reportData.totalDespesas)}
                </p>
                {reportData.metricasComparativas.mesAnterior && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {calcularPercentualMudanca(
                      reportData.totalDespesas,
                      reportData.metricasComparativas.mesAnterior.despesas
                    ).toFixed(1)}% vs mês anterior
                  </p>
                )}
              </div>
              <span className="text-3xl text-red-500">📉</span>
            </div>
          </Card>

          <Card className={`p-4 border-2 ${
            reportData.saldo >= 0 
              ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' 
              : 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  reportData.saldo >= 0 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-orange-700 dark:text-orange-300'
                }`}>
                  Saldo
                </p>
                <p className={`text-2xl font-bold ${
                  reportData.saldo >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {formatCurrency(reportData.saldo)}
                </p>
                {reportData.metricasComparativas.mesAnterior && (
                  <p className={`text-xs ${
                    reportData.saldo >= 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {calcularPercentualMudanca(
                      reportData.saldo,
                      reportData.metricasComparativas.mesAnterior.saldo
                    ).toFixed(1)}% vs mês anterior
                  </p>
                )}
              </div>
              <span className="text-3xl">
                {reportData.saldo >= 0 ? '💰' : '⚠️'}
              </span>
            </div>
          </Card>
        </div>

        {/* Próximos Pagamentos */}
        {reportData.proximosPagamentos.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">📅</span>
              Próximos Pagamentos (30 dias)
            </h3>
            <div className="space-y-2">
              {reportData.proximosPagamentos.map((transaction, index) => (
                <div key={transaction.id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')} • {transaction.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Receitas por Categoria */}
          {Object.keys(reportData.receitasPorCategoria).length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">📈</span>
                Receitas por Categoria
              </h3>
              <div className="space-y-2">
                {Object.entries(reportData.receitasPorCategoria)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([categoria, valor]) => (
                    <div key={categoria} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{categoria}</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(valor)}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Despesas por Categoria */}
          {Object.keys(reportData.despesasPorCategoria).length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">📉</span>
                Despesas por Categoria
              </h3>
              <div className="space-y-2">
                {Object.entries(reportData.despesasPorCategoria)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([categoria, valor]) => (
                    <div key={categoria} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{categoria}</span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(valor)}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>

        {/* Informações do Período */}
        <Card className="p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Período: {new Date(dateRange.start).toLocaleDateString('pt-BR')} até {new Date(dateRange.end).toLocaleDateString('pt-BR')}
            </p>
            <p>
              {reportData.transacoesPeriodo.length} transações encontradas
            </p>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};

export default FinancialReport;

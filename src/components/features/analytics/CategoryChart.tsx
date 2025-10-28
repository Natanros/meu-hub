'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/transaction';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryChartProps {
  transactions: Transaction[];
}

type FilterType = 'all' | 'income' | 'expense';

const COLORS = {
  income: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
  expense: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  all: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']
};

export default function CategoryChart({ transactions }: CategoryChartProps) {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Processa dados por categoria
  const categoryData = useMemo(() => {
    const filtered = transactions.filter(t => {
      if (filterType === 'all') return true;
      return t.type === filterType;
    });

    // Agrupa por categoria
    const grouped = filtered.reduce((acc, t) => {
      const category = t.category || 'Sem Categoria';
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, type: t.type };
      }
      acc[category].total += t.amount;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; type: string }>);

    // Converte para array e ordena
    return Object.entries(grouped)
      .map(([name, data]) => ({
        name,
        value: data.total,
        count: data.count,
        type: data.type
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 categorias
  }, [transactions, filterType]);

  // Calcula totais
  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, total: income + expense };
  }, [transactions]);

  // Cores baseadas no tipo de filtro
  const getColors = () => {
    if (filterType === 'income') return COLORS.income;
    if (filterType === 'expense') return COLORS.expense;
    return COLORS.all;
  };

  const colors = getColors();

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
            📊 Análise por Categorias
          </CardTitle>
          
          <div className="flex flex-wrap gap-2">
            {/* Filtro de Tipo */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                💰 Todas
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  filterType === 'income'
                    ? 'bg-white dark:bg-gray-600 text-green-600 shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-green-600'
                }`}
              >
                📈 Receitas
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  filterType === 'expense'
                    ? 'bg-white dark:bg-gray-600 text-red-600 shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-red-600'
                }`}
              >
                📉 Despesas
              </button>
            </div>

            {/* Tipo de Gráfico */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                📊 Barras
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  chartType === 'pie'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                🍰 Pizza
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Totais */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${filterType === 'all' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Geral</div>
            <div className="text-lg font-bold text-gray-800 dark:text-white">
              R$ {totals.total.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${filterType === 'income' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Receitas</div>
            <div className="text-lg font-bold text-green-600">
              R$ {totals.income.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${filterType === 'expense' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Despesas</div>
            <div className="text-lg font-bold text-red-600">
              R$ {totals.expense.toFixed(2)}
            </div>
          </div>
        </div>

        {categoryData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p>Nenhuma transação encontrada</p>
            <p className="text-sm mt-1">Adicione transações para ver os gráficos</p>
          </div>
        ) : (
          <>
            {/* Gráfico */}
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill={colors[0]} name="Valor" radius={[8, 8, 0, 0]}>
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => 
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Tabela de Categorias */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 text-gray-700 dark:text-gray-300 font-medium">
                      Categoria
                    </th>
                    <th className="text-right py-2 px-3 text-gray-700 dark:text-gray-300 font-medium">
                      Qtd
                    </th>
                    <th className="text-right py-2 px-3 text-gray-700 dark:text-gray-300 font-medium">
                      Total
                    </th>
                    <th className="text-right py-2 px-3 text-gray-700 dark:text-gray-300 font-medium">
                      % do Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((item, index) => {
                    const percentage = (item.value / categoryData.reduce((sum, i) => sum + i.value, 0)) * 100;
                    return (
                      <tr 
                        key={item.name}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="text-gray-800 dark:text-white font-medium">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">
                          {item.count}
                        </td>
                        <td className={`text-right py-2 px-3 font-medium ${
                          item.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          R$ {item.value.toFixed(2)}
                        </td>
                        <td className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

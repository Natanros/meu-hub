'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FinanceCharts } from '@/components/features/analytics/Charts/FinanceCharts'
import { MetasProgressChartAdvanced } from '@/components/features/analytics/Charts/MetasProgressChartAdvanced'
import { Transaction } from '@/types/transaction'

interface Meta {
  id: string
  nome: string
  valor: number
}

interface AdvancedDashboardProps {
  transactions: Transaction[]
  metas: Meta[]
}

interface MonthlyData {
  month: string
  income: number
  expense: number
  balance: number
}

interface CategoryData {
  name: string
  value: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'danger'
  title: string
  message: string
  value?: string
  icon: string
}

export function AdvancedDashboard({ transactions, metas }: AdvancedDashboardProps) {
  const [timeFilter, setTimeFilter] = useState<'3m' | '6m' | '1y' | 'all'>('3m')

  // Filtrar transações por período
  const filteredTransactions = useMemo(() => {
    if (timeFilter === 'all') return transactions

    const now = new Date()
    const monthsBack = timeFilter === '3m' ? 3 : timeFilter === '6m' ? 6 : 12
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)

    return transactions.filter(t => new Date(t.date) >= startDate)
  }, [transactions, timeFilter])

  // Dados mensais para tendências
  const monthlyData = useMemo((): MonthlyData[] => {
    const monthlyMap = new Map<string, { income: number; expense: number }>()

    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 })
      }

      const monthData = monthlyMap.get(monthKey)!
      if (transaction.type === 'income') {
        monthData.income += transaction.amount
      } else {
        monthData.expense += transaction.amount
      }
    })

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Últimos 6 meses
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense
      }))
  }, [filteredTransactions])

  // Análise por categoria
  const categoryAnalysis = useMemo((): CategoryData[] => {
    const categoryMap = new Map<string, number>()
    const total = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const current = categoryMap.get(transaction.category) || 0
        categoryMap.set(transaction.category, current + transaction.amount)
      })

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        trend: 'stable' as const // TODO: Calcular tendência real comparando com período anterior
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [filteredTransactions])

  // Insights inteligentes
  const insights = useMemo((): Insight[] => {
    const insights: Insight[] = []
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Transações do mês atual
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const thisMonthIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const thisMonthExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = thisMonthIncome - thisMonthExpenses

    // Insight de saldo
    if (balance > 0) {
      insights.push({
        type: 'success',
        title: 'Saldo Positivo',
        message: 'Você está economizando neste mês!',
        value: `+R$ ${balance.toFixed(2)}`,
        icon: '💰'
      })
    } else if (balance < 0) {
      insights.push({
        type: 'warning',
        title: 'Gastos Elevados',
        message: 'Gastos excedem receitas este mês',
        value: `R$ ${Math.abs(balance).toFixed(2)}`,
        icon: '⚠️'
      })
    }

    // Insight de categoria top
    if (categoryAnalysis.length > 0) {
      const topCategory = categoryAnalysis[0]
      insights.push({
        type: 'info',
        title: 'Categoria Principal',
        message: `${topCategory.name} representa ${topCategory.percentage.toFixed(1)}% dos gastos`,
        value: `R$ ${topCategory.value.toFixed(2)}`,
        icon: '📊'
      })
    }

    // Insight de metas
    const metasProgresso = metas.map(meta => {
      const valorAcumulado = transactions
        .filter(t => t.metaId === meta.id)
        .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
      return {
        ...meta,
        progresso: (valorAcumulado / meta.valor) * 100
      }
    })

    const metasPerto = metasProgresso.filter(m => m.progresso >= 80 && m.progresso < 100)
    if (metasPerto.length > 0) {
      insights.push({
        type: 'success',
        title: 'Meta Quase Atingida!',
        message: `${metasPerto[0].nome} está ${metasPerto[0].progresso.toFixed(1)}% completa`,
        icon: '🎯'
      })
    }

    return insights
  }, [transactions, metas, categoryAnalysis])

  // Estatísticas rápidas
  const stats = useMemo(() => {
    const totalReceitas = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalDespesas = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const saldo = totalReceitas - totalDespesas
    const totalTransacoes = filteredTransactions.length

    // Média mensal
    const monthsInPeriod = timeFilter === '3m' ? 3 : timeFilter === '6m' ? 6 : timeFilter === '1y' ? 12 : 1
    const mediaReceitas = totalReceitas / monthsInPeriod
    const mediaDespesas = totalDespesas / monthsInPeriod

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      totalTransacoes,
      mediaReceitas,
      mediaDespesas,
      economiaRate: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0
    }
  }, [filteredTransactions, timeFilter])

  return (
    <div className="space-y-6">
      {/* Filtros de Tempo */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(['3m', '6m', '1y', 'all'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeFilter === filter
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter === '3m' ? '3 Meses' : filter === '6m' ? '6 Meses' : filter === '1y' ? '1 Ano' : 'Tudo'}
          </button>
        ))}
      </div>

      {/* Insights Inteligentes */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <Card key={index} className={`border-l-4 ${
              insight.type === 'success' ? 'border-l-green-500 bg-green-50/50 dark:bg-green-900/20' :
              insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/20' :
              insight.type === 'danger' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/20' :
              'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{insight.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{insight.message}</p>
                    {insight.value && (
                      <p className="font-bold text-lg mt-1">{insight.value}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-xs opacity-80">Saldo Total</div>
            <div className="text-lg font-bold">
              R$ {stats.saldo.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-xs opacity-80">Receitas</div>
            <div className="text-lg font-bold">
              R$ {stats.totalReceitas.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📉</div>
            <div className="text-xs opacity-80">Despesas</div>
            <div className="text-lg font-bold">
              R$ {stats.totalDespesas.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-xs opacity-80">Taxa Economia</div>
            <div className="text-lg font-bold">
              {stats.economiaRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">📈 Tendências</TabsTrigger>
          <TabsTrigger value="categories">🏷️ Categorias</TabsTrigger>
          <TabsTrigger value="goals">🎯 Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FinanceCharts transactions={filteredTransactions} filterType="all" />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📈 Tendências Mensais
                <span className="text-sm font-normal text-gray-500">
                  Últimos 6 meses
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {/* Aqui você pode implementar um gráfico de linha temporal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                  {monthlyData.slice(-3).map((month, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">{month.month}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-600">Receitas:</span>
                          <span>R$ {month.income.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">Despesas:</span>
                          <span>R$ {month.expense.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Saldo:</span>
                          <span className={month.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                            R$ {month.balance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🏷️ Análise por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryAnalysis.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-gray-600">
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-bold">R$ {category.value.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Progresso das Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <MetasProgressChartAdvanced 
                metas={metas} 
                transactions={filteredTransactions}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/types/transaction'
import { AdvancedChat } from '@/components/features/chat/AdvancedChat'
import { AIAnalysis } from '@/components/features/analytics/AIAnalysis'
import { NotificationCenter } from '@/components/features/notifications/NotificationCenter'
import { AdvancedDashboard } from '@/components/features/analytics/AdvancedDashboard'
import { useNotifications } from '@/hooks/useNotifications'
import { Navigation } from '@/components/layout/Navigation'
import UserHeader from '@/components/layout/UserHeader'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'

interface Meta {
  id: string
  nome: string
  valor: number
  transacoes: number[]
}

export default function IAPage() {
  // Estados principais
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const { notifications, markAsRead, clearAll, unreadCount } = useNotifications()

  // Fetch de dados
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      setTransactions(data)
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
    }
  }, [])

  const fetchMetas = useCallback(async () => {
    try {
      const res = await fetch('/api/metas')
      const data = await res.json()
      setMetas(data)
    } catch (error) {
      console.error('Erro ao buscar metas:', error)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
    fetchMetas()
  }, [fetchTransactions, fetchMetas])

  // Cálculos financeiros com verificação de segurança
  const saldo = Array.isArray(transactions) 
    ? transactions.reduce((acc, item) => {
        return acc + (item.type === 'income' ? item.amount : -item.amount)
      }, 0)
    : 0

  const totalReceitas = Array.isArray(transactions)
    ? transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0)
    : 0

  const totalDespesas = Array.isArray(transactions)
    ? transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0)
    : 0

  return (
    <ProtectedRoute>
      <div id="page-top" style={{ scrollMarginTop: 0 }}>
        <UserHeader />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Navegação */}
          <Navigation />
        
        {/* Header Principal */}
        <div className="text-center py-6 sm:py-8 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 text-white rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">🤖 Inteligência Artificial</h1>
          <p className="text-sm sm:text-base text-purple-100 dark:text-purple-200">Análises inteligentes e chat com IA</p>
        </div>

        {/* Cards de Resumo Financeiro para IA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Saldo para IA */}
          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-100">Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg sm:text-2xl font-bold">R$ {saldo.toFixed(2)}</div>
                  <p className="text-green-100 text-xs">Para análise da IA</p>
                </div>
                <div className="text-xl sm:text-3xl">💰</div>
              </div>
            </CardContent>
          </Card>

          {/* Receitas para IA */}
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-100">Receitas</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg sm:text-2xl font-bold">R$ {totalReceitas.toFixed(2)}</div>
                  <p className="text-blue-100 text-xs">{Array.isArray(transactions) ? transactions.filter(t => t.type === 'income').length : 0} entradas</p>
                </div>
                <div className="text-xl sm:text-3xl">📈</div>
              </div>
            </CardContent>
          </Card>

          {/* Despesas para IA */}
          <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-red-100">Despesas</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg sm:text-2xl font-bold">R$ {totalDespesas.toFixed(2)}</div>
                  <p className="text-red-100 text-xs">{Array.isArray(transactions) ? transactions.filter(t => t.type === 'expense').length : 0} saídas</p>
                </div>
                <div className="text-xl sm:text-3xl">📉</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análise IA Automática */}
        <AIAnalysis 
          transactions={transactions}
          metas={metas}
          saldo={saldo}
        />

        {/* Seção Chat IA e Notificações */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 min-h-0">
          <div className="min-w-0 overflow-hidden">
            <AdvancedChat 
              transactions={transactions}
              metas={metas}
              saldo={saldo}
            />
          </div>
          
          <div className="min-w-0 overflow-hidden">
            <NotificationCenter 
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onClearAll={clearAll}
              unreadCount={unreadCount}
            />
          </div>
        </div>

        {/* Insights Avançados */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-xl border-t-4 border-t-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg p-3 sm:p-4">
            <CardTitle className="dark:text-white flex items-center gap-2 text-sm sm:text-base">
              🧠 Insights Avançados da IA
              <span className="hidden sm:inline text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                ANÁLISE PROFUNDA
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="dark:bg-gray-800 p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Tendência Detalhada */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-blue-200 dark:border-gray-600">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1 sm:p-2 bg-blue-500 rounded-lg">
                    <span className="text-white text-sm sm:text-lg">📊</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-blue-900 dark:text-blue-300">Tendência Financeira</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Análise de padrões</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {saldo > 0 
                    ? `✅ Situação saudável! Saldo positivo de R$ ${saldo.toFixed(2)}. Continue mantendo o controle dos gastos.`
                    : `⚠️ Atenção necessária! Saldo negativo de R$ ${saldo.toFixed(2)}. Revise despesas urgentemente.`
                  }
                </p>
              </div>

              {/* Recomendações IA */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-green-200 dark:border-gray-600">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1 sm:p-2 bg-green-500 rounded-lg">
                    <span className="text-white text-sm sm:text-lg">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-green-900 dark:text-green-300">Recomendações</h4>
                    <p className="text-xs text-green-600 dark:text-green-400">Sugestões inteligentes</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {totalDespesas > totalReceitas 
                    ? "💡 Considere reduzir gastos em categorias não essenciais. Analise suas maiores despesas."
                    : "🌟 Excelente gestão! Continue poupando e considere investir o excedente."
                  }
                </p>
              </div>

              {/* Status Geral */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-orange-200 dark:border-gray-600">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1 sm:p-2 bg-orange-500 rounded-lg">
                    <span className="text-white text-sm sm:text-lg">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-orange-900 dark:text-orange-300">Status Inteligente</h4>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Resumo geral</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  📈 Total de {Array.isArray(transactions) ? transactions.length : 0} transações analisadas. {Array.isArray(metas) && metas.length > 0 ? `${metas.length} metas ativas.` : 'Defina metas para melhor controle.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Avançado */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-xl border-t-4 border-t-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg p-3 sm:p-4">
            <CardTitle className="dark:text-white flex items-center gap-2 text-sm sm:text-base">
              📊 Dashboard Analítico Avançado
              <span className="hidden sm:inline text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                INSIGHTS IA
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="dark:bg-gray-800 p-3 sm:p-6">
            <AdvancedDashboard transactions={transactions} metas={metas} />
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center py-3 sm:py-4 text-gray-600 dark:text-gray-400">
          <p className="text-xs sm:text-sm">
            🤖 Inteligência Artificial aplicada às suas finanças
          </p>
        </div>
      </div>
    </div>
    </div>
    </ProtectedRoute>
  )
}

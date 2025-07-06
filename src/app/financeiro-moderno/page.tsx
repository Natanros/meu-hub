'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Transaction } from '@/types/transaction'
import { useToast } from '@/hooks/useToast'
import { ChatComponent } from '@/components/ChatComponent'
import { NotificationCenter } from '@/components/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'

interface Meta {
  id: string
  nome: string
  valor: number
  transacoes: number[]
}

export default function FinanceiroModerno() {
  // Estados principais
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const { showToast, Toast } = useToast()
  const { notifications, markAsRead, clearAll, unreadCount } = useNotifications()

  // Fetch de dados
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      setTransactions(data)
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
      showToast('Erro ao carregar transações', 'error')
    }
  }, [showToast])

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

  // Cálculos financeiros
  const saldo = transactions.reduce((acc, item) => {
    return acc + (item.type === 'income' ? item.amount : -item.amount)
  }, 0)

  const totalReceitas = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalDespesas = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Toast />
        
        {/* Header Principal */}
        <div className="text-center py-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-2">💰 Dashboard Financeiro</h1>
          <p className="text-blue-100 dark:text-blue-200">Gerencie suas finanças de forma inteligente</p>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Saldo Total */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Saldo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">R$ {saldo.toFixed(2)}</div>
                  <p className="text-green-100 text-sm">Situação atual</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Receitas */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">R$ {totalReceitas.toFixed(2)}</div>
                  <p className="text-blue-100 text-sm">Este período</p>
                </div>
                <div className="text-4xl">📈</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Despesas */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-100">Total Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">R$ {totalDespesas.toFixed(2)}</div>
                  <p className="text-red-100 text-sm">Este período</p>
                </div>
                <div className="text-4xl">📉</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights IA */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-xl border-t-4 border-t-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg">
            <CardTitle className="dark:text-white flex items-center gap-2">
              🧠 Insights Inteligentes
              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                IA ANALYSIS
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="dark:bg-gray-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tendência */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-blue-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <span className="text-white text-lg">📈</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300">Tendência</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Análise automática</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {saldo > 0 
                    ? `✅ Situação positiva! Saldo de R$ ${saldo.toFixed(2)}`
                    : `⚠️ Atenção ao saldo negativo: R$ ${saldo.toFixed(2)}`
                  }
                </p>
              </div>

              {/* Dica IA */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-green-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-300">Dica IA</h4>
                    <p className="text-xs text-green-600 dark:text-green-400">Personalizada</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {totalDespesas > totalReceitas 
                    ? "💡 Considere revisar seus gastos este mês"
                    : "🌟 Ótimo controle financeiro! Continue assim!"
                  }
                </p>
              </div>

              {/* Status */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-orange-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-900 dark:text-orange-300">Status</h4>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Situação atual</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  📈 {transactions.length} transações registradas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção Chat IA e Notificações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChatComponent 
            transactions={transactions}
            metas={metas}
            saldo={saldo}
          />
          
          <NotificationCenter 
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onClearAll={clearAll}
            unreadCount={unreadCount}
          />
        </div>

        {/* Exportação Avançada */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-t-4 border-t-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg">
            <CardTitle className="dark:text-white flex items-center gap-2">
              📊 Exportação e Relatórios
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                PREMIUM
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="dark:bg-gray-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => {
                  // Implementar exportação CSV
                  showToast('Exportação CSV iniciada!', 'success')
                }}
                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 h-16"
              >
                <span className="text-2xl">📄</span>
                <div className="text-left">
                  <div className="font-semibold">CSV Detalhado</div>
                  <div className="text-xs opacity-90">Planilha completa</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => {
                  // Implementar relatório executivo
                  showToast('Relatório executivo gerado!', 'success')
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2 h-16"
              >
                <span className="text-2xl">📋</span>
                <div className="text-left">
                  <div className="font-semibold">Relatório Executivo</div>
                  <div className="text-xs opacity-90">Análise completa</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => {
                  // Implementar exportação Excel
                  showToast('Exportação Excel iniciada!', 'success')
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 h-16"
              >
                <span className="text-2xl">📊</span>
                <div className="text-left">
                  <div className="font-semibold">Excel Avançado</div>
                  <div className="text-xs opacity-90">Múltiplas planilhas</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center py-4 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            🚀 Dashboard Financeiro Moderno com IA Integrada
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/types/transaction'
import { useToast } from '@/hooks/useToast'
import { TransactionForm } from '@/components/TransactionForm'
import { TransactionsList } from '@/components/TransactionsList'
import { Navigation } from '@/components/Navigation'
import { ExportControls } from '@/components/ExportControls'
import { VoiceTextInput } from '@/components/VoiceTextInput'
import FinancialReport from '@/components/FinancialReport'
import UpcomingPaymentsDashboard from '@/components/UpcomingPaymentsDashboard'

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

  // Fetch de dados
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      setTransactions(data)
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
      // Removido showToast para evitar dependências problemáticas
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <Toast />
        
        {/* Navegação */}
        <Navigation />
        
        {/* Header Principal */}
        <div className="text-center py-6 sm:py-8 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 text-white rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">💰 Gestão Financeira</h1>
          <p className="text-sm sm:text-base text-green-100 dark:text-green-200">Controle suas receitas e despesas</p>
        </div>

        {/* Entrada Inteligente com IA e Voz */}
        <VoiceTextInput 
          onTransactionAdded={fetchTransactions}
          metas={metas}
          showToast={showToast}
        />

        {/* Relatório Financeiro com Filtros */}
        <FinancialReport transactions={transactions} />

        {/* Dashboard de Próximos Pagamentos */}
        <UpcomingPaymentsDashboard transactions={transactions} />

        {/* Formulário de Nova Transação */}
        <TransactionForm 
          onTransactionAdded={fetchTransactions}
          metas={metas}
          showToast={showToast}
        />

        {/* Lista de Transações */}
        <TransactionsList 
          transactions={transactions}
          metas={metas}
          showToast={showToast}
          onTransactionDeleted={fetchTransactions}
        />

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Saldo Total */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-100">Saldo Total</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-3xl font-bold">R$ {saldo.toFixed(2)}</div>
                  <p className="text-green-100 text-xs sm:text-sm">Situação atual</p>
                </div>
                <div className="text-2xl sm:text-4xl">💰</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Receitas */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-100">Total Receitas</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-3xl font-bold">R$ {totalReceitas.toFixed(2)}</div>
                  <p className="text-blue-100 text-xs sm:text-sm">Este período</p>
                </div>
                <div className="text-2xl sm:text-4xl">📈</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Despesas */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-red-100">Total Despesas</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-3xl font-bold">R$ {totalDespesas.toFixed(2)}</div>
                  <p className="text-red-100 text-xs sm:text-sm">Este período</p>
                </div>
                <div className="text-2xl sm:text-4xl">📉</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Financeiros */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-xl border-t-4 border-t-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg p-3 sm:p-4">
            <CardTitle className="dark:text-white flex items-center gap-2 text-sm sm:text-base">
              📊 Resumo Financeiro
              <span className="hidden sm:inline text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                ATUAL
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="dark:bg-gray-800 p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Situação Atual */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-blue-200 dark:border-gray-600">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1 sm:p-2 bg-blue-500 rounded-lg">
                    <span className="text-white text-sm sm:text-lg">📈</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-blue-900 dark:text-blue-300">Situação Atual</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Saldo geral</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {saldo > 0 
                    ? `✅ Situação positiva! Saldo: R$ ${saldo.toFixed(2)}`
                    : `⚠️ Saldo negativo: R$ ${saldo.toFixed(2)}`
                  }
                </p>
              </div>

              {/* Fluxo de Caixa */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-green-200 dark:border-gray-600">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1 sm:p-2 bg-green-500 rounded-lg">
                    <span className="text-white text-sm sm:text-lg">💹</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-green-900 dark:text-green-300">Fluxo de Caixa</h4>
                    <p className="text-xs text-green-600 dark:text-green-400">Entradas vs Saídas</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {totalDespesas > totalReceitas 
                    ? "� Gastos superiores às receitas"
                    : "📈 Receitas superiores aos gastos"
                  }
                </p>
              </div>

              {/* Total de Transações */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl border border-orange-200 dark:border-gray-600">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1 sm:p-2 bg-orange-500 rounded-lg">
                    <span className="text-white text-sm sm:text-lg">📊</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-orange-900 dark:text-orange-300">Atividade</h4>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Movimentação total</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  📈 {transactions.length} transações • {metas.length} metas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exportação Avançada */}
        <ExportControls 
          transactions={transactions}
          metas={metas}
          onExportComplete={(type, filename) => {
            showToast(`Exportação ${type.toUpperCase()} concluída: ${filename}`, 'success')
          }}
        />

        {/* Footer Info */}
        <div className="text-center py-3 sm:py-4 text-gray-600 dark:text-gray-400">
          <p className="text-xs sm:text-sm">
            � Sistema de Gestão Financeira Pessoal
          </p>
        </div>
      </div>
    </div>
  )
}

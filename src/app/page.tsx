'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import UserHeader from '@/components/layout/UserHeader'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'
import Link from 'next/link'
import { useFinancialData } from '@/hooks/useFinancialData'
import { FinancialSummaryCards } from '@/components/features/financial/FinancialSummaryCards'
import { TransactionsList } from '@/components/features/transactions/TransactionsList'
import { useToast } from '@/hooks/useToast'
import { InsightsDashboard } from '@/components/features/analytics/InsightsDashboard'

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [greeting, setGreeting] = useState<string>('')
  const { transactions, metas, summary, loading, refreshData } = useFinancialData()
  const { showToast } = useToast()

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString('pt-BR'))
      
      const hour = now.getHours()
      if (hour < 12) setGreeting('Bom dia')
      else if (hour < 18) setGreeting('Boa tarde')
      else setGreeting('Boa noite')
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTransactionDeleted = () => {
    refreshData()
    showToast('Transação excluída com sucesso!', 'success')
  }

  const recentTransactions = transactions.slice(0, 5);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          <UserHeader />
          
          <div className="text-center py-6 sm:py-10 md:py-12 px-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-xl shadow-xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">🏠 Dashboard</h1>
            <p className="text-sm sm:text-lg md:text-xl text-blue-100 dark:text-blue-200 mb-2 sm:mb-4">
              {greeting}! Visão geral das suas finanças.
            </p>
            <div className="text-xs sm:text-sm text-blue-200 dark:text-blue-300">
              {currentTime}
            </div>
          </div>

          <FinancialSummaryCards summary={summary} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Coluna Esquerda: Insights e Transações */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <InsightsDashboard />
              <Card className="shadow-xl">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <span className="flex items-center gap-2">📋 <span className="hidden xs:inline">Transações Recentes</span><span className="xs:hidden">Recentes</span></span>
                    <Link href="/financeiro">
                      <Button variant="link" className="text-xs sm:text-sm p-0 h-auto">Ver todas</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <TransactionsList 
                    transactions={recentTransactions}
                    onTransactionDeleted={handleTransactionDeleted}
                    metas={metas}
                    showToast={showToast}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita: Ações Rápidas */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="shadow-xl">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">⚡ Acesso Rápido</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-6 pt-0">
                  <Link href="/financeiro">
                    <Button className="w-full h-10 sm:h-11 text-sm">💰 Nova Transação</Button>
                  </Link>
                  <Link href="/orcamento">
                     <Button variant="outline" className="w-full h-10 sm:h-11 text-sm">🎯 Gerenciar Orçamento</Button>
                  </Link>
                  <Link href="/analytics">
                    <Button variant="outline" className="w-full h-10 sm:h-11 text-sm">📊 Ver Relatórios</Button>
                  </Link>
                  <Link href="/insights">
                    <Button variant="outline" className="w-full h-10 sm:h-11 text-sm">💡 Insights & Assistente</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer Informativo */}
          <div className="text-center py-4 sm:py-6 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="space-y-2 px-4">
              <p className="text-xs sm:text-sm font-medium">Sistema de Gestão Pessoal</p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs">
                <span>💾 Dados seguros</span>
                <span>🔄 Atualizações automáticas</span>
                <span>📱 Interface responsiva</span>
              </div>
            </div>
            </div>
          </div>
        </div>
    </ProtectedRoute>
  )
}

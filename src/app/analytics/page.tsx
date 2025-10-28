'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Transaction } from '@/types/transaction'
import { Meta } from '@/types/meta'
import UserHeader from '@/components/layout/UserHeader'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'
import ReportsManager from '@/components/features/reports/ReportsManager'
import AlertsManager from '@/components/features/notifications/AlertsManager'
import BackupManager from '@/components/features/system/BackupManager'

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchTransactions(), fetchMetas()])
      setIsLoading(false)
    }
    
    loadData()
  }, [fetchTransactions, fetchMetas])

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <UserHeader />
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando dados...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          <UserHeader />
          
          <div className="text-center py-6 sm:py-10 md:py-12 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 text-white rounded-xl shadow-xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">📊 Analytics & Relatórios</h1>
            <p className="text-sm sm:text-lg md:text-xl text-indigo-100 dark:text-indigo-200">
              Análises, relatórios e alertas inteligentes
            </p>
          </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Transações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {transactions.length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Receitas (30d)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600 truncate">
                R$ {transactions
                  .filter(t => {
                    const transDate = new Date(t.date)
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return t.type === 'income' && transDate >= thirtyDaysAgo
                  })
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Despesas (30d)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-red-600 truncate">
                R$ {transactions
                  .filter(t => {
                    const transDate = new Date(t.date)
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return t.type === 'expense' && transDate >= thirtyDaysAgo
                  })
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Metas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {metas.length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ativas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="reports" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="reports" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2">
              <span>📄</span>
              <span className="hidden xs:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2">
              <span>🔔</span>
              <span className="hidden xs:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2">
              <span>💾</span>
              <span className="hidden xs:inline">Backup</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4 sm:space-y-6">
            <ReportsManager transactions={transactions} metas={metas} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4 sm:space-y-6">
            <AlertsManager transactions={transactions} metas={metas} />
          </TabsContent>

          <TabsContent value="backup" className="space-y-4 sm:space-y-6">
            <BackupManager transactions={transactions} metas={metas} />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}

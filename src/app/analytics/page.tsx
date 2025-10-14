'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Transaction } from '@/types/transaction'
import { Meta } from '@/types/meta'
import { Navigation } from '@/components/layout/Navigation'
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando dados...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            📊 Analytics & Relatórios
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sistema avançado de análises, relatórios e alertas inteligentes
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {transactions.length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Registros no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Receitas (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
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
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Despesas (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
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
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Metas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metas.length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Objetivos cadastrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <span>📄</span>
              <span>Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <span>🔔</span>
              <span>Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center space-x-2">
              <span>💾</span>
              <span>Backup</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <ReportsManager transactions={transactions} metas={metas} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsManager transactions={transactions} metas={metas} />
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <BackupManager transactions={transactions} metas={metas} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

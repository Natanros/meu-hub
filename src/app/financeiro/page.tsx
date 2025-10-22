'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/useToast'
import { TransactionForm } from '@/components/features/transactions/TransactionForm'
import { TransactionsList } from '@/components/features/transactions/TransactionsList'
import { Navigation } from '@/components/layout/Navigation'
import UserHeader from '@/components/layout/UserHeader'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'
import { ExportControls } from '@/components/features/system/ExportControls'
import { VoiceTextInput } from '@/components/features/transactions/VoiceTextInput'
import FinancialReport from '@/components/features/financial/FinancialReport'
import UpcomingPaymentsDashboard from '@/components/features/financial/UpcomingPaymentsDashboard'
import { useFinancialData } from '@/hooks/useFinancialData'
import { FinancialSummaryCards } from '@/components/features/financial/FinancialSummaryCards'

export default function FinanceiroModerno() {
  const { transactions, metas, summary, loading, refreshData } = useFinancialData();
  const { showToast } = useToast();

  // Handlers
  const handleTransactionChange = (message: string) => {
    refreshData();
    showToast(message, 'success');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <UserHeader />
          <Navigation />
          
          <div className="text-center py-8 sm:py-12 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 text-white rounded-lg shadow-xl">
            <h1 className="text-3xl sm:text-5xl font-bold mb-3">💰 Centro Financeiro</h1>
            <p className="text-lg sm:text-xl text-green-100 dark:text-green-200">
              Controle completo das suas finanças pessoais
            </p>
          </div>

          <FinancialSummaryCards summary={summary} loading={loading} />

          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Coluna Esquerda - Formulários */}
            <div className="space-y-6">
              
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    🎤 Entrada por Voz (IA)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VoiceTextInput 
                    onTransactionAdded={() => handleTransactionChange('Transação via IA adicionada!')} 
                    metas={metas}
                    showToast={showToast}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    ✏️ Adicionar Transação Manual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionForm 
                    onTransactionAdded={() => handleTransactionChange('Transação adicionada com sucesso!')}
                    metas={metas}
                    showToast={showToast}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    📅 Próximos Pagamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UpcomingPaymentsDashboard transactions={transactions} />
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita - Listas e Relatórios */}
            <div className="space-y-6">
              
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    📊 Controles e Exportação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ExportControls transactions={transactions} metas={metas} />
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    📋 Transações Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>                
                  <TransactionsList 
                    transactions={transactions}
                    onTransactionDeleted={() => handleTransactionChange('Transação excluída com sucesso!')}
                    metas={metas}
                    showToast={showToast}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Relatórios Financeiros */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                📈 Relatórios e Análises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialReport transactions={transactions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

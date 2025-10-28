'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/useToast'
import { TransactionForm } from '@/components/features/transactions/TransactionForm'
import { TransactionsList } from '@/components/features/transactions/TransactionsList'
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          <UserHeader />
          
          <div className="text-center py-6 sm:py-10 md:py-12 px-4 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 text-white rounded-xl shadow-xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">💰 Centro Financeiro</h1>
            <p className="text-sm sm:text-lg md:text-xl text-green-100 dark:text-green-200">
              Controle completo das suas finanças
            </p>
          </div>

          <FinancialSummaryCards summary={summary} loading={loading} />

          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Coluna Esquerda - Formulários */}
            <div className="space-y-4 sm:space-y-6">
              
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                    🎤 <span className="hidden sm:inline">Entrada por Voz</span><span className="sm:hidden">Voz</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <VoiceTextInput 
                    onTransactionAdded={() => handleTransactionChange('Transação via voz adicionada!')} 
                    metas={metas}
                    showToast={showToast}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                    ✏️ <span className="hidden sm:inline">Adicionar Transação Manual</span><span className="sm:hidden">Nova Transação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <TransactionForm 
                    onTransactionAdded={() => handleTransactionChange('Transação adicionada com sucesso!')}
                    metas={metas}
                    showToast={showToast}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                    📅 Próximos Pagamentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <UpcomingPaymentsDashboard transactions={transactions} />
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita - Listas e Relatórios */}
            <div className="space-y-4 sm:space-y-6">
              
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                    📊 <span className="hidden sm:inline">Controles e Exportação</span><span className="sm:hidden">Exportar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ExportControls transactions={transactions} metas={metas} />
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                    📋 Transações Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">                
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                📈 Relatórios e Análises
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <FinancialReport transactions={transactions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Transaction {
  id: number
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  date: string
  metaId?: string
}

interface Meta {
  id: string
  nome: string
  valor: number
}

interface TransactionsListProps {
  transactions: Transaction[]
  metas: Meta[]
  showToast: (message: string, type: 'success' | 'error') => void
  onTransactionDeleted: () => void
}

export function TransactionsList({ transactions, metas, showToast, onTransactionDeleted }: TransactionsListProps) {
  const deleteTransaction = async (id: number) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar transação')
      }

      showToast('Transação removida com sucesso!', 'success')
      onTransactionDeleted()
    } catch (error) {
      console.error('Erro ao deletar transação:', error)
      showToast('Erro ao remover transação', 'error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const getMetaName = (metaId?: string) => {
    if (!metaId) return null
    const meta = metas.find(m => m.id === metaId)
    return meta ? meta.nome : null
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-t-4 border-t-purple-500">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg p-3 sm:p-4">
        <CardTitle className="dark:text-white flex items-center gap-2 text-sm sm:text-base">
          📋 Histórico de Transações
          <span className="hidden sm:inline text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
            {transactions.length} ITENS
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl sm:text-6xl mb-4">💸</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nenhuma transação encontrada
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Adicione sua primeira transação usando o formulário acima
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...transactions]
              .sort((a, b) => {
                // Primeiro ordena por data (mais recente primeiro)
                const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
                
                // Se as datas são iguais, ordena por ID decrescente (mais recente primeiro)
                if (dateCompare === 0) {
                  return b.id - a.id;
                }
                
                return dateCompare;
              })
              .slice(0, 10)
              .map((transaction) => {
              const metaName = getMetaName(transaction.metaId)
              
              return (
                <div 
                  key={transaction.id}
                  className={`p-3 sm:p-4 rounded-lg border-l-4 shadow-sm transition-all hover:shadow-md ${
                    transaction.type === 'income' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-l-green-500' 
                      : 'bg-red-50 dark:bg-red-900/20 border-l-red-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '💰' : '💸'}
                        </span>
                        <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                          {transaction.category}
                        </span>
                        {metaName && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                            🎯 {metaName}
                          </span>
                        )}
                      </div>
                      
                      {transaction.description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {transaction.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>📅 {formatDate(transaction.date)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-sm sm:text-lg ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {transactions.length > 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mostrando as 10 transações mais recentes de {transactions.length} total
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

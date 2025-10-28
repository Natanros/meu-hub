'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addPendingTransaction } from '@/lib/indexedDB'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { getCurrentDateLocal } from '@/lib/dateUtils'

interface Meta {
  id: string
  nome: string
  valor: number
}

interface TransactionFormProps {
  onTransactionAdded: () => void
  metas: Meta[]
  showToast: (message: string, type: 'success' | 'error') => void
}

export function TransactionForm({ onTransactionAdded, metas, showToast }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    amount: '',
    description: '',
    date: getCurrentDateLocal(), // ✅ Usa data local correta
    metaId: '',
    installments: '1'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isOnline = useOnlineStatus()

  const categoriesIncome = [
    'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presente', 
    'Bonificação', 'Restituição', 'Rendimento', 'Outros'
  ]

  const categoriesExpense = [
    'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação',
    'Lazer', 'Vestuário', 'Tecnologia', 'Mercado', 'Restaurante',
    'Combustível', 'Farmácia', 'Shopping', 'Conta de Luz',
    'Conta de Água', 'Internet', 'Telefone', 'Outros'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.category || !formData.amount || !formData.date) {
      showToast('Preencha todos os campos obrigatórios', 'error')
      return
    }

    setIsSubmitting(true)

    const transactionData = {
      type: formData.type as 'income' | 'expense',
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description || formData.category,
      date: formData.date,
      metaId: formData.metaId || undefined,
      installments: parseInt(formData.installments) || 1,
      recurrence: parseInt(formData.installments) > 1 ? 'monthly' : undefined,
    };

    if (!isOnline) {
      try {
        // Omitimos o ID, pois será gerado pelo IndexedDB
        const { ...txDataForDB } = transactionData;
        await addPendingTransaction(txDataForDB);
        showToast('Você está offline. Transação salva localmente!', 'success');
        resetForm();
        // Dispara um evento para notificar o SyncManager a atualizar a contagem
        window.dispatchEvent(new CustomEvent('local-transaction-added'));
      } catch (error) {
        showToast('Erro ao salvar transação offline.', 'error');
        console.error('Erro no IndexedDB:', error);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar transação')
      }

      const result = await response.json();

      if (result.success) {
        // Transação parcelada
        showToast(result.message, "success");
      } else {
        // Transação única
        showToast("✅ Transação salva com sucesso!", "success");
      }

      // Reset form
      resetForm();

      onTransactionAdded();
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
      showToast('Erro ao adicionar transação', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      type: '',
      category: '',
      amount: '',
      description: '',
      date: getCurrentDateLocal(), // ✅ Usa data local correta
      metaId: '',
      installments: '1'
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-t-4 border-t-blue-500">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg p-3 sm:p-4">
        <CardTitle className="dark:text-white flex items-center gap-2 text-sm sm:text-base">
          💰 <span className="hidden xs:inline">Adicionar Transação</span><span className="xs:hidden">Nova</span>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full font-medium ml-auto">
            NOVA
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Tipo de Transação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                Tipo *
              </label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white h-10 sm:h-11 text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">💰 Receita</SelectItem>
                  <SelectItem value="expense">💸 Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                Categoria *
              </label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
                disabled={!formData.type}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white h-10 sm:h-11 text-sm">
                  <SelectValue placeholder={formData.type ? "Categoria" : "Tipo primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {(formData.type === 'income' ? categoriesIncome : categoriesExpense).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Valor, Parcelas e Data */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                Valor *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white h-10 sm:h-11 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                Parcelas
              </label>
              <Select value={formData.installments} onValueChange={(value) => handleInputChange('installments', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white h-10 sm:h-11 text-sm">
                  <SelectValue placeholder="1x" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="3">3x</SelectItem>
                  <SelectItem value="4">4x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
                  <SelectItem value="6">6x</SelectItem>
                  <SelectItem value="7">7x</SelectItem>
                  <SelectItem value="8">8x</SelectItem>
                  <SelectItem value="9">9x</SelectItem>
                  <SelectItem value="10">10x</SelectItem>
                  <SelectItem value="11">11x</SelectItem>
                  <SelectItem value="12">12x</SelectItem>
                </SelectContent>
              </Select>
              {parseInt(formData.installments) > 1 && formData.amount && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.installments}x R$ {(parseFloat(formData.amount) / parseInt(formData.installments)).toFixed(2)}
                </p>
              )}
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                Data *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white h-10 sm:h-11 text-sm"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
              Descrição
            </label>
            <Input
              type="text"
              placeholder="Descrição opcional"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white h-10 sm:h-11 text-sm"
            />
          </div>

          {/* Meta (opcional) */}
          {metas.length > 0 && (
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                Meta (opcional)
              </label>
              <div className="flex gap-2">
                <Select value={formData.metaId || undefined} onValueChange={(value) => handleInputChange('metaId', value || '')}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-1 h-10 sm:h-11 text-sm">
                    <SelectValue placeholder="Selecione uma meta" />
                  </SelectTrigger>
                  <SelectContent>
                    {metas.map((meta) => (
                      <SelectItem key={meta.id} value={meta.id}>
                        🎯 {meta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.metaId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleInputChange('metaId', '')}
                    className="px-3 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 h-10 sm:h-11 flex-shrink-0"
                  >
                    ✖️
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white h-10 sm:h-11 text-sm font-medium"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  Adicionar
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 h-10 sm:h-11 text-sm"
            >
              🗑️ Limpar
            </Button>
          </div>
        </form>

        {/* Dicas */}
        <div className="hidden sm:block mt-4 sm:mt-6 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Dicas rápidas:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Use categorias específicas para melhor controle</li>
            <li>• Descrições ajudam a lembrar do contexto</li>
            <li>• Vincule a metas para acompanhar objetivos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addPendingTransaction } from '@/lib/indexedDB'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { getCurrentDateLocal } from '@/lib/dateUtils'
import { Meta } from '@/types'

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

      // Verifica se novas conquistas foram desbloqueadas e mostra um toast
      if (result.newAchievements && Array.isArray(result.newAchievements)) {
        result.newAchievements.forEach((ach: { name: string }) => {
          showToast(`🏆 Conquista Desbloqueada: ${ach.name}!`, "success");
        });
      }

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
          💰 Adicionar Transação
          <span className="hidden sm:inline text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
            NOVA
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Transação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Tipo *
              </label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">💰 Receita</SelectItem>
                  <SelectItem value="expense">💸 Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Categoria *
              </label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
                disabled={!formData.type}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder={formData.type ? "Selecione a categoria" : "Escolha o tipo primeiro"} />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Valor (R$) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Parcelas
              </label>
              <Select value={formData.installments} onValueChange={(value) => handleInputChange('installments', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="1x" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x (À vista)</SelectItem>
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
                  💰 {formData.installments}x de R$ {(parseFloat(formData.amount) / parseInt(formData.installments)).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Data *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Descrição
            </label>
            <Input
              type="text"
              placeholder="Descrição opcional da transação"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Meta (opcional) */}
          {metas.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Vincular à Meta (opcional)
              </label>
              <div className="flex gap-2">
                <Select value={formData.metaId || undefined} onValueChange={(value) => handleInputChange('metaId', value || '')}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-1">
                    <SelectValue placeholder="Selecione uma meta (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {metas.map((meta) => (
                      <SelectItem key={meta.id} value={meta.id}>
                        🎯 {meta.nome} (R$ {meta.valor.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.metaId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleInputChange('metaId', '')}
                    className="px-3 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    ✖️
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  Adicionar Transação
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              🗑️ Limpar
            </Button>
          </div>
        </form>

        {/* Dicas */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
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

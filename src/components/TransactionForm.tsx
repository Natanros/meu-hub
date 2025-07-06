'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    date: new Date().toISOString().split('T')[0],
    metaId: '',
    installments: '1'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    try {
      const installments = parseInt(formData.installments) || 1
      const totalAmount = parseFloat(formData.amount)
      const installmentAmount = installments > 1 ? totalAmount / installments : totalAmount

      if (installments > 1) {
        // Criar múltiplas transações para parcelas
        const promises = []
        const baseDate = new Date(formData.date)
        
        for (let i = 0; i < installments; i++) {
          const installmentDate = new Date(baseDate)
          installmentDate.setMonth(installmentDate.getMonth() + i)
          
          const description = `${formData.description || formData.category} (${i + 1}/${installments})`
          
          promises.push(
            fetch('/api/transactions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: formData.type,
                category: formData.category,
                amount: installmentAmount,
                description,
                date: installmentDate.toISOString(),
                metaId: formData.metaId || null,
                installments: installments,
                recurrence: 'monthly'
              }),
            })
          )
        }
        
        const responses = await Promise.all(promises)
        const failedResponses = responses.filter(r => !r.ok)
        
        if (failedResponses.length > 0) {
          throw new Error(`Erro ao salvar ${failedResponses.length} parcela(s)`)
        }
        
        showToast(`✨ ${installments} parcelas criadas: ${installments}x de R$ ${installmentAmount.toFixed(2)}`, 'success')
      } else {
        // Transação única
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: formData.type,
            category: formData.category,
            amount: totalAmount,
            description: formData.description || null,
            date: new Date(formData.date).toISOString(),
            metaId: formData.metaId || null
          }),
        })

        if (!response.ok) {
          throw new Error('Erro ao salvar transação')
        }
        
        showToast('Transação adicionada com sucesso!', 'success')
      }
      
      // Reset form
      setFormData({
        type: '',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        metaId: '',
        installments: '1'
      })

      onTransactionAdded()
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
      showToast('Erro ao adicionar transação', 'error')
    } finally {
      setIsSubmitting(false)
    }
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
                  <SelectItem value="12">12x</SelectItem>
                  <SelectItem value="24">24x</SelectItem>
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
              onClick={() => setFormData({
                type: '',
                category: '',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                metaId: '',
                installments: '1'
              })}
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

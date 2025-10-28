'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import UserHeader from '@/components/layout/UserHeader'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'
import { useToast } from '@/hooks/useToast'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: '', type: 'expense' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()

  // Fetch categorias
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        showToast('Erro ao carregar categorias', 'error')
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      showToast('Erro ao carregar categorias', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Criar categoria
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      showToast('Nome da categoria é obrigatório', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Categoria criada com sucesso!', 'success')
        setFormData({ name: '', type: 'expense' })
        fetchCategories()
      } else {
        showToast(data.error || 'Erro ao criar categoria', 'error')
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      showToast('Erro ao criar categoria', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Deletar categoria
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) return

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Categoria excluída com sucesso!', 'success')
        fetchCategories()
      } else {
        showToast(data.error || 'Erro ao excluir categoria', 'error')
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      showToast('Erro ao excluir categoria', 'error')
    }
  }

  const expenseCategories = categories.filter(c => c.type === 'expense')
  const incomeCategories = categories.filter(c => c.type === 'income')

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          <UserHeader />
          
          <div className="text-center py-6 sm:py-10 md:py-12 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white rounded-xl shadow-xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">🏷️ Categorias</h1>
            <p className="text-sm sm:text-lg md:text-xl text-indigo-100 dark:text-indigo-200">
              Gerencie suas categorias personalizadas
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Formulário de Criação */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl sticky top-4">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    ➕ Nova Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                        Nome *
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: Educação"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="dark:bg-gray-700 dark:border-gray-600 h-10 sm:h-11 text-sm"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                        Tipo *
                      </label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 h-10 sm:h-11 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">💸 Despesa</SelectItem>
                          <SelectItem value="income">💰 Receita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 sm:h-11 text-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '⏳ Criando...' : '➕ Criar Categoria'}
                    </Button>
                  </form>

                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      ℹ️ Informações:
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Categorias padrão não podem ser excluídas</li>
                      <li>• Não é possível excluir categorias em uso</li>
                      <li>• Crie categorias específicas para seu controle</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Listas de Categorias */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {loading ? (
                <Card className="shadow-xl">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <div className="animate-spin text-3xl sm:text-4xl mb-4">⏳</div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Carregando...</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Categorias de Despesas */}
                  <Card className="shadow-xl">
                    <CardHeader className="bg-red-50 dark:bg-red-900/20 p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        💸 Categorias de Despesas ({expenseCategories.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      {expenseCategories.length === 0 ? (
                        <p className="text-sm text-center text-gray-500 py-4">
                          Nenhuma categoria de despesa
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {expenseCategories.map((category) => (
                            <div
                              key={category.id}
                              className={`p-3 rounded-lg border-2 ${
                                category.isDefault
                                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                                  : 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {category.name}
                                  </p>
                                  {category.isDefault && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      📌 Padrão
                                    </p>
                                  )}
                                </div>
                                {!category.isDefault && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(category.id, category.name)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 ml-2"
                                  >
                                    🗑️
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Categorias de Receitas */}
                  <Card className="shadow-xl">
                    <CardHeader className="bg-green-50 dark:bg-green-900/20 p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        💰 Categorias de Receitas ({incomeCategories.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      {incomeCategories.length === 0 ? (
                        <p className="text-sm text-center text-gray-500 py-4">
                          Nenhuma categoria de receita
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {incomeCategories.map((category) => (
                            <div
                              key={category.id}
                              className={`p-3 rounded-lg border-2 ${
                                category.isDefault
                                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                                  : 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {category.name}
                                  </p>
                                  {category.isDefault && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      📌 Padrão
                                    </p>
                                  )}
                                </div>
                                {!category.isDefault && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(category.id, category.name)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 ml-2"
                                  >
                                    🗑️
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import UserHeader from '@/components/layout/UserHeader'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'
import { useToast } from '@/hooks/useToast'
import { Transaction } from '@/types/transaction'

interface Meta {
  id: string
  nome: string
  valor: number
  userId: string
  createdAt: string
  updatedAt: string
}

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ nome: '', valor: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()

  // Fetch metas e transações
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [metasRes, transactionsRes] = await Promise.all([
        fetch('/api/metas'),
        fetch('/api/transactions')
      ])

      if (metasRes.ok) {
        const metasData = await metasRes.json()
        setMetas(metasData)
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showToast('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calcular progresso de uma meta
  const calcularProgresso = (meta: Meta) => {
    const valorAcumulado = transactions
      .filter(t => t.metaId === meta.id)
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
    
    const percentual = Math.min(100, Math.round((valorAcumulado / meta.valor) * 100))
    return { valorAcumulado, percentual }
  }

  // Criar ou atualizar meta
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.valor) {
      showToast('Preencha todos os campos', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingId ? `/api/metas/${editingId}` : '/api/metas'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          valor: parseFloat(formData.valor)
        })
      })

      if (response.ok) {
        showToast(
          editingId ? 'Meta atualizada com sucesso!' : 'Meta criada com sucesso!',
          'success'
        )
        setFormData({ nome: '', valor: '' })
        setEditingId(null)
        fetchData()
      } else {
        throw new Error('Erro ao salvar meta')
      }
    } catch (error) {
      console.error('Erro ao salvar meta:', error)
      showToast('Erro ao salvar meta', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Editar meta
  const handleEdit = (meta: Meta) => {
    setFormData({ nome: meta.nome, valor: meta.valor.toString() })
    setEditingId(meta.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancelar edição
  const handleCancelEdit = () => {
    setFormData({ nome: '', valor: '' })
    setEditingId(null)
  }

  // Deletar meta
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return

    try {
      const response = await fetch(`/api/metas/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showToast('Meta excluída com sucesso!', 'success')
        fetchData()
      } else {
        throw new Error('Erro ao excluir meta')
      }
    } catch (error) {
      console.error('Erro ao excluir meta:', error)
      showToast('Erro ao excluir meta', 'error')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <UserHeader />
          
          <div className="text-center py-8 sm:py-12 bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-700 dark:to-teal-700 text-white rounded-lg shadow-xl">
            <h1 className="text-3xl sm:text-5xl font-bold mb-3">🏁 Minhas Metas</h1>
            <p className="text-lg sm:text-xl text-green-100 dark:text-green-200">
              Defina e acompanhe seus objetivos financeiros
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Formulário de Criação/Edição */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl sticky top-4">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-600">
                  <CardTitle className="flex items-center gap-2">
                    {editingId ? '✏️ Editar Meta' : '➕ Nova Meta'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nome da Meta *
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: Viagem de férias"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="dark:bg-gray-700 dark:border-gray-600"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor Alvo (R$) *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        className="dark:bg-gray-700 dark:border-gray-600"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '⏳ Salvando...' : editingId ? '💾 Atualizar' : '➕ Criar Meta'}
                      </Button>
                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isSubmitting}
                        >
                          ✖️
                        </Button>
                      )}
                    </div>
                  </form>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      💡 Dica:
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Ao criar uma transação, você pode vinculá-la a uma meta para acompanhar seu progresso automaticamente!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Metas */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <Card className="shadow-xl">
                  <CardContent className="p-12 text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-gray-600 dark:text-gray-400">Carregando metas...</p>
                  </CardContent>
                </Card>
              ) : metas.length === 0 ? (
                <Card className="shadow-xl">
                  <CardContent className="p-12 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold mb-2">Nenhuma meta cadastrada</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Crie sua primeira meta para começar a acompanhar seus objetivos!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                metas.map((meta) => {
                  const { valorAcumulado, percentual } = calcularProgresso(meta)
                  const atingida = valorAcumulado >= meta.valor

                  return (
                    <Card key={meta.id} className={`shadow-xl ${atingida ? 'border-2 border-green-500' : ''}`}>
                      <CardHeader className={`${atingida ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 mb-2">
                              {atingida ? '🎉' : '🎯'} {meta.nome}
                            </CardTitle>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                R$ {valorAcumulado.toFixed(2)}
                              </span>
                              {' / '}
                              <span className="font-semibold">
                                R$ {meta.valor.toFixed(2)}
                              </span>
                              {' '}({percentual}%)
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(meta)}
                              className="px-3"
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(meta.id)}
                              className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <Progress value={percentual} className="h-4 mb-4" />
                        
                        {atingida && (
                          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border-2 border-green-500 mb-4">
                            <p className="text-green-800 dark:text-green-200 font-semibold text-center">
                              🎉 Parabéns! Você atingiu esta meta!
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Faltam</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400">
                              R$ {Math.max(0, meta.valor - valorAcumulado).toFixed(2)}
                            </p>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-400 mb-1">Transações</p>
                            <p className="font-bold text-purple-600 dark:text-purple-400">
                              {transactions.filter(t => t.metaId === meta.id).length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>

          {/* Estatísticas Gerais */}
          {metas.length > 0 && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>📊 Estatísticas Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Metas</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{metas.length}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Metas Atingidas</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {metas.filter(m => calcularProgresso(m).percentual >= 100).length}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Em Progresso</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {metas.filter(m => {
                        const p = calcularProgresso(m).percentual
                        return p > 0 && p < 100
                      }).length}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ainda não iniciadas</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {metas.filter(m => calcularProgresso(m).percentual === 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </ProtectedRoute>
  )
}

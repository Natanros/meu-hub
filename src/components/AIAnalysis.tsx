'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Transaction } from '@/types/transaction'

interface Meta {
  id: string
  nome: string
  valor: number
}

interface AIInsight {
  type: 'warning' | 'success' | 'info' | 'tip'
  title: string
  message: string
  icon: string
  action?: string
}

interface AIAnalysisProps {
  transactions: Transaction[]
  metas: Meta[]
  saldo: number
}

export function AIAnalysis({ transactions, metas, saldo }: AIAnalysisProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const regenerateInsights = () => {
    generateAnalysis()
  }

  const generateAnalysis = async () => {
    if (transactions.length === 0) return
    
    setIsAnalyzing(true)
    
    // Simular análise IA (em produção, seria uma chamada para API real)
    const newInsights: AIInsight[] = []

    // Análise de Saldo
    if (saldo < 0) {
      newInsights.push({
        type: 'warning',
        title: 'Saldo Negativo',
        message: `Saldo negativo de R$ ${Math.abs(saldo).toFixed(2)}. Revise seus gastos.`,
        icon: '⚠️',
        action: 'Ver'
      })
    } else if (saldo > 5000) {
      newInsights.push({
        type: 'success',
        title: 'Boa Reserva',
        message: `R$ ${saldo.toFixed(2)} disponível. Considere investir.`,
        icon: '💰',
        action: 'Inv'
      })
    }

    // Análise de Gastos por Categoria
    const gastosPorCategoria = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const categoriaComMaiorGasto = Object.entries(gastosPorCategoria)
      .sort(([,a], [,b]) => b - a)[0]

    if (categoriaComMaiorGasto && categoriaComMaiorGasto[1] > 1000) {
      newInsights.push({
        type: 'info',
        title: 'Maior Gasto',
        message: `R$ ${categoriaComMaiorGasto[1].toFixed(2)} em ${categoriaComMaiorGasto[0]} (${((categoriaComMaiorGasto[1] / transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)) * 100).toFixed(1)}%)`,
        icon: '📊',
        action: 'Ver'
      })
    }

    // Análise de Frequência de Transações
    const hoje = new Date()
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
    const transacoesRecentes = transactions.filter(t => new Date(t.date) >= seteDiasAtras)
    
    if (transacoesRecentes.length > 15) {
      newInsights.push({
        type: 'warning',
        title: 'Muitas Transações',
        message: `${transacoesRecentes.length} transações em 7 dias. Revise os gastos.`,
        icon: '🔄',
        action: 'Ver'
      })
    }

    // Análise de Metas
    if (metas.length === 0) {
      newInsights.push({
        type: 'tip',
        title: 'Defina Metas',
        message: 'Sem metas definidas. Estabeleça objetivos financeiros.',
        icon: '🎯',
        action: 'Add'
      })
    }

    // Análise de Tendência (últimos 30 dias vs 30 dias anteriores)
    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sessentaDiasAtras = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000)

    const gastosUltimos30 = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= trintaDiasAtras)
      .reduce((acc, t) => acc + t.amount, 0)

    const gastos30Anteriores = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= sessentaDiasAtras && new Date(t.date) < trintaDiasAtras)
      .reduce((acc, t) => acc + t.amount, 0)

    if (gastos30Anteriores > 0) {
      const percentualMudanca = ((gastosUltimos30 - gastos30Anteriores) / gastos30Anteriores) * 100

      if (percentualMudanca > 20) {
        newInsights.push({
          type: 'warning',
          title: 'Gastos Aumentaram',
          message: `+${percentualMudanca.toFixed(1)}% vs mês anterior. R$ ${gastosUltimos30.toFixed(2)} vs R$ ${gastos30Anteriores.toFixed(2)}`,
          icon: '📈',
          action: 'Ver'
        })
      } else if (percentualMudanca < -10) {
        newInsights.push({
          type: 'success',
          title: 'Gastos Reduziram',
          message: `Parabéns! -${Math.abs(percentualMudanca).toFixed(1)}% vs mês anterior.`,
          icon: '📉',
          action: 'Ver'
        })
      }
    }

    // Dicas Inteligentes
    const receitas = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
    const despesas = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    const taxaPoupanca = receitas > 0 ? ((receitas - despesas) / receitas) * 100 : 0

    if (taxaPoupanca < 10 && taxaPoupanca >= 0) {
      newInsights.push({
        type: 'tip',
        title: 'Poupe Mais',
        message: `Poupando ${taxaPoupanca.toFixed(1)}%. Ideal: 20%+`,
        icon: '🏦',
        action: 'Ver'
      })
    } else if (taxaPoupanca >= 20) {
      newInsights.push({
        type: 'success',
        title: 'Ótimo Poupador',
        message: `Poupando ${taxaPoupanca.toFixed(1)}%! Continue assim.`,
        icon: '⭐',
        action: 'Inv'
      })
    }

    // Simular delay da análise IA
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setInsights(newInsights)
    setIsAnalyzing(false)
  }

  const getInsightStyle = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
      case 'tip':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }

  const getTextColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'text-red-800 dark:text-red-300'
      case 'success':
        return 'text-green-800 dark:text-green-300'
      case 'info':
        return 'text-blue-800 dark:text-blue-300'
      case 'tip':
        return 'text-yellow-800 dark:text-yellow-300'
      default:
        return 'text-gray-800 dark:text-gray-300'
    }
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-t-4 border-t-indigo-500">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg p-3 sm:p-4">
        <CardTitle className="dark:text-white flex items-center gap-2 text-sm sm:text-base">
          🧠 Análise IA Automática
          <span className="hidden sm:inline text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full font-medium">
            AUTO ANALYSIS
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        {isAnalyzing ? (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">🤖 IA analisando seus dados financeiros...</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">Isso pode levar alguns segundos</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">📊 Adicione algumas transações para receber insights personalizados</p>
            <Button 
              onClick={regenerateInsights}
              className="mt-3 sm:mt-4 bg-indigo-500 hover:bg-indigo-600 text-sm sm:text-base px-3 sm:px-4 py-2"
            >
              🔄 Analisar Agora
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                📈 Insights Personalizados ({insights.length})
              </h3>
              <Button 
                onClick={regenerateInsights}
                variant="outline"
                size="sm"
                className="dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 text-xs sm:text-sm self-start sm:self-auto"
              >
                🔄 Atualizar
              </Button>
            </div>

            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 sm:p-4 rounded-lg border ${getInsightStyle(insight.type)}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{insight.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold mb-1 text-sm sm:text-base ${getTextColor(insight.type)}`}>
                      {insight.title}
                    </h4>
                    <p className={`text-xs sm:text-sm ${getTextColor(insight.type)} mb-2 sm:mb-3 break-words leading-relaxed`}>
                      {insight.message}
                    </p>
                    {insight.action && (
                      <div className="flex">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`${getTextColor(insight.type)} border-current hover:bg-current hover:text-white text-xs px-2 py-1 h-6 min-w-0 max-w-16 whitespace-nowrap overflow-hidden text-ellipsis`}
                        >
                          {insight.action}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

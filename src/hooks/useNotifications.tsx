<<<<<<< HEAD
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Transaction } from '@/types/transaction'

interface Meta {
  id: string
  nome: string
  valor: number
}

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  icon: string
  category: 'finance' | 'goals' | 'budget' | 'insights' | 'alerts'
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionable?: boolean
  action?: {
    label: string
    callback: () => void
  }
}

interface UseNotificationsProps {
  transactions?: Transaction[]
  metas?: Meta[]
  saldo?: number
}

export function useNotifications(props: UseNotificationsProps = {}) {
  const { transactions = [], metas = [], saldo = 0 } = props
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState({
    enableSmartAlerts: true,
    enableBudgetAlerts: true,
    enableGoalAlerts: true,
    enableInsights: true,
    criticalThreshold: 500, // Saldo crítico
    highSpendingThreshold: 40 // % de gastos em uma categoria
  })

  // Função para criar nova notificação
  const createNotification = (
    type: Notification['type'],
    title: string,
    message: string,
    icon: string,
    category: Notification['category'],
    priority: Notification['priority'] = 'medium',
    actionable: boolean = false,
    action?: Notification['action']
  ): Notification => ({
    id: `${Date.now()}-${Math.random()}`,
    type,
    title,
    message,
    timestamp: new Date(),
    read: false,
    icon,
    category,
    priority,
    actionable,
    action
  })

  // Análises inteligentes melhoradas
  const smartAnalysis = useMemo(() => {
    const analysis = {
      criticalAlerts: [] as Notification[],
      budgetAlerts: [] as Notification[],
      goalAlerts: [] as Notification[],
      insights: [] as Notification[],
      recommendations: [] as Notification[]
    }

    if (!settings.enableSmartAlerts) return analysis

    // 1. ALERTAS CRÍTICOS
    if (saldo < -settings.criticalThreshold) {
      analysis.criticalAlerts.push(
        createNotification(
          'error',
          '🚨 Situação Financeira Crítica',
          `Saldo negativo de R$ ${Math.abs(saldo).toFixed(2)}. Ação imediata necessária!`,
          '🚨',
          'alerts',
          'critical',
          true,
          {
            label: 'Ver Estratégias',
            callback: () => console.log('Abrir estratégias de recuperação')
          }
        )
      )
    }

    // Detecção de gastos muito elevados recentemente
    const ultimaSemana = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      const seteGiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return transactionDate >= seteGiasAtras && t.type === 'expense'
    })

    const gastosSemana = ultimaSemana.reduce((sum, t) => sum + t.amount, 0)
    if (gastosSemana > 1000) {
      analysis.criticalAlerts.push(
        createNotification(
          'warning',
          '⚠️ Gastos Elevados Detectados',
          `R$ ${gastosSemana.toFixed(2)} gastos nos últimos 7 dias. Monitore de perto!`,
          '⚠️',
          'budget',
          'high'
        )
      )
    }

    // 2. ALERTAS DE ORÇAMENTO
    if (settings.enableBudgetAlerts && transactions.length > 0) {
      const categorySpending = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        }, {} as Record<string, number>)

      const totalExpenses = Object.values(categorySpending).reduce((sum, val) => sum + val, 0)

      Object.entries(categorySpending).forEach(([category, amount]) => {
        const percentage = (amount / totalExpenses) * 100
        if (percentage > settings.highSpendingThreshold) {
          analysis.budgetAlerts.push(
            createNotification(
              'warning',
              `📊 ${category.charAt(0).toUpperCase() + category.slice(1)} em Alta`,
              `${percentage.toFixed(1)}% do orçamento (R$ ${amount.toFixed(2)}). Considere revisar.`,
              '📊',
              'budget',
              'medium',
              true,
              {
                label: 'Analisar Categoria',
                callback: () => console.log(`Analisar categoria: ${category}`)
              }
            )
          )
        }
      })

      // Alerta de gastos crescentes
      const ultimoMes = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        const umMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return transactionDate >= umMesAtras && t.type === 'expense'
      })

      const penultimoMes = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        const doisMesesAtras = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        const umMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return transactionDate >= doisMesesAtras && transactionDate < umMesAtras && t.type === 'expense'
      })

      const gastosUltimoMes = ultimoMes.reduce((sum, t) => sum + t.amount, 0)
      const gastosPenultimoMes = penultimoMes.reduce((sum, t) => sum + t.amount, 0)

      if (gastosPenultimoMes > 0) {
        const crescimento = ((gastosUltimoMes - gastosPenultimoMes) / gastosPenultimoMes) * 100
        if (crescimento > 20) {
          analysis.budgetAlerts.push(
            createNotification(
              'warning',
              '📈 Gastos em Crescimento',
              `Aumento de ${crescimento.toFixed(1)}% nos gastos vs mês anterior. Monitore!`,
              '📈',
              'budget',
              'medium'
            )
          )
        }
      }
    }

    // 3. ALERTAS DE METAS
    if (settings.enableGoalAlerts && metas.length > 0) {
      metas.forEach(meta => {
        const valorAcumulado = transactions
          .filter(t => t.metaId === meta.id)
          .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
        
        const progresso = (valorAcumulado / meta.valor) * 100

        if (progresso >= 100) {
          analysis.goalAlerts.push(
            createNotification(
              'success',
              '🎉 Meta Conquistada!',
              `Parabéns! Meta "${meta.nome}" atingida com ${progresso.toFixed(1)}%!`,
              '🎯',
              'goals',
              'high',
              true,
              {
                label: 'Definir Nova Meta',
                callback: () => console.log('Criar nova meta')
              }
            )
          )
        } else if (progresso >= 90) {
          analysis.goalAlerts.push(
            createNotification(
              'info',
              '🔥 Quase lá!',
              `Meta "${meta.nome}" está ${progresso.toFixed(1)}% completa. Faltam apenas R$ ${(meta.valor - valorAcumulado).toFixed(2)}!`,
              '🔥',
              'goals',
              'medium'
            )
          )
        } else if (progresso >= 75) {
          analysis.goalAlerts.push(
            createNotification(
              'info',
              '⚡ Boa evolução!',
              `Meta "${meta.nome}" está ${progresso.toFixed(1)}% completa. Continue focado!`,
              '⚡',
              'goals',
              'low'
            )
          )
        }

        // Alerta de meta estagnada
        const contribuicoesRecentes = transactions
          .filter(t => t.metaId === meta.id)
          .filter(t => {
            const transactionDate = new Date(t.date)
            const quinzeGiasAtras = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            return transactionDate >= quinzeGiasAtras
          })

        if (contribuicoesRecentes.length === 0 && progresso < 100 && progresso > 0) {
          analysis.goalAlerts.push(
            createNotification(
              'warning',
              '😴 Meta Parada',
              `Sem contribuições para "${meta.nome}" nos últimos 15 dias. Que tal retomar?`,
              '😴',
              'goals',
              'medium',
              true,
              {
                label: 'Adicionar Valor',
                callback: () => console.log(`Contribuir para meta: ${meta.nome}`)
              }
            )
          )
        }
      })
    } else if (settings.enableGoalAlerts && metas.length === 0) {
      analysis.goalAlerts.push(
        createNotification(
          'info',
          '🎯 Defina Suas Metas',
          'Metas claras ajudam a manter o foco financeiro. Que tal criar sua primeira meta?',
          '🎯',
          'goals',
          'low',
          true,
          {
            label: 'Criar Meta',
            callback: () => console.log('Criar primeira meta')
          }
        )
      )
    }

    // 4. INSIGHTS INTELIGENTES
    if (settings.enableInsights) {
      // Análise de padrões semanais
      const transacoesPorDiaSemana = transactions.reduce((acc, t) => {
        const day = new Date(t.date).getDay()
        acc[day] = (acc[day] || 0) + (t.type === 'expense' ? t.amount : 0)
        return acc
      }, {} as Record<number, number>)

      const diaComMaisGastos = Object.entries(transacoesPorDiaSemana)
        .sort(([,a], [,b]) => b - a)[0]

      if (diaComMaisGastos) {
        const nomeDia = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][parseInt(diaComMaisGastos[0])]
        analysis.insights.push(
          createNotification(
            'info',
            '📅 Padrão Semanal Detectado',
            `Você gasta mais às ${nomeDia}s (R$ ${diaComMaisGastos[1].toFixed(2)} em média). Planeje melhor esse dia!`,
            '📅',
            'insights',
            'low'
          )
        )
      }

      // Análise de transações duplicadas/similares
      const transacoesSimilares = transactions.filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const key = `${t.category}-${t.amount}`
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      const duplicadas = Object.entries(transacoesSimilares)
        .filter(([, count]) => count >= 3)

      if (duplicadas.length > 0) {
        analysis.insights.push(
          createNotification(
            'info',
            '🔄 Padrões Recorrentes',
            `Detectamos ${duplicadas.length} tipos de gastos recorrentes. Considere automatizar o controle!`,
            '🔄',
            'insights',
            'low'
          )
        )
      }
    }

    // 5. RECOMENDAÇÕES INTELIGENTES
    const totalReceitas = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    if (totalReceitas > 0) {
      const taxaEconomia = (saldo / totalReceitas) * 100
      
      if (taxaEconomia < 10 && saldo > 0) {
        analysis.recommendations.push(
          createNotification(
            'info',
            '💡 Oportunidade de Economia',
            `Taxa de economia: ${taxaEconomia.toFixed(1)}%. Meta recomendada: 20%. Que tal economizar mais?`,
            '💡',
            'insights',
            'medium'
          )
        )
      } else if (taxaEconomia > 30) {
        analysis.recommendations.push(
          createNotification(
            'success',
            '🌟 Excelente Controle!',
            `Taxa de economia: ${taxaEconomia.toFixed(1)}%! Considere investir o excedente.`,
            '🌟',
            'insights',
            'low'
          )
        )
      }
    }

    return analysis
  }, [transactions, metas, saldo, settings])

  // Atualizar notificações quando análise muda
  useEffect(() => {
    const allNewNotifications = [
      ...smartAnalysis.criticalAlerts,
      ...smartAnalysis.budgetAlerts,
      ...smartAnalysis.goalAlerts,
      ...smartAnalysis.insights,
      ...smartAnalysis.recommendations
    ]

    if (allNewNotifications.length > 0) {
      setNotifications(prev => {
        // Evitar duplicatas baseado no título
        const existingTitles = prev.map(n => n.title)
        const uniqueNotifications = allNewNotifications.filter(
          newNotif => !existingTitles.includes(newNotif.title)
        )
        
        if (uniqueNotifications.length > 0) {
          // Manter apenas as 15 notificações mais recentes
          const combined = [...uniqueNotifications, ...prev]
          return combined.slice(0, 15)
        }
        return prev
      })
    }
  }, [smartAnalysis])

  // Simulação de notificações periódicas inteligentes
  useEffect(() => {
    const smartTips = [
      {
        title: '💡 Dica Inteligente',
        message: 'Revisar gastos semanalmente aumenta o controle financeiro em 40%!',
        icon: '💡',
        category: 'insights' as const,
        priority: 'low' as const
      },
      {
        title: '📊 Insight do Dia',
        message: 'Pessoas que usam metas financeiras economizam 25% mais que a média.',
        icon: '📊',
        category: 'insights' as const,
        priority: 'low' as const
      },
      {
        title: '🎯 Motivação',
        message: 'Pequenas economias diárias geram grandes resultados ao longo do ano!',
        icon: '🎯',
        category: 'insights' as const,
        priority: 'low' as const
      }
    ]

    // Notificação a cada 10 minutos (em desenvolvimento - em produção seria menos frequente)
    const interval = setInterval(() => {
      if (settings.enableInsights) {
        const randomTip = smartTips[Math.floor(Math.random() * smartTips.length)]
        const tipNotification = createNotification(
          'info',
          randomTip.title,
          randomTip.message,
          randomTip.icon,
          randomTip.category,
          randomTip.priority
        )
        
        setNotifications(prev => {
          // Verificar se já existe uma notificação similar recente
          const hasRecentSimilar = prev.some(n => 
            n.title === tipNotification.title && 
            (Date.now() - n.timestamp.getTime()) < 30 * 60 * 1000 // 30 minutos
          )
          
          if (!hasRecentSimilar) {
            return [tipNotification, ...prev.slice(0, 14)]
          }
          return prev
        })
      }
    }, 10 * 60 * 1000) // 10 minutos

    return () => clearInterval(interval)
  }, [settings.enableInsights])

  // Funções de controle
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const clearRead = () => {
    setNotifications(prev => prev.filter(notif => !notif.read))
  }

  const clearByCategory = (category: Notification['category']) => {
    setNotifications(prev => prev.filter(notif => notif.category !== category))
  }

  // Adicionar notificação manual
  const addNotification = (
    type: Notification['type'],
    title: string,
    message: string,
    icon: string = '🔔',
    category: Notification['category'] = 'finance',
    priority: Notification['priority'] = 'medium'
  ) => {
    const notification = createNotification(type, title, message, icon, category, priority)
    setNotifications(prev => [notification, ...prev.slice(0, 14)])
  }

  // Estatísticas
  const unreadCount = notifications.filter(n => !n.read).length
  const totalCount = notifications.length
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length
  
  const notificationsByCategory = notifications.reduce((acc, notif) => {
    acc[notif.category] = (acc[notif.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const notificationsByPriority = notifications.reduce((acc, notif) => {
    acc[notif.priority] = (acc[notif.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const recentNotifications = notifications.filter(n => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return n.timestamp >= hourAgo
  })

  return {
    notifications,
    unreadCount,
    totalCount,
    criticalCount,
    notificationsByCategory,
    notificationsByPriority,
    recentNotifications,
    settings,
    setSettings,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    clearByCategory,
    addNotification,
    smartAnalysis
  }
}
=======
'use client'

import { useState, useEffect, useMemo } from 'react';
import { Transaction, Meta, Notification } from '@/types';

interface UseNotificationsProps {
  transactions?: Transaction[];
  metas?: Meta[];
  saldo?: number;
}

export function useNotifications(props: UseNotificationsProps = {}) {
  const { transactions = [], metas = [], saldo = 0 } = props
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState({
    enableSmartAlerts: true,
    enableBudgetAlerts: true,
    enableGoalAlerts: true,
    enableInsights: true,
    criticalThreshold: 500, // Saldo crítico
    highSpendingThreshold: 40 // % de gastos em uma categoria
  })

  // Função para criar nova notificação
  const createNotification = (
    type: Notification['type'],
    title: string,
    message: string,
    icon: string,
    category: Notification['category'],
    priority: Notification['priority'] = 'medium',
    actionable: boolean = false,
    action?: Notification['action']
  ): Notification => ({
    id: `${Date.now()}-${Math.random()}`,
    type,
    title,
    message,
    timestamp: new Date(),
    createdAt: new Date(),
    read: false,
    icon,
    category,
    priority,
    actionable,
    action
  })

  // Análises inteligentes melhoradas
  const smartAnalysis = useMemo(() => {
    const analysis = {
      criticalAlerts: [] as Notification[],
      budgetAlerts: [] as Notification[],
      goalAlerts: [] as Notification[],
      insights: [] as Notification[],
      recommendations: [] as Notification[]
    }

    if (!settings.enableSmartAlerts) return analysis

    // 1. ALERTAS CRÍTICOS
    if (saldo < -settings.criticalThreshold) {
      analysis.criticalAlerts.push(
        createNotification(
          'error',
          '🚨 Situação Financeira Crítica',
          `Saldo negativo de R$ ${Math.abs(saldo).toFixed(2)}. Ação imediata necessária!`,
          '🚨',
          'alerts',
          'critical',
          true,
          {
            label: 'Ver Estratégias',
            callback: () => console.log('Abrir estratégias de recuperação')
          }
        )
      )
    }

    // Detecção de gastos muito elevados recentemente
    const ultimaSemana = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      const seteGiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return transactionDate >= seteGiasAtras && t.type === 'expense'
    })

    const gastosSemana = ultimaSemana.reduce((sum, t) => sum + t.amount, 0)
    if (gastosSemana > 1000) {
      analysis.criticalAlerts.push(
        createNotification(
          'warning',
          '⚠️ Gastos Elevados Detectados',
          `R$ ${gastosSemana.toFixed(2)} gastos nos últimos 7 dias. Monitore de perto!`,
          '⚠️',
          'budget',
          'high'
        )
      )
    }

    // 2. ALERTAS DE ORÇAMENTO
    if (settings.enableBudgetAlerts && transactions.length > 0) {
      const categorySpending = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        }, {} as Record<string, number>)

      const totalExpenses = Object.values(categorySpending).reduce((sum, val) => sum + val, 0)

      Object.entries(categorySpending).forEach(([category, amount]) => {
        const percentage = (amount / totalExpenses) * 100
        if (percentage > settings.highSpendingThreshold) {
          analysis.budgetAlerts.push(
            createNotification(
              'warning',
              `📊 ${category.charAt(0).toUpperCase() + category.slice(1)} em Alta`,
              `${percentage.toFixed(1)}% do orçamento (R$ ${amount.toFixed(2)}). Considere revisar.`,
              '📊',
              'budget',
              'medium',
              true,
              {
                label: 'Analisar Categoria',
                callback: () => console.log(`Analisar categoria: ${category}`)
              }
            )
          )
        }
      })

      // Alerta de gastos crescentes
      const ultimoMes = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        const umMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return transactionDate >= umMesAtras && t.type === 'expense'
      })

      const penultimoMes = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        const doisMesesAtras = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        const umMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return transactionDate >= doisMesesAtras && transactionDate < umMesAtras && t.type === 'expense'
      })

      const gastosUltimoMes = ultimoMes.reduce((sum, t) => sum + t.amount, 0)
      const gastosPenultimoMes = penultimoMes.reduce((sum, t) => sum + t.amount, 0)

      if (gastosPenultimoMes > 0) {
        const crescimento = ((gastosUltimoMes - gastosPenultimoMes) / gastosPenultimoMes) * 100
        if (crescimento > 20) {
          analysis.budgetAlerts.push(
            createNotification(
              'warning',
              '📈 Gastos em Crescimento',
              `Aumento de ${crescimento.toFixed(1)}% nos gastos vs mês anterior. Monitore!`,
              '📈',
              'budget',
              'medium'
            )
          )
        }
      }
    }

    // 3. ALERTAS DE METAS
    if (settings.enableGoalAlerts && metas.length > 0) {
      metas.forEach(meta => {
        const valorAcumulado = transactions
          .filter(t => t.metaId === meta.id)
          .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
        
        const progresso = (valorAcumulado / meta.valor) * 100

        if (progresso >= 100) {
          analysis.goalAlerts.push(
            createNotification(
              'success',
              '🎉 Meta Conquistada!',
              `Parabéns! Meta "${meta.nome}" atingida com ${progresso.toFixed(1)}%!`,
              '🎯',
              'goals',
              'high',
              true,
              {
                label: 'Definir Nova Meta',
                callback: () => console.log('Criar nova meta')
              }
            )
          )
        } else if (progresso >= 90) {
          analysis.goalAlerts.push(
            createNotification(
              'info',
              '🔥 Quase lá!',
              `Meta "${meta.nome}" está ${progresso.toFixed(1)}% completa. Faltam apenas R$ ${(meta.valor - valorAcumulado).toFixed(2)}!`,
              '🔥',
              'goals',
              'medium'
            )
          )
        } else if (progresso >= 75) {
          analysis.goalAlerts.push(
            createNotification(
              'info',
              '⚡ Boa evolução!',
              `Meta "${meta.nome}" está ${progresso.toFixed(1)}% completa. Continue focado!`,
              '⚡',
              'goals',
              'low'
            )
          )
        }

        // Alerta de meta estagnada
        const contribuicoesRecentes = transactions
          .filter(t => t.metaId === meta.id)
          .filter(t => {
            const transactionDate = new Date(t.date)
            const quinzeGiasAtras = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            return transactionDate >= quinzeGiasAtras
          })

        if (contribuicoesRecentes.length === 0 && progresso < 100 && progresso > 0) {
          analysis.goalAlerts.push(
            createNotification(
              'warning',
              '😴 Meta Parada',
              `Sem contribuições para "${meta.nome}" nos últimos 15 dias. Que tal retomar?`,
              '😴',
              'goals',
              'medium',
              true,
              {
                label: 'Adicionar Valor',
                callback: () => console.log(`Contribuir para meta: ${meta.nome}`)
              }
            )
          )
        }
      })
    } else if (settings.enableGoalAlerts && metas.length === 0) {
      analysis.goalAlerts.push(
        createNotification(
          'info',
          '🎯 Defina Suas Metas',
          'Metas claras ajudam a manter o foco financeiro. Que tal criar sua primeira meta?',
          '🎯',
          'goals',
          'low',
          true,
          {
            label: 'Criar Meta',
            callback: () => console.log('Criar primeira meta')
          }
        )
      )
    }

    // 4. INSIGHTS INTELIGENTES
    if (settings.enableInsights) {
      // Análise de padrões semanais
      const transacoesPorDiaSemana = transactions.reduce((acc, t) => {
        const day = new Date(t.date).getDay()
        acc[day] = (acc[day] || 0) + (t.type === 'expense' ? t.amount : 0)
        return acc
      }, {} as Record<number, number>)

      const diaComMaisGastos = Object.entries(transacoesPorDiaSemana)
        .sort(([,a], [,b]) => b - a)[0]

      if (diaComMaisGastos) {
        const nomeDia = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][parseInt(diaComMaisGastos[0])]
        analysis.insights.push(
          createNotification(
            'info',
            '📅 Padrão Semanal Detectado',
            `Você gasta mais às ${nomeDia}s (R$ ${diaComMaisGastos[1].toFixed(2)} em média). Planeje melhor esse dia!`,
            '📅',
            'insights',
            'low'
          )
        )
      }

      // Análise de transações duplicadas/similares
      const transacoesSimilares = transactions.filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const key = `${t.category}-${t.amount}`
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      const duplicadas = Object.entries(transacoesSimilares)
        .filter(([, count]) => count >= 3)

      if (duplicadas.length > 0) {
        analysis.insights.push(
          createNotification(
            'info',
            '🔄 Padrões Recorrentes',
            `Detectamos ${duplicadas.length} tipos de gastos recorrentes. Considere automatizar o controle!`,
            '🔄',
            'insights',
            'low'
          )
        )
      }
    }

    // 5. RECOMENDAÇÕES INTELIGENTES
    const totalReceitas = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    if (totalReceitas > 0) {
      const taxaEconomia = (saldo / totalReceitas) * 100
      
      if (taxaEconomia < 10 && saldo > 0) {
        analysis.recommendations.push(
          createNotification(
            'info',
            '💡 Oportunidade de Economia',
            `Taxa de economia: ${taxaEconomia.toFixed(1)}%. Meta recomendada: 20%. Que tal economizar mais?`,
            '💡',
            'insights',
            'medium'
          )
        )
      } else if (taxaEconomia > 30) {
        analysis.recommendations.push(
          createNotification(
            'success',
            '🌟 Excelente Controle!',
            `Taxa de economia: ${taxaEconomia.toFixed(1)}%! Considere investir o excedente.`,
            '🌟',
            'insights',
            'low'
          )
        )
      }
    }

    return analysis
  }, [transactions, metas, saldo, settings])

  // Atualizar notificações quando análise muda
  useEffect(() => {
    const allNewNotifications = [
      ...smartAnalysis.criticalAlerts,
      ...smartAnalysis.budgetAlerts,
      ...smartAnalysis.goalAlerts,
      ...smartAnalysis.insights,
      ...smartAnalysis.recommendations
    ]

    if (allNewNotifications.length > 0) {
      setNotifications(prev => {
        // Evitar duplicatas baseado no título
        const existingTitles = prev.map(n => n.title)
        const uniqueNotifications = allNewNotifications.filter(
          newNotif => !existingTitles.includes(newNotif.title)
        )
        
        if (uniqueNotifications.length > 0) {
          // Manter apenas as 15 notificações mais recentes
          const combined = [...uniqueNotifications, ...prev]
          return combined.slice(0, 15)
        }
        return prev
      })
    }
  }, [smartAnalysis])

  // Simulação de notificações periódicas inteligentes
  useEffect(() => {
    const smartTips = [
      {
        title: '💡 Dica Inteligente',
        message: 'Revisar gastos semanalmente aumenta o controle financeiro em 40%!',
        icon: '💡',
        category: 'insights' as const,
        priority: 'low' as const
      },
      {
        title: '📊 Insight do Dia',
        message: 'Pessoas que usam metas financeiras economizam 25% mais que a média.',
        icon: '📊',
        category: 'insights' as const,
        priority: 'low' as const
      },
      {
        title: '🎯 Motivação',
        message: 'Pequenas economias diárias geram grandes resultados ao longo do ano!',
        icon: '🎯',
        category: 'insights' as const,
        priority: 'low' as const
      }
    ]

    // Notificação a cada 10 minutos (em desenvolvimento - em produção seria menos frequente)
    const interval = setInterval(() => {
      if (settings.enableInsights) {
        const randomTip = smartTips[Math.floor(Math.random() * smartTips.length)]
        const tipNotification = createNotification(
          'info',
          randomTip.title,
          randomTip.message,
          randomTip.icon,
          randomTip.category,
          randomTip.priority
        )
        
        setNotifications(prev => {
          // Verificar se já existe uma notificação similar recente
          const hasRecentSimilar = prev.some(n => 
            n.title === tipNotification.title && 
            n.timestamp &&
            (Date.now() - n.timestamp.getTime()) < 30 * 60 * 1000 // 30 minutos
          )
          
          if (!hasRecentSimilar) {
            return [tipNotification, ...prev.slice(0, 14)]
          }
          return prev
        })
      }
    }, 10 * 60 * 1000) // 10 minutos

    return () => clearInterval(interval)
  }, [settings.enableInsights])

  // Funções de controle
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const clearRead = () => {
    setNotifications(prev => prev.filter(notif => !notif.read))
  }

  const clearByCategory = (category: Notification['category']) => {
    setNotifications(prev => prev.filter(notif => notif.category !== category))
  }

  // Adicionar notificação manual
  const addNotification = (
    type: Notification['type'],
    title: string,
    message: string,
    icon: string = '🔔',
    category: Notification['category'] = 'finance',
    priority: Notification['priority'] = 'medium'
  ) => {
    const notification = createNotification(type, title, message, icon, category, priority)
    setNotifications(prev => [notification, ...prev.slice(0, 14)])
  }

  // Estatísticas
  const unreadCount = notifications.filter(n => !n.read).length
  const totalCount = notifications.length
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length
  
  const notificationsByCategory = notifications.reduce((acc, notif) => {
    if (notif.category) {
      acc[notif.category] = (acc[notif.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const notificationsByPriority = notifications.reduce((acc, notif) => {
    if (notif.priority) {
      acc[notif.priority] = (acc[notif.priority] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const recentNotifications = notifications.filter(n => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return n.timestamp && n.timestamp >= hourAgo
  })

  return {
    notifications,
    unreadCount,
    totalCount,
    criticalCount,
    notificationsByCategory,
    notificationsByPriority,
    recentNotifications,
    settings,
    setSettings,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    clearByCategory,
    addNotification,
    smartAnalysis
  }
}
>>>>>>> 0e0c660098934615f279dd59f7bb78e4b6549ea4

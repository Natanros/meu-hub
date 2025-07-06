'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [greeting, setGreeting] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString('pt-BR'))
      
      const hour = now.getHours()
      if (hour < 12) setGreeting('Bom dia')
      else if (hour < 18) setGreeting('Boa tarde')
      else setGreeting('Boa noite')
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      title: 'Financeiro',
      description: 'Controle completo de receitas, despesas e metas financeiras',
      icon: '💰',
      href: '/financeiro',
      color: 'from-green-500 to-emerald-600',
      features: ['Controle de transações', 'Categorização inteligente', 'Metas financeiras', 'Exportação de dados']
    },
    {
      title: 'Analytics',
      description: 'Relatórios profissionais e sistema de alertas inteligentes',
      icon: '📊',
      href: '/analytics',
      color: 'from-blue-500 to-cyan-600',
      features: ['Relatórios PDF', 'Alertas automáticos', 'Análise de padrões', 'Insights personalizados']
    },
    {
      title: 'IA Financeira',
      description: 'Análises avançadas com inteligência artificial e chat interativo',
      icon: '🤖',
      href: '/ia',
      color: 'from-purple-500 to-indigo-600',
      features: ['Chat com IA', 'Insights inteligentes', 'Análises avançadas', 'Previsões financeiras']
    }
  ]

  const stats = [
    {
      label: 'Módulos Ativos',
      value: '3',
      icon: '🔧',
      color: 'text-blue-600'
    },
    {
      label: 'Funcionalidades',
      value: '20+',
      icon: '⚡',
      color: 'text-green-600'
    },
    {
      label: 'Última Atualização',
      value: 'Hoje',
      icon: '🔄',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navegação */}
        <Navigation />
        
        {/* Header Principal */}
        <div className="text-center py-8 sm:py-12 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-lg shadow-xl">
          <h1 className="text-3xl sm:text-5xl font-bold mb-3">🏠 Meu Hub Pessoal</h1>
          <p className="text-lg sm:text-xl text-blue-100 dark:text-blue-200 mb-4">
            {greeting}! Bem-vindo ao seu centro de controle pessoal
          </p>
          <div className="text-sm text-blue-200 dark:text-blue-300">
            {currentTime}
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cards de Funcionalidades Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className={`bg-gradient-to-r ${feature.color} text-white p-6`}>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-3xl">{feature.icon}</span>
                  {feature.title}
                </CardTitle>
                <p className="text-sm opacity-90">{feature.description}</p>
              </CardHeader>
              <CardContent className="p-6 dark:bg-gray-800">
                <div className="space-y-3 mb-6">
                  {feature.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">✓</span>
                      {feat}
                    </div>
                  ))}
                </div>
                <Link href={feature.href}>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg">
                    Acessar {feature.title} →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seção de Recursos Recentes */}
        <Card className="shadow-xl border-t-4 border-t-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
            <CardTitle className="flex items-center gap-2">
              🆕 Melhorias Recentes
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                NOVO
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-green-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <span className="text-white text-lg">�</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-green-900 dark:text-green-300">Dashboard Avançado</h4>
                    <p className="text-xs text-green-600 dark:text-green-400">Análises detalhadas</p>
                  </div>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  Novo dashboard com insights inteligentes, gráficos interativos e análise de tendências financeiras.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-purple-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-300">IA Melhorada</h4>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Chat inteligente</p>
                  </div>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  Chat com IA mais inteligente que analisa seus dados em tempo real e oferece conselhos personalizados.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-blue-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <span className="text-white text-lg">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-300">Metas Visuais</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Progresso detalhado</p>
                  </div>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  Visualização melhorada do progresso das metas com gráficos interativos e notificações inteligentes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Informativo */}
        <div className="text-center py-6 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="space-y-2">
            <p className="text-sm font-medium">Sistema de Gestão Pessoal</p>
            <p className="text-xs">
              Desenvolvido com ❤️ usando Next.js, TypeScript, Tailwind CSS e IA
            </p>
            <div className="flex justify-center gap-4 text-xs">
              <span>💾 Dados seguros</span>
              <span>🔄 Atualizações automáticas</span>
              <span>📱 Interface responsiva</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

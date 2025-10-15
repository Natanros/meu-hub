'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card } from '@/components/ui/card'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/financeiro',
      label: 'Financeiro',
      icon: '💰',
      description: 'Receitas e Despesas'
    },
    {
      href: '/orcamento',
      label: 'Orçamento',
      icon: '🎯',
      description: 'Defina seus limites'
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: '📊',
      description: 'Relatórios e Alertas'
    },
    {
      href: '/ia',
      label: 'IA',
      icon: '🤖',
      description: 'Análises Inteligentes'
    },
    {
      href: '/configuracoes',
      label: 'Configurações',
      icon: '⚙️',
      description: 'Conta e Preferências'
    }
  ]

  const handleNavClick = () => {
    // Força scroll para o topo ao clicar em qualquer link
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 0)
  }

  return (
    <Card className="mb-4 sm:mb-6 shadow-lg border-t-4 border-t-indigo-500">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                scroll={false}
                className={`flex-1 p-3 sm:p-4 rounded-lg transition-all duration-200 text-center sm:text-left ${
                  isActive
                    ? 'bg-indigo-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:scale-102'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">{item.icon}</span>
                  <div>
                    <div className={`font-semibold text-sm sm:text-base ${
                      isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${
                      isActive ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

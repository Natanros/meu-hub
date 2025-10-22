/**
 * Layout específico para páginas de autenticação
 * Remove o ResponsiveLayout e outros componentes que não devem aparecer
 * Renderiza apenas o conteúdo puro sem headers, sidebars, etc.
 */

import { ReactNode } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="auth-layout">
        {children}
      </div>
    </ThemeProvider>
  )
}

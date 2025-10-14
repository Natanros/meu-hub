/**
 * Layout específico para páginas de autenticação
 * Remove o ResponsiveLayout e outros componentes que não devem aparecer
 * Renderiza apenas o conteúdo puro sem headers, sidebars, etc.
 */

import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}

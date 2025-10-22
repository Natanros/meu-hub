/**
 * Layout Wrapper
 * Detecta se está em rota de autenticação e aplica ou não o ResponsiveLayout
 */

'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import ResponsiveLayout from './ResponsiveLayout';

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Verifica se está em uma rota de autenticação
  const isAuthRoute = pathname?.startsWith('/auth');
  
  // Se for rota de autenticação, renderiza apenas o conteúdo sem layout
  if (isAuthRoute) {
    return <>{children}</>;
  }
  
  // Para outras rotas, aplica o ResponsiveLayout normalmente
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}

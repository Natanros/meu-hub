/**
 * 📱 Responsive Layout
 * Layout responsivo com navegação mobile-first para o PWA
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ThemeToggleButton } from '@/components/shared/ThemeToggleButton';
import { Button } from '@/components/ui/button';
import { usePWA, useMobileOptimizations } from '@/hooks/usePWA';
import FloatingActionButton from '@/components/shared/FloatingActionButton';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile, isStandalone } = usePWA();
  const { status } = useSession();
  
  // Aplicar otimizações mobile
  useMobileOptimizations();
  
  // Verificar se o usuário está autenticado
  const isAuthenticated = status === 'authenticated';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { href: '/', icon: '🏠', label: 'Dashboard' },
    { href: '/financeiro', icon: '💰', label: 'Financeiro' },
    { href: '/achievements', icon: '🏆', label: 'Conquistas' },
    { href: '/tarefas', icon: '✅', label: 'Tarefas (Futuro)' },
    { href: '/ia', icon: '🤖', label: 'IA (Futuro)' },
  ];

  return (
    <div className={`flex h-screen bg-background text-foreground ${isStandalone ? 'pwa-safe-area' : ''}`}>
      {/* Header quando NÃO autenticado - Só no mobile */}
      {!isAuthenticated && isMobile && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-14 flex items-center justify-between px-4">
          <h1 className="font-bold text-lg">Meu Hub</h1>
          <Link href="/auth/signin">
            <Button variant="default" size="sm" className="touch-target">
              Entrar
            </Button>
          </Link>
        </div>
      )}
      
      {/* Header quando NÃO autenticado - Desktop */}
      {!isAuthenticated && !isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-8">
          <h1 className="font-bold text-2xl">Meu Hub Pessoal</h1>
          <div className="flex items-center gap-4">
            <ThemeToggleButton />
            <Link href="/auth/signin">
              <Button variant="default" size="sm">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Mobile Header - Só mostra se autenticado */}
      {isAuthenticated && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-14 flex items-center justify-between px-4">
          <h1 className="font-bold text-lg">Meu Hub</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2 touch-target"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </Button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isAuthenticated && isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop & Mobile Slide-out - Só mostra se autenticado */}
      {isAuthenticated && (
        <aside
          className={`
            fixed md:relative z-50 w-64 h-full bg-card shadow-lg flex flex-col transition-transform duration-300 ease-in-out mobile-navigation
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
        {/* Desktop Header */}
        <div className="hidden md:block p-6 font-bold text-2xl border-b border-border">
          Meu Hub
        </div>

        {/* Mobile Header inside sidebar */}
        <div className="md:hidden p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-xl">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeMobileMenu}
            className="p-2"
          >
            ✕
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 gap-2 flex-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-border">
          <ThemeToggleButton />
        </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content with mobile padding - Ajusta padding baseado no estado de autenticação e dispositivo */}
        <div className={`flex-1 p-4 md:p-8 ${!isAuthenticated ? 'pt-16 md:pt-20' : isAuthenticated && isMobile ? 'pt-16 md:pt-8' : 'pt-4 md:pt-8'} overflow-auto mobile-scroll ${isMobile ? 'ios-keyboard-adjust' : ''}`} data-scroll>
          {children}
        </div>
        
        {/* Floating Action Button para mobile - Só mostra se autenticado */}
        {isAuthenticated && <FloatingActionButton />}
      </main>
    </div>
  );
};

export default ResponsiveLayout;

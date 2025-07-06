/**
 * 📱 Responsive Layout
 * Layout responsivo com navegação mobile-first para o PWA
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggleButton } from './ThemeToggleButton';
import { Button } from './ui/button';
import { usePWA, useMobileOptimizations } from '../hooks/usePWA';
import FloatingActionButton from './FloatingActionButton';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile, isStandalone } = usePWA();
  
  // Aplicar otimizações mobile
  useMobileOptimizations();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { href: '/', icon: '🏠', label: 'Dashboard' },
    { href: '/financeiro', icon: '💰', label: 'Financeiro' },
    { href: '/tarefas', icon: '✅', label: 'Tarefas (Futuro)' },
    { href: '/ia', icon: '🤖', label: 'IA (Futuro)' },
  ];

  return (
    <div className={`flex h-screen bg-background text-foreground ${isStandalone ? 'pwa-safe-area' : ''}`}>
      {/* Mobile Header */}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop & Mobile Slide-out */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content with mobile padding */}
        <div className={`flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-auto mobile-scroll ${isMobile ? 'ios-keyboard-adjust' : ''}`} data-scroll>
          {children}
        </div>
        
        {/* Floating Action Button para mobile */}
        <FloatingActionButton />
      </main>
    </div>
  );
};

export default ResponsiveLayout;

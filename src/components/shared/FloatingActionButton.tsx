/**
 * 📱 Floating Action Button
 * Botão flutuante para ações rápidas em mobile
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

interface FABProps {
  href?: string;
  onClick?: () => void;
  icon?: string;
  label?: string;
  className?: string;
}

const FloatingActionButton: React.FC<FABProps> = ({
  href = '/financeiro?action=new',
  onClick,
  icon = '+',
  label = 'Adicionar Transação',
  className = '',
}) => {
  const { isMobile } = usePWA();

  // Só mostrar em mobile
  if (!isMobile) {
    return null;
  }

  const buttonContent = (
    <Button
      size="lg"
      className={`fab bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="text-xl font-bold">{icon}</span>
    </Button>
  );

  if (href && !onClick) {
    return (
      <Link href={href} className="fixed bottom-6 right-6 z-40">
        {buttonContent}
      </Link>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {buttonContent}
    </div>
  );
};

export default FloatingActionButton;

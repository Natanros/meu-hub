/**
 * 📱 PWA Install Manager
 * Componente para gerenciar instalação do app no mobile
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallManager: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
      
      setIsStandalone(isInStandaloneMode || isIOSStandalone);
      setIsInstalled(isInStandaloneMode || isIOSStandalone);
    };

    checkIfInstalled();

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log('PWA foi instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou instalar o PWA');
    } else {
      console.log('Usuário recusou instalar o PWA');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
  };

  // Detectar iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Se já está instalado, não mostrar nada
  if (isInstalled) {
    return null;
  }

  // Banner de instalação para iOS
  if (isIOS && !isStandalone) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 p-4 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl mobile-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📱</span>
              <h3 className="font-semibold text-sm">Instalar App no iPhone</h3>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              1. Toque no botão <span className="inline-flex items-center justify-center w-4 h-4 text-xs bg-white bg-opacity-20 rounded">↗</span> <strong>Compartilhar</strong> (parte inferior)<br/>
              2. Role para baixo e toque em <strong>&ldquo;Adicionar à Tela Inicial&rdquo;</strong><br/>
              3. Confirme tocando em <strong>&ldquo;Adicionar&rdquo;</strong>
            </p>
            <div className="mt-2 text-xs opacity-75">
              ✨ Depois disso, encontre o app na sua tela inicial!
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissBanner}
            className="text-white hover:bg-white hover:bg-opacity-20 mt-1 touch-target"
            aria-label="Fechar"
          >
            ✕
          </Button>
        </div>
      </Card>
    );
  }

  // Banner de instalação para Android/Desktop
  if (showInstallBanner && deferredPrompt) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 p-4 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl mobile-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📱</span>
              <h3 className="font-semibold text-sm">Instalar App</h3>
            </div>
            <p className="text-xs opacity-90">
              Adicione à sua tela inicial para acesso rápido e funcionamento offline
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissBanner}
              className="text-white hover:bg-white hover:bg-opacity-20 touch-target"
            >
              Agora não
            </Button>
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="bg-white text-green-600 hover:bg-gray-100 font-medium touch-target"
            >
              Instalar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default PWAInstallManager;

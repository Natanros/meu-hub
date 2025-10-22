/**
 * 📱 Hook para otimizações PWA e Mobile
 * Detecta recursos específicos do dispositivo e PWA
 */

'use client';

import { useState, useEffect } from 'react';

interface PWACapabilities {
  isInstalled: boolean;
  isStandalone: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsInstall: boolean;
  viewportHeight: number;
}

export const usePWA = (): PWACapabilities => {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstalled: false,
    isStandalone: false,
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    supportsInstall: false,
    viewportHeight: 0,
  });

  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window === 'undefined') return;
    const detectCapabilities = () => {
      // Detectar se está instalado como PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
      const isInstalled = isStandalone || isIOSStandalone;

      // Detectar dispositivo
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isMobile = isIOS || isAndroid || /Mobile/.test(userAgent);

      // Detectar suporte à instalação
      const supportsInstall = 'serviceWorker' in navigator && 'beforeinstallprompt' in window;

      setCapabilities({
        isInstalled,
        isStandalone: isInstalled,
        isMobile,
        isIOS,
        isAndroid,
        supportsInstall,
        viewportHeight: window.innerHeight,
      });
    };

    // Detectar mudanças na altura do viewport (útil para teclado virtual)
    const handleResize = () => {
      setCapabilities(prev => ({
        ...prev,
        viewportHeight: window.innerHeight,
      }));

      // Atualizar CSS custom property para altura do viewport
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };

    // Detectar mudanças no modo standalone
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleStandaloneChange = () => {
      detectCapabilities();
    };

    // Executar detecção inicial
    detectCapabilities();
    handleResize();

    // Adicionar listeners
    window.addEventListener('resize', handleResize);
    standaloneQuery.addEventListener('change', handleStandaloneChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      standaloneQuery.removeEventListener('change', handleStandaloneChange);
    };
  }, []);

  return capabilities;
};

/**
 * Hook para otimizar performance em mobile
 */
export const useMobileOptimizations = () => {
  const { isMobile, isIOS } = usePWA();

  useEffect(() => {
    if (!isMobile) return;

    // Otimizações específicas para mobile
    const optimizations = () => {
      // Prevenir bounce scrolling no iOS
      if (isIOS) {
        document.body.style.overscrollBehavior = 'none';
      }

      // Otimizar performance de scrolling
      const scrollableElements = document.querySelectorAll('[data-scroll]');
      scrollableElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        if ('webkitOverflowScrolling' in htmlElement.style) {
          (htmlElement.style as { webkitOverflowScrolling?: string }).webkitOverflowScrolling = 'touch';
        }
      });

      // Adicionar classe para mobile
      document.body.classList.add('mobile-optimized');
    };

    optimizations();

    return () => {
      document.body.classList.remove('mobile-optimized');
    };
  }, [isMobile, isIOS]);
};

/**
 * Hook para gerenciar teclado virtual
 */
export const useVirtualKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { isMobile, viewportHeight } = usePWA();

  useEffect(() => {
    if (!isMobile) return;

    const initialHeight = viewportHeight;
    const threshold = 150; // Threshold para detectar teclado

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;
      
      setIsKeyboardVisible(heightDifference > threshold);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile, viewportHeight]);

  return { isKeyboardVisible };
};

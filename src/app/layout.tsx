import './globals.css'
import { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import PWAInstallManager from '@/components/shared/PWAInstallManager'
import AuthProvider from '@/components/features/auth/AuthProvider'
import { SyncManager } from '@/components/features/system/SyncManager'
import { ToastProvider } from '@/hooks/useToast'
import { LayoutWrapper } from '@/components/layout/LayoutWrapper'

export const metadata: Metadata = {
  title: 'Meu Hub Pessoal',
  description: 'Sistema completo de gestão financeira pessoal com IA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hub Pessoal',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-152x152.svg', sizes: '152x152', type: 'image/svg+xml' },
    ],
  },
}

// Viewport moderno (substitui themeColor/viewport deprecated no metadata)
export const viewport: Viewport = {
  themeColor: '#3b82f6',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
  {/* Metas geradas via Metadata/Viewport API; manter apenas complementares se necessário */}
  <meta name="format-detection" content="telephone=no" />
  <meta name="mobile-web-app-capable" content="yes" />
  {/* iOS adicionais (appleWebApp em metadata já cobre grande parte) */}
  <link rel="apple-touch-icon" href="/icons/icon-152x152.svg" />
  <link rel="apple-touch-startup-image" href="/icons/icon-512x512.svg" />
  <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body className="overflow-x-hidden max-w-full">
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <div className="main-container min-h-screen w-full overflow-x-hidden">
                <LayoutWrapper>{children}</LayoutWrapper>
              </div>
              <PWAInstallManager />
              <SyncManager />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
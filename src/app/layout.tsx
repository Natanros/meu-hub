import './globals.css'
import { ReactNode } from 'react'
import { ThemeProvider } from './context/Themecontext'
import PWAInstallManager from '@/components/PWAInstallManager'
import ResponsiveLayout from '../components/ResponsiveLayout'

export const metadata = {
  title: 'Meu Hub Pessoal',
  description: 'Sistema completo de gestão financeira pessoal com IA',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Hub Pessoal" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.svg" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body>
        <ThemeProvider>
          <ResponsiveLayout>{children}</ResponsiveLayout>
          <PWAInstallManager />
        </ThemeProvider>
      </body>
    </html>
  )
}
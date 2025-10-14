'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggleButton } from '@/components/shared/ThemeToggleButton'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Auto-login após registro
        setTimeout(async () => {
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          })
          
          if (result?.ok) {
            router.push('/financeiro')
          }
        }, 2000)
      } else {
        setError(data.error || 'Erro ao criar conta')
      }
    } catch {
      setError('Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white dark:bg-gray-800">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              Conta criada com sucesso!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Você será redirecionado automaticamente...
            </p>
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white dark:bg-gray-800 relative">
        {/* Theme Toggle no canto superior direito do card */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggleButton />
        </div>

        <CardHeader className="text-center space-y-4 pb-6 pt-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">✨</span>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
            Criar Conta
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Comece a gerenciar suas finanças agora
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Nome completo
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                className="h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Confirmar senha
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Já tem uma conta?{' '}
              <Link 
                href="/auth/signin" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

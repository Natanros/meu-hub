'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserHeader from '@/components/layout/UserHeader'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'
import { useToast } from '@/hooks/useToast'

export default function ConfiguracoesPage() {
  const { data: session, update } = useSession()
  const { showToast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || ''
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await update() // Atualiza a sessão
        showToast('Perfil atualizado com sucesso!', 'success')
      } else {
        showToast('Erro ao atualizar perfil', 'error')
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      showToast('Erro ao atualizar perfil', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast('Conta excluída com sucesso', 'success')
        signOut({ callbackUrl: '/auth/signin' })
      } else {
        showToast('Erro ao excluir conta', 'error')
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
      showToast('Erro ao excluir conta', 'error')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header do Usuário */}
          <UserHeader />
          
          {/* Header Principal */}
          <div className="text-center py-8 sm:py-12 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 text-white rounded-lg shadow-xl">
            <h1 className="text-3xl sm:text-5xl font-bold mb-3">⚙️ Configurações</h1>
            <p className="text-lg sm:text-xl text-purple-100 dark:text-purple-200">
              Gerencie sua conta e preferências
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Informações do Perfil */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  👤 Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full"
                      placeholder="Seu nome"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full"
                      placeholder="seu@email.com"
                      disabled // Email não pode ser alterado por enquanto
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isUpdating}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isUpdating ? 'Atualizando...' : 'Atualizar Perfil'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Informações da Conta */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  📊 Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Detalhes da Sessão</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Email:</strong> {session?.user?.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Nome:</strong> {session?.user?.name || 'Não informado'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Provedor:</strong> {session?.user?.image ? 'Google' : 'Email/Senha'}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Dicas de Segurança</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Use senhas fortes e únicas</li>
                    <li>• Mantenha suas informações atualizadas</li>
                    <li>• Faça logout em dispositivos compartilhados</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Ações da Conta */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  🔧 Ações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <Button 
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    variant="outline"
                    className="w-full"
                  >
                    🚪 Fazer Logout
                  </Button>

                  <Button 
                    onClick={() => window.location.href = '/auth/signin'}
                    variant="outline"
                    className="w-full"
                  >
                    🔄 Trocar de Conta
                  </Button>

                  <Button 
                    onClick={handleDeleteAccount}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                  >
                    🗑️ Excluir Conta
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preferências */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  🎨 Preferências
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">🚧 Em Desenvolvimento</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    As configurações de tema, idioma e notificações estarão disponíveis em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

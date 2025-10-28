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
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (passwordData.newPassword.length < 6) {
      showToast('A nova senha deve ter no mínimo 6 caracteres', 'error')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('As senhas não coincidem', 'error')
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Senha alterada com sucesso!', 'success')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        showToast(data.error || 'Erro ao alterar senha', 'error')
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      showToast('Erro ao alterar senha', 'error')
    } finally {
      setIsChangingPassword(false)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Header do Usuário */}
          <UserHeader />
          
          {/* Header Principal */}
          <div className="text-center py-6 sm:py-10 md:py-12 px-4 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 text-white rounded-xl shadow-xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">⚙️ Configurações</h1>
            <p className="text-sm sm:text-lg md:text-xl text-purple-100 dark:text-purple-200">
              Gerencie sua conta e preferências
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Informações do Perfil */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                  👤 Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleUpdateProfile} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Nome
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-10 sm:h-11 text-sm"
                      placeholder="Seu nome"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full h-10 sm:h-11 text-sm"
                      placeholder="seu@email.com"
                      disabled
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isUpdating}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 text-sm"
                  >
                    {isUpdating ? 'Atualizando...' : 'Atualizar Perfil'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Alteração de Senha */}
            {!session?.user?.image && (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                    🔐 Alterar Senha
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Senha Atual
                      </label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full h-10 sm:h-11 text-sm"
                        placeholder="Digite sua senha atual"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Nova Senha
                      </label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full h-10 sm:h-11 text-sm"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Confirmar Nova Senha
                      </label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full h-10 sm:h-11 text-sm"
                        placeholder="Digite novamente"
                        required
                        minLength={6}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isChangingPassword}
                      className="w-full bg-purple-600 hover:bg-purple-700 h-10 sm:h-11 text-sm"
                    >
                      {isChangingPassword ? 'Alterando...' : '🔑 Alterar Senha'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Informações da Conta */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                  📊 Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2">Detalhes</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Email:</strong> {session?.user?.email}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Nome:</strong> {session?.user?.name || 'Não informado'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <strong>Provedor:</strong> {session?.user?.image ? 'Google' : 'Email/Senha'}
                  </p>
                </div>

                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-200 mb-2">💡 Segurança</h3>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Use senhas fortes</li>
                    <li>• Mantenha dados atualizados</li>
                    <li>• Faça logout em dispositivos compartilhados</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Ações da Conta */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg lg:col-span-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                  🔧 Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  
                  <Button 
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    variant="outline"
                    className="w-full h-10 sm:h-11 text-sm"
                  >
                    🚪 Logout
                  </Button>

                  <Button 
                    onClick={() => window.location.href = '/auth/signin'}
                    variant="outline"
                    className="w-full h-10 sm:h-11 text-sm"
                  >
                    🔄 Trocar Conta
                  </Button>

                  <Button 
                    onClick={handleDeleteAccount}
                    variant="outline"
                    className="w-full h-10 sm:h-11 text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                  >
                    🗑️ Excluir Conta
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preferências */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg lg:col-span-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
                  🎨 Preferências
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h3 className="font-semibold text-sm text-yellow-900 dark:text-yellow-200 mb-2">🚧 Em Desenvolvimento</h3>
                  <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                    Tema, idioma e notificações em breve.
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

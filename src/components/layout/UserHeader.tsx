'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function UserHeader() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
          {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {session.user?.name || 'Usuário'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {session.user?.email}
          </p>
        </div>
      </div>
      <Button 
        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        variant="outline"
        size="sm"
        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
      >
        Sair
      </Button>
    </div>
  )
}

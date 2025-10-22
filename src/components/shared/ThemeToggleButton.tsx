'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="m-4 px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
      aria-label="Alternar tema claro/escuro"
    >
      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  )
}

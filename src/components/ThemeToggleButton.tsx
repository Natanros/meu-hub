'use client'

import { useTheme } from '../app/context/Themecontext'

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="m-4 px-3 py-2 rounded bg-muted hover:bg-muted-foreground dark:bg-muted-foreground dark:hover:bg-muted text-muted-foreground dark:text-muted cursor-pointer transition"
      aria-label="Alternar tema claro/escuro"
    >
      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  )
}

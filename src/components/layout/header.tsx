'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Presentation, BrainCircuit, User, Home, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

export function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme, isDark } = useTheme()

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: pathname === '/'
    },
    {
      name: 'My Presentations',
      href: '/presentations',
      icon: Presentation,
      current: pathname.startsWith('/presentations')
    },
    {
      name: 'Brainstorms',
      href: '/brainstorms',
      icon: BrainCircuit,
      current: pathname === '/brainstorms'
    },
    {
      name: 'Context Profiles',
      href: '/contexts',
      icon: User,
      current: pathname === '/contexts'
    }
  ]

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Presentation className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">FastSlides</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
            <nav className="flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={item.current ? 'default' : 'ghost'}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="ml-2"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
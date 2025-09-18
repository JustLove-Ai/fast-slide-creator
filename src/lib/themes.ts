import { SlideTheme, ThemeColors } from '@/types'

export const defaultThemes: SlideTheme[] = [
  {
    name: 'default',
    label: 'Default',
    colors: {
      background: '#ffffff',
      surface: '#f8fafc',
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0'
    },
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '0.5rem',
    shadows: true
  },
  {
    name: 'dark',
    label: 'Dark Mode',
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#a78bfa',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155'
    },
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '0.5rem',
    shadows: true
  },
  {
    name: 'professional',
    label: 'Professional',
    colors: {
      background: '#ffffff',
      surface: '#f9fafb',
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#3b82f6',
      text: '#111827',
      textSecondary: '#4b5563',
      border: '#d1d5db'
    },
    fontFamily: 'Georgia, serif',
    borderRadius: '0.25rem',
    shadows: false
  },
  {
    name: 'colorful',
    label: 'Colorful',
    colors: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      surface: 'rgba(255, 255, 255, 0.95)',
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#45b7d1',
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      border: 'rgba(255, 255, 255, 0.2)'
    },
    fontFamily: 'Poppins, sans-serif',
    borderRadius: '1rem',
    shadows: true
  },
  {
    name: 'minimal',
    label: 'Minimal',
    colors: {
      background: '#fefefe',
      surface: '#ffffff',
      primary: '#000000',
      secondary: '#666666',
      accent: '#333333',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0'
    },
    fontFamily: 'Helvetica Neue, Arial, sans-serif',
    borderRadius: '0',
    shadows: false
  },
  {
    name: 'creative',
    label: 'Creative',
    colors: {
      background: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      surface: 'rgba(255, 255, 255, 0.9)',
      primary: '#e91e63',
      secondary: '#9c27b0',
      accent: '#ff5722',
      text: '#212121',
      textSecondary: '#757575',
      border: 'rgba(233, 30, 99, 0.3)'
    },
    fontFamily: 'Quicksand, sans-serif',
    borderRadius: '1.5rem',
    shadows: true
  }
]

export const getThemeByName = (name: string): SlideTheme => {
  return defaultThemes.find(theme => theme.name === name) || defaultThemes[0]
}

export const createCustomTheme = (customColors: Partial<ThemeColors>): SlideTheme => {
  const baseTheme = defaultThemes[0]
  return {
    name: 'custom',
    label: 'Custom',
    colors: {
      ...baseTheme.colors,
      ...customColors
    },
    fontFamily: baseTheme.fontFamily,
    borderRadius: baseTheme.borderRadius,
    shadows: baseTheme.shadows
  }
}

// Helper function to apply theme styles to an element
export const getThemeStyles = (theme: SlideTheme) => {
  const isGradient = theme.colors.background.includes('gradient')

  return {
    background: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.fontFamily,
    borderRadius: theme.borderRadius,
    ...(theme.shadows && !isGradient && {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    })
  }
}

export const getThemeTextStyles = (theme: SlideTheme, variant: 'title' | 'content' | 'secondary' = 'content') => {
  const colors = {
    title: theme.colors.text,
    content: theme.colors.text,
    secondary: theme.colors.textSecondary
  }

  return {
    color: colors[variant],
    fontFamily: theme.fontFamily
  }
}
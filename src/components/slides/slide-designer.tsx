'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slide, SlideTheme, CustomThemeOptions } from '@/types'
import { defaultThemes, getThemeByName, createCustomTheme, getThemeStyles } from '@/lib/themes'
import { updateSlide } from '@/lib/actions/slide'
import {
  Palette,
  Check,
  X,
  Paintbrush,
  Type,
  Layout,
  Sparkles
} from 'lucide-react'

interface SlideDesignerProps {
  slide: Slide
  isOpen: boolean
  onClose: () => void
  onSave?: (updatedSlide: Slide & { theme?: SlideTheme; customTheme?: CustomThemeOptions }) => void
  onApplyToAll?: (theme: SlideTheme, customTheme?: CustomThemeOptions) => void
}

export function SlideDesigner({ slide, isOpen, onClose, onSave, onApplyToAll }: SlideDesignerProps) {
  const [selectedTheme, setSelectedTheme] = useState<SlideTheme>(defaultThemes[0])
  const [customColors, setCustomColors] = useState<CustomThemeOptions>({})
  const [isCustom, setIsCustom] = useState(false)

  useEffect(() => {
    // Initialize with current slide theme if available
    if ((slide as any).theme) {
      setSelectedTheme((slide as any).theme)
    }
    if ((slide as any).customTheme) {
      setCustomColors((slide as any).customTheme)
      setIsCustom(true)
    }
  }, [slide])

  const handleThemeSelect = (theme: SlideTheme) => {
    setSelectedTheme(theme)
    setIsCustom(false)
    setCustomColors({})

    // Apply immediately for preview
    if (onSave) {
      onSave({
        ...slide,
        theme,
        customTheme: undefined
      })
    }
  }

  const handleCustomColorChange = (colorType: keyof CustomThemeOptions, value: string) => {
    const newCustomColors = {
      ...customColors,
      [colorType]: value
    }
    setCustomColors(newCustomColors)
    setIsCustom(true)

    const customTheme = createCustomTheme({
      background: newCustomColors.backgroundColor || selectedTheme.colors.background,
      text: newCustomColors.textColor || selectedTheme.colors.text,
      primary: newCustomColors.titleColor || selectedTheme.colors.primary,
      accent: newCustomColors.accentColor || selectedTheme.colors.accent,
    })

    setSelectedTheme(customTheme)

    // Apply immediately for preview
    if (onSave) {
      onSave({
        ...slide,
        theme: customTheme,
        customTheme: newCustomColors
      })
    }
  }

  const handleApplyToSlide = async () => {
    const themeData = {
      theme: selectedTheme,
      customTheme: isCustom ? customColors : undefined
    }

    try {
      await updateSlide(slide.id, { themeData })

      if (onSave) {
        onSave({
          ...slide,
          theme: selectedTheme,
          customTheme: isCustom ? customColors : undefined
        })
      }
      onClose()
    } catch (error) {
      // Failed to save theme
    }
  }

  const handleApplyToAllSlides = async () => {
    const themeData = {
      theme: selectedTheme,
      customTheme: isCustom ? customColors : undefined
    }

    if (onApplyToAll) {
      await onApplyToAll(selectedTheme, isCustom ? customColors : undefined, themeData)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <Palette className="h-5 w-5" />
          Design
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        <Tabs defaultValue="themes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="themes">
              <Layout className="h-4 w-4 mr-2" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Paintbrush className="h-4 w-4 mr-2" />
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choose a Theme</Label>
              <div className="grid grid-cols-2 gap-3">
                {defaultThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeSelect(theme)}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      selectedTheme.name === theme.name && !isCustom
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-16 rounded mb-2 flex items-center justify-center text-xs font-medium"
                      style={{
                        background: theme.colors.background,
                        color: theme.colors.text,
                        fontFamily: theme.fontFamily
                      }}
                    >
                      {theme.label}
                    </div>
                    {selectedTheme.name === theme.name && !isCustom && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Custom Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="bg-color" className="text-sm">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        type="color"
                        value={customColors.backgroundColor || selectedTheme.colors.background}
                        onChange={(e) => handleCustomColorChange('backgroundColor', e.target.value)}
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={customColors.backgroundColor || selectedTheme.colors.background}
                        onChange={(e) => handleCustomColorChange('backgroundColor', e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-color" className="text-sm">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={customColors.textColor || selectedTheme.colors.text}
                        onChange={(e) => handleCustomColorChange('textColor', e.target.value)}
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={customColors.textColor || selectedTheme.colors.text}
                        onChange={(e) => handleCustomColorChange('textColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title-color" className="text-sm">Title Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="title-color"
                        type="color"
                        value={customColors.titleColor || selectedTheme.colors.primary}
                        onChange={(e) => handleCustomColorChange('titleColor', e.target.value)}
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={customColors.titleColor || selectedTheme.colors.primary}
                        onChange={(e) => handleCustomColorChange('titleColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent-color" className="text-sm">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={customColors.accentColor || selectedTheme.colors.accent}
                        onChange={(e) => handleCustomColorChange('accentColor', e.target.value)}
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={customColors.accentColor || selectedTheme.colors.accent}
                        onChange={(e) => handleCustomColorChange('accentColor', e.target.value)}
                        placeholder="#8b5cf6"
                        className="flex-1 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {isCustom && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Custom theme active
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="w-full h-24 rounded p-3 transition-all"
              style={getThemeStyles(selectedTheme)}
            >
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: selectedTheme.colors.primary }}
              >
                Slide Title
              </div>
              <div
                className="text-xs"
                style={{ color: selectedTheme.colors.text }}
              >
                This is how your content will look with the selected theme.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={handleApplyToSlide} className="w-full">
            Apply to This Slide
          </Button>
          <Button onClick={handleApplyToAllSlides} variant="outline" className="w-full">
            Apply to All Slides
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
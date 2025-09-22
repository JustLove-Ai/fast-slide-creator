'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slide, SlideTemplate, SlideTheme, CustomThemeOptions } from '@/types'
import { SlideEditor } from './slide-editor'
import { SlideDesigner } from './slide-designer'
import { TldrawCanvas } from './tldraw-canvas'
import { ImageLibrarySidebar } from './image-library'
import { updateSlide, createSlide, deleteSlide } from '@/lib/actions/slide'
import { defaultThemes, getThemeStyles, getThemeTextStyles } from '@/lib/themes'
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square,
  RotateCcw,
  Edit,
  Fullscreen,
  Volume2,
  Pen,
  Circle,
  Type,
  Eraser,
  Image as ImageIcon,
  Palette,
  Plus,
  Trash2,
  Copy,
  MoreHorizontal,
  Save,
  CheckCircle,
  X,
  Images
} from 'lucide-react'

interface SlideViewerProps {
  slides: Slide[]
  presentationTitle: string
  presentationId: string
}

export function SlideViewer({ slides, presentationTitle, presentationId }: SlideViewerProps) {
  const router = useRouter()
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isDesignerOpen, setIsDesignerOpen] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [slidesState, setSlidesState] = useState(slides)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 })
  const [forceRender, setForceRender] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isPresentMode, setIsPresentMode] = useState(false)

  const currentSlide = slidesState[currentSlideIndex]

  // Debounced auto-save for canvas changes
  const debouncedSaveCanvas = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (slide: Slide) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          try {
            await updateSlide(slide.id, {
              canvasData: slide.canvasData
            })
          } catch (error) {
            // Failed to auto-save canvas
          }
        }, 1000) // Save 1 second after last change
      }
    })(),
    []
  )


  useEffect(() => {
    const updateCanvasSize = () => {
      if (typeof window !== 'undefined') {
        if (isPresentMode) {
          // In presentation mode, use full screen dimensions
          const width = Math.floor(window.innerWidth * 0.95)
          const height = Math.floor(window.innerHeight * 0.9)
          setCanvasSize({ width, height })
        } else {
          // Normal mode with reduced size
          const width = Math.floor(window.innerWidth * 0.6)
          const height = Math.floor(window.innerHeight * 0.7)
          setCanvasSize({ width, height })
        }
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [isPresentMode])

  const goToNextSlide = () => {
    if (currentSlideIndex < slidesState.length - 1) {
      setCurrentSlideIndex(prev => prev + 1)
    } else {
      setIsPlaying(false) // Stop at the end
    }
  }

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    // TODO: Implement auto-advance timer
  }

  const resetPresentation = () => {
    setCurrentSlideIndex(0)
    setIsPlaying(false)
  }

  const handleEditSlide = (slide: Slide) => {
    setIsEditorOpen(true)
    setIsDesignerOpen(false)
    setIsLibraryOpen(false)
  }

  const handleDesignSlide = (slide: Slide) => {
    setIsDesignerOpen(true)
    setIsEditorOpen(false)
    setIsLibraryOpen(false)
  }

  const handleLibraryOpen = () => {
    setIsLibraryOpen(true)
    setIsEditorOpen(false)
    setIsDesignerOpen(false)
  }

  const handleImageFromLibrary = (imageUrl: string) => {
    if (currentSlide) {
      const updatedSlide = {
        ...currentSlide,
        imageUrl
      }
      handleSlideUpdate(updatedSlide)
    }
  }

  const handleAddSlide = async () => {
    try {
      const newSlide = await createSlide(presentationId, {
        order: slidesState.length,
        template: 'FULL_TEXT',
        title: `New Slide ${slidesState.length + 1}`,
        content: 'Click Edit to add content to this slide.'
      })

      setSlidesState(prev => [...prev, newSlide])
      setCurrentSlideIndex(slidesState.length) // Navigate to new slide
    } catch (error) {
      // Failed to create slide
    }
  }

  const handleDuplicateSlide = async (slide: Slide) => {
    try {
      const duplicatedSlide = await createSlide(presentationId, {
        order: slide.order + 1,
        template: slide.template,
        title: slide.title ? `${slide.title} (Copy)` : 'Duplicate Slide',
        content: slide.content,
        imageUrl: slide.imageUrl,
        canvasData: slide.canvasData,
        themeData: (slide as any).themeData,
        transition: slide.transition,
        narrationSegment: slide.narrationSegment
      })

      // Update order of slides that come after this one
      const updatedSlides = slidesState.map(s =>
        s.order > slide.order ? { ...s, order: s.order + 1 } : s
      )

      setSlidesState(prev => {
        const slideIndex = prev.findIndex(s => s.id === slide.id)
        const newSlides = [...prev]
        newSlides.splice(slideIndex + 1, 0, duplicatedSlide)
        return newSlides
      })
    } catch (error) {
      // Failed to duplicate slide
    }
  }

  const handleDeleteSlide = async (slide: Slide) => {
    if (slidesState.length <= 1) {
      // Don't allow deleting the last slide
      return
    }

    if (!confirm('Are you sure you want to delete this slide?')) {
      return
    }

    try {
      await deleteSlide(slide.id)

      const slideIndex = slidesState.findIndex(s => s.id === slide.id)
      setSlidesState(prev => prev.filter(s => s.id !== slide.id))

      // Adjust current slide index if necessary
      if (currentSlideIndex >= slideIndex && currentSlideIndex > 0) {
        setCurrentSlideIndex(prev => prev - 1)
      } else if (currentSlideIndex === slideIndex && slideIndex === slidesState.length - 1) {
        setCurrentSlideIndex(slideIndex - 1)
      }
    } catch (error) {
      // Failed to delete slide
    }
  }

  const handleManualSave = async () => {
    if (!currentSlide || isSaving) return

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      const slideToSave = {
        title: currentSlide.title,
        content: currentSlide.content,
        imageUrl: currentSlide.imageUrl,
        canvasData: currentSlide.canvasData,
        template: currentSlide.template,
        transition: currentSlide.transition,
        narrationSegment: currentSlide.narrationSegment,
        themeData: (currentSlide as any).themeData
      }

      await updateSlide(currentSlide.id, slideToSave)

      setSaveStatus('saved')

      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const enterPresentMode = () => {
    setIsPresentMode(true)
    setIsEditorOpen(false)
    setIsDesignerOpen(false)
    setIsLibraryOpen(false)
  }

  const exitPresentMode = () => {
    setIsPresentMode(false)
  }

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isPresentMode) return

      switch (event.key) {
        case 'ArrowRight':
        case ' ': // Spacebar
          event.preventDefault()
          goToNextSlide()
          break
        case 'ArrowLeft':
          event.preventDefault()
          goToPreviousSlide()
          break
        case 'Escape':
          event.preventDefault()
          exitPresentMode()
          break
        case 'Home':
          event.preventDefault()
          setCurrentSlideIndex(0)
          break
        case 'End':
          event.preventDefault()
          setCurrentSlideIndex(slidesState.length - 1)
          break
      }
    }

    if (isPresentMode) {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isPresentMode, currentSlideIndex, slidesState.length])

  const handleSlideUpdate = (updatedSlide: Slide) => {
    const previousSlide = slidesState.find(s => s.id === updatedSlide.id)

    setSlidesState(prev =>
      prev.map(slide =>
        slide.id === updatedSlide.id ? { ...updatedSlide } : slide
      )
    )

    // Only force re-render for image changes, not canvas changes
    if (previousSlide && previousSlide.imageUrl !== updatedSlide.imageUrl) {
      setForceRender(Date.now())
    }

    // Auto-save canvas changes
    if (previousSlide && JSON.stringify(previousSlide.canvasData) !== JSON.stringify(updatedSlide.canvasData)) {
      debouncedSaveCanvas(updatedSlide)
    }
  }

  const handleThemeUpdate = async (updatedSlide: Slide & { theme?: SlideTheme; customTheme?: CustomThemeOptions }) => {
    // Create theme data for database storage
    const themeData = {
      theme: updatedSlide.theme,
      customTheme: updatedSlide.customTheme
    }

    // Update slide in memory with theme data included
    const slideWithThemeData = {
      ...updatedSlide,
      themeData
    }

    handleSlideUpdate(slideWithThemeData)

    // Save theme data to database
    try {
      await updateSlide(updatedSlide.id, { themeData })
    } catch (error) {
      // Failed to save theme data
    }
  }

  const handleApplyThemeToAll = async (theme: SlideTheme, customTheme?: CustomThemeOptions) => {
    const themeData = {
      theme,
      customTheme
    }

    const updatedSlides = slidesState.map(slide => ({
      ...slide,
      theme,
      customTheme,
      themeData
    }))

    setSlidesState(updatedSlides)

    // Update all slides in database
    try {
      await Promise.all(
        slidesState.map(slide =>
          updateSlide(slide.id, { themeData })
        )
      )
    } catch (error) {
      // Failed to save theme to all slides
    }
  }

  const getSlideTheme = (slide: Slide): SlideTheme => {
    // Check if slide has theme data from database
    if ((slide as any).themeData) {
      const themeData = (slide as any).themeData

      // If it has a custom theme, create it from the stored data
      if (themeData.customTheme) {
        const baseTheme = themeData.theme || defaultThemes[0]
        return {
          name: 'custom',
          label: 'Custom',
          colors: {
            background: themeData.customTheme.backgroundColor || baseTheme.colors.background,
            surface: baseTheme.colors.surface,
            primary: themeData.customTheme.titleColor || baseTheme.colors.primary,
            secondary: baseTheme.colors.secondary,
            accent: themeData.customTheme.accentColor || baseTheme.colors.accent,
            text: themeData.customTheme.textColor || baseTheme.colors.text,
            textSecondary: baseTheme.colors.textSecondary,
            border: baseTheme.colors.border
          },
          fontFamily: baseTheme.fontFamily,
          borderRadius: baseTheme.borderRadius,
          shadows: baseTheme.shadows
        }
      }

      // Return the stored theme
      if (themeData.theme) {
        return themeData.theme
      }
    }

    // Fallback to memory theme or default
    return (slide as any).theme || defaultThemes[0]
  }

  const getSlideTemplateLayout = (template: SlideTemplate) => {
    switch (template) {
      case 'COVER':
        return 'cover'
      case 'TEXT_LEFT_IMAGE_RIGHT':
        return 'text-left-image-right'
      case 'TEXT_RIGHT_IMAGE_LEFT':
        return 'text-right-image-left'
      case 'TEXT_LEFT_CANVAS_RIGHT':
        return 'text-left-canvas-right'
      case 'TEXT_RIGHT_CANVAS_LEFT':
        return 'text-right-canvas-left'
      case 'FULL_TEXT':
        return 'full-text'
      case 'FULL_IMAGE':
        return 'full-image'
      case 'FULL_CANVAS':
        return 'full-canvas'
      case 'TRANSITION':
        return 'transition'
      default:
        return 'full-text'
    }
  }

  const renderSlideContent = (slide: Slide) => {
    const layout = getSlideTemplateLayout(slide.template)
    const contentLines = slide.content?.split('\n').filter(line => line.trim()) || []
    const theme = getSlideTheme(slide)
    const themeStyles = getThemeStyles(theme)

    switch (layout) {
      case 'cover':
        return (
          <div
            className="flex flex-col items-center justify-center h-full text-center p-16"
            style={themeStyles}
          >
            <h1
              className="text-6xl font-bold mb-8"
              style={{ color: theme.colors.primary, fontFamily: theme.fontFamily }}
            >
              {slide.title}
            </h1>
            {slide.content && (
              <p
                className="text-2xl opacity-90"
                style={{ color: theme.colors.text, fontFamily: theme.fontFamily }}
              >
                {slide.content}
              </p>
            )}
          </div>
        )

      case 'text-left-image-right':
      case 'text-right-image-left':
        const isTextLeft = layout === 'text-left-image-right'
        return (
          <div
            className={`flex h-full ${isTextLeft ? 'flex-row' : 'flex-row-reverse'}`}
            style={themeStyles}
          >
            <div className="flex-1 p-12 flex flex-col justify-center">
              <h2
                className="text-4xl font-bold mb-8"
                style={{ color: theme.colors.primary, fontFamily: theme.fontFamily }}
              >
                {slide.title}
              </h2>
              <div className="space-y-4">
                {contentLines.map((line, index) => (
                  <p
                    key={index}
                    className="text-lg leading-relaxed"
                    style={{ color: theme.colors.text, fontFamily: theme.fontFamily }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              {(slide.imageUrl && slide.imageUrl.trim() !== '') ? (
                <img
                  key={`${slide.id}-${slide.imageUrl}-${forceRender}`}
                  src={slide.imageUrl}
                  alt={slide.title || 'Slide image'}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="w-24 h-24 bg-gray-300 rounded-lg mx-auto mb-4"></div>
                  <p>Image Placeholder</p>
                  <p className="text-sm">(Click Edit to add image)</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'text-left-canvas-right':
      case 'text-right-canvas-left':
        const isTextLeftCanvas = layout === 'text-left-canvas-right'
        return (
          <div
            className={`flex h-full ${isTextLeftCanvas ? 'flex-row' : 'flex-row-reverse'}`}
            style={themeStyles}
          >
            <div
              className="w-2/5 p-8 flex flex-col justify-center"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <h2
                className="text-3xl font-bold mb-6"
                style={{ color: theme.colors.primary, fontFamily: theme.fontFamily }}
              >
                {slide.title}
              </h2>
              <div className="space-y-3">
                {contentLines.map((line, index) => (
                  <p
                    key={index}
                    className="text-base leading-relaxed"
                    style={{ color: theme.colors.text, fontFamily: theme.fontFamily }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="w-3/5 h-full">
              <TldrawCanvas
                width={canvasSize.width}
                height={canvasSize.height}
                data={slide.canvasData}
                onChange={(data) => handleSlideUpdate({
                  ...slide,
                  canvasData: data,
                  theme: (slide as any).theme,
                  customTheme: (slide as any).customTheme
                })}
                showToolbar={!isPresentMode}
              />
            </div>
          </div>
        )

      case 'full-text':
        return (
          <div
            className="p-16 flex flex-col justify-center h-full"
            style={themeStyles}
          >
            <h2
              className="text-5xl font-bold mb-12 text-center"
              style={{ color: theme.colors.primary, fontFamily: theme.fontFamily }}
            >
              {slide.title}
            </h2>
            <div className="max-w-4xl mx-auto space-y-6">
              {contentLines.map((line, index) => (
                <p
                  key={index}
                  className="text-xl leading-relaxed text-center"
                  style={{ color: theme.colors.text, fontFamily: theme.fontFamily }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )

      case 'full-canvas':
        return (
          <div
            className="h-full flex flex-col relative group"
            style={themeStyles}
          >
            {slide.title && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <h2
                  className="text-2xl font-bold px-4 py-2 rounded-lg shadow-sm"
                  style={{
                    color: theme.colors.primary,
                    backgroundColor: `${theme.colors.surface}e6`,
                    fontFamily: theme.fontFamily,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {slide.title}
                </h2>
              </div>
            )}


            <div className="flex-1 relative">
              <TldrawCanvas
                width={canvasSize.width * 1.6}
                height={canvasSize.height * 1.4}
                data={slide.canvasData}
                onChange={(data) => handleSlideUpdate({
                  ...slide,
                  canvasData: data,
                  theme: (slide as any).theme,
                  customTheme: (slide as any).customTheme
                })}
                showToolbar={!isPresentMode}
                className="h-full"
              />
            </div>
          </div>
        )

      case 'full-image':
        return (
          <div
            className="h-full flex flex-col"
            style={themeStyles}
          >
            {slide.title && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <h2
                  className="text-2xl font-bold px-4 py-2 rounded-lg shadow-sm"
                  style={{
                    color: theme.colors.primary,
                    backgroundColor: `${theme.colors.surface}e6`,
                    fontFamily: theme.fontFamily,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {slide.title}
                </h2>
              </div>
            )}
            <div className="flex-1 relative flex items-center justify-center">
              {(slide.imageUrl && slide.imageUrl.trim() !== '') ? (
                <img
                  key={`${slide.id}-${slide.imageUrl}-${forceRender}`}
                  src={slide.imageUrl}
                  alt={slide.title || 'Full slide image'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{slide.title}</h3>
                  <p>Full Image Mode</p>
                  <p className="text-sm">Click Edit to add an image</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'transition':
        return (
          <div
            className="h-full flex items-center justify-center"
            style={{
              ...themeStyles,
              background: theme.colors.background.includes('gradient')
                ? theme.colors.background
                : `linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%)`
            }}
          >
            <div className="text-center">
              <h2
                className="text-5xl font-bold mb-4"
                style={{ color: theme.colors.primary, fontFamily: theme.fontFamily }}
              >
                {slide.title}
              </h2>
              {slide.content && (
                <p
                  className="text-xl"
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.fontFamily }}
                >
                  {slide.content}
                </p>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div
            className="p-12 flex flex-col justify-center h-full"
            style={themeStyles}
          >
            <h2
              className="text-4xl font-bold mb-8"
              style={{ color: theme.colors.primary, fontFamily: theme.fontFamily }}
            >
              {slide.title}
            </h2>
            <div className="space-y-4">
              {contentLines.map((line, index) => (
                <p
                  key={index}
                  className="text-lg leading-relaxed"
                  style={{ color: theme.colors.text, fontFamily: theme.fontFamily }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )
    }
  }

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No slides available</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{presentationTitle}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Slide {currentSlideIndex + 1} of {slidesState.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{currentSlide.template.replace('_', ' ')}</Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
              className={`${
                saveStatus === 'saved' ? 'border-green-500 text-green-600' :
                saveStatus === 'error' ? 'border-red-500 text-red-600' :
                ''
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Error
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={() => handleEditSlide(currentSlide)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDesignSlide(currentSlide)}>
              <Palette className="h-4 w-4 mr-2" />
              Design
            </Button>
            <Button variant="outline" size="sm" onClick={handleLibraryOpen}>
              <Images className="h-4 w-4 mr-2" />
              Library
            </Button>

            {/* Navigation Controls */}
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousSlide}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slidesState.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={enterPresentMode}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Fullscreen className="h-4 w-4 mr-2" />
                Present
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex ${isEditorOpen || isDesignerOpen || isLibraryOpen ? 'mr-96' : ''} transition-all duration-300`}>
        <div className="flex-1 flex flex-col">
          {/* Main Slide Display */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
            <div
              key={currentSlide?.template?.includes('CANVAS') ? `slide-${currentSlide?.id}` : `slide-${currentSlide?.id}-${forceRender}`}
              className="h-full bg-white shadow-lg rounded-lg overflow-hidden"
            >
              {renderSlideContent(currentSlide)}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">

            {/* Slide Thumbnails */}
            <div className="flex gap-2 overflow-x-auto py-2">
              {slidesState.map((slide, index) => (
                <div key={slide.id} className="relative group flex-shrink-0">
                  <button
                    onClick={() => goToSlide(index)}
                    className={`w-32 h-18 bg-white border-2 rounded-lg overflow-hidden transition-colors ${
                      index === currentSlideIndex
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 p-2">
                      <div className="text-center">
                        <div className="font-semibold truncate">{slide.title}</div>
                        <div className="text-xs opacity-75">{index + 1}</div>
                      </div>
                    </div>
                  </button>

                  {/* Slide Actions */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicateSlide(slide)
                        }}
                        title="Duplicate slide"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {slidesState.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0 bg-white/90 hover:bg-red-50 text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSlide(slide)
                          }}
                          title="Delete slide"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Slide Button */}
              <button
                onClick={handleAddSlide}
                className="flex-shrink-0 w-32 h-18 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                title="Add new slide"
              >
                <div className="text-center">
                  <Plus className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-xs">Add Slide</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Editor */}
      <SlideEditor
        slide={currentSlide}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSlideUpdate}
      />

      {/* Slide Designer */}
      <SlideDesigner
        slide={currentSlide}
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        onSave={handleThemeUpdate}
        onApplyToAll={handleApplyThemeToAll}
      />

      {/* Image Library */}
      <ImageLibrarySidebar
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onImageSelect={handleImageFromLibrary}
      />

      {/* Presentation Mode */}
      {isPresentMode && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Presentation Controls - Slightly visible by default, fully visible on hover */}
          <div className="absolute top-4 left-4 right-4 z-10 opacity-30 hover:opacity-100 transition-opacity group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-black/50 rounded-lg px-4 py-2">
                <span className="text-white text-sm">
                  {currentSlideIndex + 1} / {slidesState.length}
                </span>
                <span className="text-white/70 text-xs">•</span>
                <span className="text-white/70 text-xs">{currentSlide.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousSlide}
                  disabled={currentSlideIndex === 0}
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextSlide}
                  disabled={currentSlideIndex === slidesState.length - 1}
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exitPresentMode}
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Presentation Content */}
          <div className="flex-1 relative">
            <div className="h-full w-full">
              {renderSlideContent(currentSlide)}
            </div>
          </div>

          {/* Bottom Navigation - Slightly visible by default, fully visible on hover */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-30 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 bg-black/50 rounded-lg px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSlideIndex(0)}
                className="text-white hover:bg-white/10"
                title="Go to first slide"
              >
                First
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousSlide}
                disabled={currentSlideIndex === 0}
                className="text-white hover:bg-white/10"
                title="Previous slide (←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-white/70 text-sm px-2">
                {currentSlideIndex + 1} / {slidesState.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slidesState.length - 1}
                className="text-white hover:bg-white/10"
                title="Next slide (→)"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSlideIndex(slidesState.length - 1)}
                className="text-white hover:bg-white/10"
                title="Go to last slide"
              >
                Last
              </Button>
            </div>
          </div>

          {/* Keyboard shortcuts help */}
          <div className="absolute bottom-4 right-4 opacity-20 hover:opacity-100 transition-opacity">
            <div className="bg-black/50 rounded-lg px-3 py-2 text-white/70 text-xs">
              <div>← → : Navigate</div>
              <div>Esc : Exit</div>
              <div>Space : Next</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
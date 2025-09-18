'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slide, SlideTemplate } from '@/types'
import { SlideEditor } from './slide-editor'
import { TldrawCanvas } from './tldraw-canvas'
import { updateSlide } from '@/lib/actions/slide'
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
  Image as ImageIcon
} from 'lucide-react'

interface SlideViewerProps {
  slides: Slide[]
  presentationTitle: string
}

export function SlideViewer({ slides, presentationTitle }: SlideViewerProps) {
  const router = useRouter()
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [slidesState, setSlidesState] = useState(slides)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 })
  const [forceRender, setForceRender] = useState(0)

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
            console.error('Failed to auto-save canvas:', error)
          }
        }, 1000) // Save 1 second after last change
      }
    })(),
    []
  )


  useEffect(() => {
    const updateCanvasSize = () => {
      if (typeof window !== 'undefined') {
        const width = Math.floor(window.innerWidth * 0.6)
        const height = Math.floor(window.innerHeight * 0.7)
        setCanvasSize({ width, height })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

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
  }

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

    switch (layout) {
      case 'cover':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-16">
            <h1 className="text-6xl font-bold mb-8">{slide.title}</h1>
            {slide.content && (
              <p className="text-2xl opacity-90">{slide.content}</p>
            )}
          </div>
        )

      case 'text-left-image-right':
      case 'text-right-image-left':
        const isTextLeft = layout === 'text-left-image-right'
        return (
          <div className={`flex h-full ${isTextLeft ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className="flex-1 p-12 flex flex-col justify-center">
              <h2 className="text-4xl font-bold mb-8 text-gray-900">{slide.title}</h2>
              <div className="space-y-4">
                {contentLines.map((line, index) => (
                  <p key={index} className="text-lg text-gray-700 leading-relaxed">
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
          <div className={`flex h-full ${isTextLeftCanvas ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className="w-2/5 p-8 flex flex-col justify-center bg-gray-50">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">{slide.title}</h2>
              <div className="space-y-3">
                {contentLines.map((line, index) => (
                  <p key={index} className="text-base text-gray-700 leading-relaxed">
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
                onChange={(data) => handleSlideUpdate({...slide, canvasData: data})}
              />
            </div>
          </div>
        )

      case 'full-text':
        return (
          <div className="p-16 flex flex-col justify-center h-full">
            <h2 className="text-5xl font-bold mb-12 text-gray-900 text-center">{slide.title}</h2>
            <div className="max-w-4xl mx-auto space-y-6">
              {contentLines.map((line, index) => (
                <p key={index} className="text-xl text-gray-700 leading-relaxed text-center">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )

      case 'full-canvas':
        return (
          <div className="h-full flex flex-col relative group">
            {slide.title && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <h2 className="text-2xl font-bold text-gray-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                  {slide.title}
                </h2>
              </div>
            )}


            <div className="flex-1 relative">
              <TldrawCanvas
                width={canvasSize.width * 1.6}
                height={canvasSize.height * 1.4}
                data={slide.canvasData}
                onChange={(data) => handleSlideUpdate({...slide, canvasData: data})}
                showToolbar={false}
                className="h-full"
              />
            </div>
          </div>
        )

      case 'full-image':
        return (
          <div className="h-full flex flex-col">
            {slide.title && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <h2 className="text-2xl font-bold text-gray-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
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
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-gray-800 mb-4">{slide.title}</h2>
              {slide.content && (
                <p className="text-xl text-gray-600">{slide.content}</p>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="p-12 flex flex-col justify-center h-full">
            <h2 className="text-4xl font-bold mb-8 text-gray-900">{slide.title}</h2>
            <div className="space-y-4">
              {contentLines.map((line, index) => (
                <p key={index} className="text-lg text-gray-700 leading-relaxed">
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
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{presentationTitle}</h1>
            <p className="text-gray-600">
              Slide {currentSlideIndex + 1} of {slidesState.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{currentSlide.template.replace('_', ' ')}</Badge>
            <Button variant="outline" size="sm" onClick={() => handleEditSlide(currentSlide)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex ${isEditorOpen ? 'mr-96' : ''} transition-all duration-300`}>
        <div className="flex-1 flex flex-col">
          {/* Main Slide Display */}
          <div className="flex-1 bg-gray-100 p-4">
            <div
              key={currentSlide?.template?.includes('CANVAS') ? `slide-${currentSlide?.id}` : `slide-${currentSlide?.id}-${forceRender}`}
              className="h-full bg-white shadow-lg rounded-lg overflow-hidden"
            >
              {renderSlideContent(currentSlide)}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
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
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetPresentation}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={togglePlayPause}>
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                {currentSlide.narrationSegment && (
                  <Button variant="outline" size="sm">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Audio
                  </Button>
                )}
              </div>
            </div>

            {/* Slide Thumbnails */}
            <div className="flex gap-2 overflow-x-auto py-2">
              {slidesState.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-32 h-18 bg-white border-2 rounded-lg overflow-hidden transition-colors ${
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
              ))}
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
    </div>
  )
}
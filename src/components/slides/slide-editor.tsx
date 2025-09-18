'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slide, SlideTemplate } from '@/types'
import { updateSlide } from '@/lib/actions/slide'
import { ImageUploader } from './image-uploader'
import { AIImageGenerator } from './ai-image-generator'
import {
  Save,
  Upload,
  Wand2,
  Type,
  Image as ImageIcon,
  Palette,
  Settings,
  X
} from 'lucide-react'

interface SlideEditorProps {
  slide: Slide
  isOpen: boolean
  onClose: () => void
  onSave?: (updatedSlide: Slide) => void
}

export function SlideEditor({ slide, isOpen, onClose, onSave }: SlideEditorProps) {
  const [title, setTitle] = useState(slide.title || '')
  const [content, setContent] = useState(slide.content || '')
  const [template, setTemplate] = useState<SlideTemplate>(slide.template)
  const [imageUrl, setImageUrl] = useState(slide.imageUrl || '')
  const [canvasData, setCanvasData] = useState(slide.canvasData || null)
  const [narrationSegment, setNarrationSegment] = useState(slide.narrationSegment || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setTitle(slide.title || '')
    setContent(slide.content || '')
    setTemplate(slide.template)
    setImageUrl(slide.imageUrl || '')
    setCanvasData(slide.canvasData || null)
    setNarrationSegment(slide.narrationSegment || '')
  }, [slide])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedSlide = await updateSlide(slide.id, {
        title,
        content,
        template,
        imageUrl: imageUrl || undefined,
        canvasData: canvasData || undefined,
        narrationSegment: narrationSegment || undefined
      })

      onSave?.(updatedSlide)
      onClose()
    } catch (error) {
      // Error saving slide
    } finally {
      setIsSaving(false)
    }
  }

  const handleTemplateChange = (newTemplate: SlideTemplate) => {
    setTemplate(newTemplate)

    let updatedImageUrl = imageUrl
    let updatedCanvasData = canvasData

    // Clear incompatible data when changing templates
    if (!newTemplate.includes('IMAGE') && !newTemplate.includes('CANVAS')) {
      updatedImageUrl = ''
      updatedCanvasData = null
      setImageUrl('')
      setCanvasData(null)
    }

    // Update the slide immediately for real-time preview
    if (onSave) {
      const updatedSlide = {
        ...slide,
        template: newTemplate,
        title,
        content,
        imageUrl: updatedImageUrl,
        canvasData: updatedCanvasData,
        narrationSegment
      }
      onSave(updatedSlide)
    }
  }

  const handleImageUpload = (url: string) => {
    setImageUrl(url)
    if (onSave) {
      const updatedSlide = {
        ...slide,
        imageUrl: url || '',
        title,
        content,
        template,
        canvasData,
        narrationSegment
      }
      onSave(updatedSlide)
    }
  }

  const handleCanvasUpdate = (data: any) => {
    setCanvasData(data)
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (onSave) {
      const updatedSlide = {
        ...slide,
        title: newTitle,
        content,
        template,
        imageUrl,
        canvasData,
        narrationSegment
      }
      onSave(updatedSlide)
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    if (onSave) {
      const updatedSlide = {
        ...slide,
        title,
        content: newContent,
        template,
        imageUrl,
        canvasData,
        narrationSegment
      }
      onSave(updatedSlide)
    }
  }

  const getTemplateOptions = () => [
    { value: 'COVER', label: 'Cover Slide' },
    { value: 'TEXT_LEFT_IMAGE_RIGHT', label: 'Text Left, Image Right' },
    { value: 'TEXT_RIGHT_IMAGE_LEFT', label: 'Text Right, Image Left' },
    { value: 'TEXT_LEFT_CANVAS_RIGHT', label: 'Text Left, Canvas Right' },
    { value: 'TEXT_RIGHT_CANVAS_LEFT', label: 'Text Right, Canvas Left' },
    { value: 'FULL_TEXT', label: 'Full Text' },
    { value: 'FULL_IMAGE', label: 'Full Image' },
    { value: 'FULL_CANVAS', label: 'Full Canvas' },
    { value: 'TRANSITION', label: 'Transition Slide' }
  ]

  const isCanvasTemplate = template.includes('CANVAS')
  const isImageTemplate = template.includes('IMAGE')

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Slide</h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Basic Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={template} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getTemplateOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Slide title..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Type className="h-4 w-4" />
              Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Text Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Slide content..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="narration">Narration</Label>
              <Textarea
                id="narration"
                value={narrationSegment}
                onChange={(e) => setNarrationSegment(e.target.value)}
                placeholder="Narration script for this slide..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Visual Content */}
        {isImageTemplate && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Image Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="text-xs">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs">
                    <Wand2 className="h-3 w-3 mr-1" />
                    AI Generate
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <ImageUploader
                    currentImage={imageUrl}
                    onImageUpload={handleImageUpload}
                  />
                </TabsContent>

                <TabsContent value="ai" className="mt-4">
                  <AIImageGenerator
                    onImageGenerated={handleImageUpload}
                    slideContext={{ title, content }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Canvas Info */}
        {isCanvasTemplate && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Canvas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p>The interactive canvas is now displayed directly on your slide for audience interaction.</p>
                <p>All drawing tools and annotations will be visible to your audience in real-time.</p>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
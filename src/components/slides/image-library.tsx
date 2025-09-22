'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Search,
  Images,
  Trash2,
  RefreshCw,
  Clock,
  Palette
} from 'lucide-react'
import {
  ImageLibrary
} from '@/types'
import {
  getImageLibrary,
  deleteImageFromLibrary,
  getImageLibraryStats
} from '@/lib/actions/image-library'

interface ImageLibraryProps {
  isOpen: boolean
  onClose: () => void
  onImageSelect: (imageUrl: string) => void
}

export function ImageLibrarySidebar({ isOpen, onClose, onImageSelect }: ImageLibraryProps) {
  const [images, setImages] = useState<ImageLibrary[]>([])
  const [filteredImages, setFilteredImages] = useState<ImageLibrary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [styleFilter, setStyleFilter] = useState<string>('')
  const [modelFilter, setModelFilter] = useState<string>('')
  const [stats, setStats] = useState<{
    totalImages: number
    byStyle: Record<string, number>
    byModel: Record<string, number>
    recentCount: number
  } | null>(null)

  // Load images on mount and when opened
  useEffect(() => {
    if (isOpen) {
      loadImages()
      loadStats()
    }
  }, [isOpen])

  // Filter images when search/filter criteria change
  useEffect(() => {
    filterImages()
  }, [images, searchTerm, styleFilter, modelFilter])

  const loadImages = async () => {
    setLoading(true)
    try {
      const imageList = await getImageLibrary()
      setImages(imageList)
    } catch (error) {
      console.error('Failed to load image library:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await getImageLibraryStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const filterImages = () => {
    let filtered = images

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Style filter
    if (styleFilter) {
      filtered = filtered.filter(img => img.style === styleFilter)
    }

    // Model filter
    if (modelFilter) {
      filtered = filtered.filter(img => img.aiModel === modelFilter)
    }

    setFilteredImages(filtered)
  }

  const handleImageClick = (image: ImageLibrary) => {
    onImageSelect(image.url)
    onClose()
  }

  const handleDeleteImage = async (image: ImageLibrary) => {
    if (!confirm('Are you sure you want to delete this image from your library?')) {
      return
    }

    try {
      await deleteImageFromLibrary(image.id)
      setImages(prev => prev.filter(img => img.id !== image.id))
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStyleFilter('')
    setModelFilter('')
  }

  if (!isOpen) return null

  const uniqueStyles = [...new Set(images.map(img => img.style))]
  const uniqueModels = [...new Set(images.map(img => img.aiModel))]

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Images className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Image Library</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalImages}</div>
              <div className="text-xs text-gray-600">Total Images</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.recentCount}</div>
              <div className="text-xs text-gray-600">This Week</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.byStyle).length}</div>
              <div className="text-xs text-gray-600">Styles</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Styles</SelectItem>
              {uniqueStyles.map(style => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Models</SelectItem>
              {uniqueModels.map(model => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
          <Button variant="outline" size="sm" onClick={loadImages} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading images...
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No images found</p>
              <p className="text-sm">Generate some images to build your library!</p>
            </div>
          ) : (
            filteredImages.map((image) => (
              <Card
                key={image.id}
                className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all group"
                onClick={() => handleImageClick(image)}
              >
                <CardContent className="p-3">
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-32 object-cover rounded"
                    />

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteImage(image)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Image details */}
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-600 line-clamp-2">{image.prompt}</p>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Palette className="h-3 w-3 mr-1" />
                        {image.style}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {image.aiModel}
                      </Badge>
                    </div>

                    {image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {image.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {image.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{image.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {new Date(image.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-500">
          Click any image to use it in your slide
        </p>
      </div>
    </div>
  )
}
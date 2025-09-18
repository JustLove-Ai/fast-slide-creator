'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  currentImage?: string
  onImageUpload: (url: string) => void
}

export function ImageUploader({ currentImage, onImageUpload }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB')
      return
    }

    setIsUploading(true)

    try {
      // Convert file to base64 for demo purposes
      // In production, you'd upload to a cloud storage service
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageUpload(result)
        setIsUploading(false)
      }
      reader.onerror = () => {
        console.error('Error reading file')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Upload error:', error)
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return

    try {
      new URL(urlInput) // Validate URL
      onImageUpload(urlInput)
      setUrlInput('')
    } catch (error) {
      alert('Please enter a valid URL')
    }
  }

  const removeImage = () => {
    onImageUpload('')
    setUrlInput('')
  }

  return (
    <div className="space-y-4">
      {/* Current Image Preview */}
      {currentImage && (
        <Card>
          <CardContent className="p-3">
            <div className="relative">
              <img
                src={currentImage}
                alt="Current slide image"
                className="w-full h-32 object-cover rounded border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-3">
          Drag and drop an image here, or click to select
        </p>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Select Image'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="image-url">Or enter an image URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="image-url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
          </div>
          <Button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            variant="outline"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Supported Formats */}
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF, WebP (max 10MB)
      </p>
    </div>
  )
}
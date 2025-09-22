'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wand2, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { generateImages } from '@/lib/actions/ai-image-generation'

interface AIImageGeneratorProps {
  onImageGenerated: (url: string) => void
  slideContext?: {
    title?: string
    content?: string
  }
}

export function AIImageGenerator({ onImageGenerated, slideContext }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<'realistic' | 'illustration' | 'abstract' | 'minimalist' | 'corporate' | 'infographic'>('realistic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const styles = [
    { value: 'realistic', label: 'Realistic' },
    { value: 'illustration', label: 'Illustration' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'infographic', label: 'Infographic' }
  ]

  const generateSuggestion = () => {
    if (!slideContext?.title && !slideContext?.content) {
      setPrompt('Professional business illustration, clean design, modern style')
      return
    }

    const suggestions = [
      `Illustration representing ${slideContext.title || 'the concept'}, professional style`,
      `Modern diagram showing ${slideContext.title || 'the idea'}, clean vector style`,
      `Abstract representation of ${slideContext.title || 'the topic'}, corporate design`,
      `Infographic style visual for ${slideContext.title || 'the content'}, simple and clear`
    ]

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    setPrompt(randomSuggestion)
  }

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImages([])

    try {
      const result = await generateImages({
        prompt: prompt.trim(),
        style,
        size: '1024x1024',
        n: 1 // Generate 1 image at a time - user can regenerate if needed
      })

      if (result.success && result.images) {
        setGeneratedImages(result.images)
        setError(null)
      } else {
        setError(result.error || 'Failed to generate images')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      setError('Error generating image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const selectImage = (imageUrl: string) => {
    onImageGenerated(imageUrl)
    setGeneratedImages([]) // Clear generated images after selection
  }

  return (
    <div className="space-y-4">
      {/* Prompt Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="ai-prompt">Image Description</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestion}
            className="h-6 text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Suggest
          </Button>
        </div>
        <Textarea
          id="ai-prompt"
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <Label htmlFor="style">Style</Label>
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {styles.map((styleOption) => (
              <SelectItem key={styleOption.value} value={styleOption.value}>
                {styleOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateImage}
        disabled={isGenerating || !prompt.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Generating with GPT-Image-1...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Image
          </>
        )}
      </Button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Generated Image */}
      {generatedImages.length > 0 && (
        <div className="space-y-2">
          <Label>Generated Image</Label>
          <Card
            className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
            onClick={() => selectImage(generatedImages[0])}
          >
            <CardContent className="p-2">
              <img
                src={generatedImages[0]}
                alt="Generated image"
                className="w-full h-32 object-cover rounded"
              />
              <div className="mt-2 text-xs text-center text-gray-500">
                Click to use this image
              </div>
            </CardContent>
          </Card>
          <Button
            variant="outline"
            size="sm"
            onClick={generateImage}
            disabled={isGenerating}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Tips for better results with GPT-Image-1:</strong></p>
        <ul className="space-y-1 ml-4">
          <li>• Be specific about style, composition, and colors</li>
          <li>• Mention the mood and visual elements you want</li>
          <li>• Include context about your presentation topic</li>
          <li>• Specify if you want realistic photos vs illustrations</li>
        </ul>
      </div>

      {/* AI Model Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
        <strong>✨ Powered by OpenAI GPT-Image-1:</strong> Latest AI image generation model with improved quality, style diversity, and text rendering capabilities.
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wand2, Sparkles, RefreshCw } from 'lucide-react'

interface AIImageGeneratorProps {
  onImageGenerated: (url: string) => void
  slideContext?: {
    title?: string
    content?: string
  }
}

export function AIImageGenerator({ onImageGenerated, slideContext }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

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
      alert('Please enter a prompt')
      return
    }

    setIsGenerating(true)

    try {
      // Mock AI image generation
      // In production, this would call OpenAI DALL-E or similar service
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call

      // Generate placeholder images for demo
      const mockImages = [
        `https://picsum.photos/400/300?random=${Date.now()}&blur=1`,
        `https://picsum.photos/400/300?random=${Date.now() + 1}&grayscale`,
        `https://picsum.photos/400/300?random=${Date.now() + 2}`
      ]

      setGeneratedImages(mockImages)
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Error generating image. Please try again.')
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
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Image
          </>
        )}
      </Button>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="space-y-2">
          <Label>Generated Images (Click to select)</Label>
          <div className="grid grid-cols-1 gap-2">
            {generatedImages.map((imageUrl, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                onClick={() => selectImage(imageUrl)}
              >
                <CardContent className="p-2">
                  <img
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Tips for better results:</strong></p>
        <ul className="space-y-1 ml-4">
          <li>• Be specific about style and composition</li>
          <li>• Mention colors, mood, and visual elements</li>
          <li>• Include context about your presentation topic</li>
        </ul>
      </div>

      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
        <strong>Demo Mode:</strong> This generates placeholder images. In production, this would connect to OpenAI DALL-E or similar AI image generation service.
      </div>
    </div>
  )
}
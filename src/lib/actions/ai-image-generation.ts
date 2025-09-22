'use server'

import { generateImage, ImageGenerationOptions } from '@/lib/ai/openai-service'
import { saveImageToLibrary } from './image-library'

export interface GenerateImagesResult {
  success: boolean
  images?: string[]
  error?: string
  savedToLibrary?: boolean
}

export async function generateImages(options: ImageGenerationOptions): Promise<GenerateImagesResult> {
  try {
    const images = await generateImage(options)
    let savedToLibrary = false

    // Attempt to save to library, but don't fail image generation if this fails
    if (images.length > 0) {
      try {
        console.log('Attempting to save image to library...')
        await saveImageToLibrary({
          url: images[0],
          prompt: options.prompt,
          style: options.style || 'realistic',
          aiModel: 'gpt-image-1', // This will be determined by the actual model used
          tags: extractTagsFromPrompt(options.prompt),
          isGenerated: true
        })
        savedToLibrary = true
        console.log('✅ Image saved to library successfully')
      } catch (libraryError) {
        console.warn('⚠️ Failed to save image to library (image generation still successful):', libraryError?.message || libraryError)
        console.log('📸 Image was generated successfully but not saved to library due to database issue')
        // Don't fail the main operation if library save fails
        savedToLibrary = false
      }
    }

    return {
      success: true,
      images,
      savedToLibrary
    }
  } catch (error) {
    console.error('Error in generateImages server action:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate images'
    }
  }
}

// Helper function to extract relevant tags from prompt
function extractTagsFromPrompt(prompt: string): string[] {
  const commonTags = [
    'business', 'professional', 'presentation', 'corporate', 'modern', 'clean',
    'abstract', 'illustration', 'realistic', 'minimalist', 'colorful', 'diagram',
    'chart', 'graph', 'icon', 'symbol', 'concept', 'technology', 'team', 'growth',
    'success', 'innovation', 'strategy', 'leadership', 'communication', 'data'
  ]

  const promptLower = prompt.toLowerCase()
  const extractedTags: string[] = []

  // Extract tags that appear in the prompt
  commonTags.forEach(tag => {
    if (promptLower.includes(tag)) {
      extractedTags.push(tag)
    }
  })

  // Add style-based tags
  if (promptLower.includes('photo') || promptLower.includes('realistic')) {
    extractedTags.push('realistic')
  }
  if (promptLower.includes('illustration') || promptLower.includes('vector')) {
    extractedTags.push('illustration')
  }
  if (promptLower.includes('abstract')) {
    extractedTags.push('abstract')
  }

  // Ensure we have at least some basic tags
  if (extractedTags.length === 0) {
    extractedTags.push('presentation', 'generated')
  }

  return [...new Set(extractedTags)] // Remove duplicates
}
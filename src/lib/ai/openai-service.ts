import OpenAI from 'openai'
import { ContentAngle, HookAngle } from '@/types'
import { getContentAngleByName } from '@/lib/content-angles'
import { getHookAngleByName } from '@/lib/hook-angles'
import { buildPresentationPrompt, buildUserPrompt } from './prompts'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AISlideContent {
  title: string
  content: string
}

export interface AIGeneratedPresentation {
  hookSlide: AISlideContent
  whatSlide: AISlideContent
  whySlide: AISlideContent
  howSlide: AISlideContent
  conclusionSlide: AISlideContent
}

export async function generatePresentationContent(
  brainstormContent: string,
  audience: string,
  contentAngle: ContentAngle,
  hookAngle?: HookAngle
): Promise<AIGeneratedPresentation> {
  const contentAngleData = getContentAngleByName(contentAngle)
  const hookAngleData = hookAngle ? getHookAngleByName(hookAngle) : undefined

  const systemPrompt = buildPresentationPrompt({
    contentAngle: contentAngleData,
    hookAngle: hookAngleData,
    audience: audience || 'General audience'
  })

  const userPrompt = buildUserPrompt(brainstormContent)

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    const generatedContent: AIGeneratedPresentation = JSON.parse(responseContent)
    return generatedContent

  } catch (error) {
    console.error('Error generating presentation content:', error)
    throw new Error('Failed to generate presentation content')
  }
}

export interface ImageGenerationOptions {
  prompt: string
  style?: 'realistic' | 'illustration' | 'abstract' | 'minimalist' | 'corporate' | 'infographic'
  size?: '1024x1024' | '1024x1536' | '1536x1024'
  quality?: 'low' | 'medium' | 'high'
  n?: number
}

export async function generateImage(options: ImageGenerationOptions): Promise<string[]> {
  const { prompt, style = 'realistic', size = '1024x1024' } = options

  // Check if API key is available
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured')
  }

  // Enhance prompt based on style
  const stylePrompts = {
    realistic: 'Professional, photorealistic',
    illustration: 'Clean illustration style, vector art',
    abstract: 'Abstract, artistic representation',
    minimalist: 'Minimalist design, clean and simple',
    corporate: 'Corporate presentation style, professional',
    infographic: 'Infographic style, clear and informative'
  }

  const enhancedPrompt = `${stylePrompts[style]}, ${prompt}. High quality, professional presentation slide image. Clean, modern design. No text overlays.`

  console.log('Generating image with prompt:', enhancedPrompt)

  try {
    // Try gpt-image-1 first, fallback to dall-e-3 if not available
    let response
    try {
      response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: enhancedPrompt,
        size: size,
        n: 1,
        response_format: "url" // Request URL instead of base64
      })
    } catch (gptImageError) {
      console.log('gpt-image-1 not available, falling back to dall-e-3')
      response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        size: size,
        quality: "hd",
        n: 1,
        response_format: "url"
      })
    }

    // Debug: Log the response structure
    console.log('OpenAI Image Generation Response:', JSON.stringify(response, null, 2))
    console.log('Response data structure:', response.data)
    console.log('First data item:', response.data[0])

    // Try different ways to access the image URL
    let imageUrl = response.data[0]?.url || response.data[0]?.revised_prompt_url || response.data[0]?.b64_json

    // If it's base64, we'd need to handle that differently (but OpenAI usually returns URLs)
    if (!imageUrl && response.data[0]) {
      console.log('Available properties in first data item:', Object.keys(response.data[0]))
      // Try to find any URL-like property
      const dataItem = response.data[0]
      imageUrl = dataItem.url || dataItem.image_url || dataItem.revised_prompt || dataItem.generated_image_url
    }

    if (!imageUrl) {
      console.error('No image URL found in response data:', response.data)
      console.error('Full response structure:', response)
      throw new Error('No image was generated - check console for response details')
    }

    return [imageUrl]

  } catch (error) {
    console.error('Error generating image:', error)
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}


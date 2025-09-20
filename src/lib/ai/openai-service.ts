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


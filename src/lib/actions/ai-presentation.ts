'use server'

import { revalidatePath } from 'next/cache'
import { ContentAngle, HookAngle } from '@/types'
import { createBrainstorm } from './brainstorm'
import { createDefaultContextProfile } from './context-profile'
import { createPresentation } from './presentation'
import { createSlide } from './slide'
import { generateSlides } from '@/lib/slide-generator'

export interface CreateAIPresentationData {
  brainstormContent: string
  audienceInfo?: string
  contentAngle?: ContentAngle
  hookAngle?: HookAngle
}

export async function createAIPresentationWithSlides(
  data: CreateAIPresentationData
) {
  try {
    const {
      brainstormContent,
      audienceInfo,
      contentAngle = 'PASE',
      hookAngle
    } = data

    // Create brainstorm
    const brainstorm = await createBrainstorm({
      title: brainstormContent.split('\n')[0].slice(0, 100) + (brainstormContent.length > 100 ? '...' : ''),
      content: brainstormContent,
      tags: []
    })

    // Create context profile (or use default)
    const contextProfile = await createDefaultContextProfile({
      name: 'Quick Start Context',
      audience: audienceInfo || 'General audience',
      objectives: ['Create engaging presentation'],
      preferences: { tone: 'professional', style: 'modern' }
    })

    // Create presentation
    const presentation = await createPresentation({
      title: brainstorm.title,
      brainstormId: brainstorm.id,
      contextProfileId: contextProfile.id,
      contentAngle: contentAngle,
      hookAngle: hookAngle
    })

    // Generate slides using AI (this happens on server side now)
    const generatedSlides = await generateSlides(
      brainstorm,
      contextProfile,
      contentAngle,
      hookAngle
    )

    // Create slides in the database
    await Promise.all(
      generatedSlides.map((slideData, index) =>
        createSlide(presentation.id, {
          order: index,
          template: slideData.template,
          title: slideData.title,
          content: slideData.content,
          narrationSegment: slideData.narrationSegment,
          imageUrl: slideData.imageUrl
        })
      )
    )

    revalidatePath('/presentations')
    return { success: true, presentationId: presentation.id }

  } catch (error) {
    console.error('Error creating AI presentation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
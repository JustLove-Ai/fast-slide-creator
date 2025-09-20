import {
  Brainstorm,
  ContextProfile,
  ContentAngle,
  HookAngle,
  SlideTemplate,
  AIGeneratedSlide
} from '@/types'
import { generatePresentationContent } from '@/lib/ai/openai-service'
import { getContentAngleByName } from '@/lib/content-angles'

// AI-powered slide generation using OpenAI with logical flow structure
export async function generateSlides(
  brainstorm: Brainstorm,
  contextProfile: ContextProfile,
  contentAngle: ContentAngle,
  hookAngle?: HookAngle
): Promise<AIGeneratedSlide[]> {
  try {
    // Generate AI-powered presentation content
    const aiContent = await generatePresentationContent(
      brainstorm.content,
      contextProfile.targetAudience,
      contentAngle,
      hookAngle
    )

    const slides: AIGeneratedSlide[] = []

    // 1. Hook Slide - Opening that captures attention
    slides.push({
      title: aiContent.hookSlide.title,
      content: aiContent.hookSlide.content,
      template: 'COVER' as SlideTemplate,
      narrationSegment: aiContent.hookSlide.content.slice(0, 200),
      imageUrl: undefined // User will add images manually
    })

    // 2. What Slide - Define the main concept/problem
    slides.push({
      title: aiContent.whatSlide.title,
      content: aiContent.whatSlide.content,
      template: 'TEXT_LEFT_IMAGE_RIGHT' as SlideTemplate,
      narrationSegment: aiContent.whatSlide.content.slice(0, 200),
      imageUrl: undefined
    })

    // 3. Why Slide - Explain why this matters
    slides.push({
      title: aiContent.whySlide.title,
      content: aiContent.whySlide.content,
      template: 'TEXT_RIGHT_IMAGE_LEFT' as SlideTemplate,
      narrationSegment: aiContent.whySlide.content.slice(0, 200),
      imageUrl: undefined
    })

    // 4. How Slide - Show the solution/process/method
    slides.push({
      title: aiContent.howSlide.title,
      content: aiContent.howSlide.content,
      template: 'TEXT_LEFT_IMAGE_RIGHT' as SlideTemplate,
      narrationSegment: aiContent.howSlide.content.slice(0, 200),
      imageUrl: undefined
    })

    // 5. Conclusion Slide - Wrap up with clear next steps
    slides.push({
      title: aiContent.conclusionSlide.title,
      content: aiContent.conclusionSlide.content,
      template: 'FULL_TEXT' as SlideTemplate,
      narrationSegment: aiContent.conclusionSlide.content.slice(0, 200),
      imageUrl: undefined
    })

    return slides

  } catch (error) {
    console.error('Error generating AI slides:', error)

    // Fallback to simple slides if AI generation fails
    return generateFallbackSlides(brainstorm, contextProfile, contentAngle)
  }
}

// Fallback slide generation if AI fails - follows logical flow structure
function generateFallbackSlides(
  brainstorm: Brainstorm,
  contextProfile: ContextProfile,
  contentAngle: ContentAngle
): AIGeneratedSlide[] {
  const contentAngleData = getContentAngleByName(contentAngle)

  return [
    {
      title: brainstorm.title,
      content: `• Welcome to our presentation\n• Today we'll explore: ${brainstorm.title}\n• Designed for: ${contextProfile.targetAudience}`,
      template: 'COVER' as SlideTemplate,
      narrationSegment: `Welcome to our presentation on ${brainstorm.title}.`,
      imageUrl: undefined
    },
    {
      title: 'What Are We Discussing?',
      content: `• Core concept: ${brainstorm.content.slice(0, 100)}...\n• Key definition and scope\n• Setting the foundation for understanding`,
      template: 'TEXT_LEFT_IMAGE_RIGHT' as SlideTemplate,
      narrationSegment: 'Let me start by defining what we\'re discussing today.',
      imageUrl: undefined
    },
    {
      title: 'Why This Matters',
      content: `• Relevant to ${contextProfile.targetAudience}\n• Addresses current challenges\n• Creates valuable opportunities`,
      template: 'TEXT_RIGHT_IMAGE_LEFT' as SlideTemplate,
      narrationSegment: 'Here\'s why this should matter to you.',
      imageUrl: undefined
    },
    {
      title: 'How It Works',
      content: `• Step-by-step approach\n• Practical implementation\n• Clear action points`,
      template: 'TEXT_LEFT_IMAGE_RIGHT' as SlideTemplate,
      narrationSegment: 'Now let me show you how this actually works.',
      imageUrl: undefined
    },
    {
      title: 'Next Steps',
      content: `• Key takeaways from today\n• Immediate actions you can take\n• How to move forward effectively`,
      template: 'FULL_TEXT' as SlideTemplate,
      narrationSegment: 'Let\'s wrap up with clear next steps.',
      imageUrl: undefined
    }
  ]
}


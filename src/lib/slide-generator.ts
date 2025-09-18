import {
  Brainstorm,
  ContextProfile,
  ContentAngle,
  SlideTemplate,
  AIGeneratedSlide
} from '@/types'
import { getContentAngleByName } from '@/lib/content-angles'

// Mock AI slide generation - in production this would call OpenAI or similar
export async function generateSlides(
  brainstorm: Brainstorm,
  contextProfile: ContextProfile,
  contentAngle: ContentAngle
): Promise<AIGeneratedSlide[]> {
  const angleDefinition = getContentAngleByName(contentAngle)

  // Create slides based on the content angle framework
  const slides: AIGeneratedSlide[] = []

  // Title slide
  slides.push({
    title: `${brainstorm.title}`,
    content: `A ${contentAngle} Framework Presentation`,
    template: 'COVER' as SlideTemplate,
    narrationSegment: `Welcome to our presentation on ${brainstorm.title}. Today we'll explore this topic using the ${angleDefinition.label} framework.`
  })

  // Framework-specific slides
  const components = Object.entries(angleDefinition.components)

  components.forEach(([key, component], index) => {
    // Extract relevant content from brainstorm for this component
    const contentSnippet = extractRelevantContent(brainstorm.content, component.description)

    slides.push({
      title: component.label,
      content: `${component.description}\n\n${contentSnippet}`,
      template: (index % 2 === 0 ? 'TEXT_LEFT_IMAGE_RIGHT' : 'TEXT_RIGHT_IMAGE_LEFT') as SlideTemplate,
      narrationSegment: `For the ${component.label} component: ${component.description}. ${contentSnippet}`
    })
  })

  // Application slide
  slides.push({
    title: 'Application to Your Context',
    content: `For ${contextProfile.targetAudience}:\n\n${contextProfile.objectives}`,
    template: 'FULL_TEXT' as SlideTemplate,
    narrationSegment: `Now let's consider how this applies to your specific context and objectives.`
  })

  // Call to action slide
  slides.push({
    title: 'Next Steps',
    content: generateCallToAction(contentAngle, contextProfile),
    template: 'TEXT_LEFT_CANVAS_RIGHT' as SlideTemplate,
    narrationSegment: `Here are your actionable next steps to implement these ideas.`
  })

  return slides
}

function extractRelevantContent(brainstormContent: string, componentDescription: string): string {
  // Simple extraction - in production this would use AI to match content to components
  const sentences = brainstormContent.split('.').filter(s => s.trim().length > 20)

  // Return a relevant snippet (this is simplified - AI would do semantic matching)
  const relevantSentence = sentences[Math.floor(Math.random() * sentences.length)] || brainstormContent.slice(0, 200)

  return relevantSentence.trim() + (relevantSentence.endsWith('.') ? '' : '...')
}

function generateCallToAction(contentAngle: ContentAngle, contextProfile: ContextProfile): string {
  const baseActions = {
    CUB: [
      'Challenge existing assumptions in your field',
      'Identify practical applications for your audience',
      'Connect insights to broader business implications'
    ],
    PASE: [
      'Define the core problem clearly',
      'Quantify the impact of inaction',
      'Implement the solution systematically',
      'Scale to broader applications'
    ],
    HEAR: [
      'Craft compelling opening hooks',
      'Build empathy with your audience',
      'Establish thought leadership',
      'Create clear implementation roadmaps'
    ]
  }

  const actions = baseActions[contentAngle]
  return actions.map((action, index) => `${index + 1}. ${action}`).join('\n')
}
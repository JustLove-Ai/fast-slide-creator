import { ContentAngle, ContentAngleDefinition } from '@/types'

export const CONTENT_ANGLES: Record<ContentAngle, ContentAngleDefinition> = {
  CUB: {
    name: 'CUB',
    label: 'CUB Framework',
    description: 'Contrarian - Useful - Bridge',
    components: {
      contrarian: {
        label: 'Contrarian',
        description: 'Challenge conventional wisdom with a bold, different perspective',
        example: 'Software engineers say you need a PRD and a wireframe before you start. Wrong. Three bad prototypes are worth more than one perfect plan.'
      },
      useful: {
        label: 'Useful',
        description: 'Provide practical, actionable value that people can immediately apply',
        example: 'Here\'s my 4-step Explore Method: pick one idea, create 3 different prompts, compare the outputs, and keep what works.'
      },
      bridge: {
        label: 'Bridge',
        description: 'Connect your specific insight to broader implications and opportunities',
        example: 'AI makes iteration nearly free. That changes not just coding, but the way we build businesses.'
      }
    }
  },
  PASE: {
    name: 'PASE',
    label: 'PASE Framework',
    description: 'Problem - Agitate - Solve - Expand',
    components: {
      problem: {
        label: 'Problem',
        description: 'Identify and clearly articulate the core issue your audience faces',
        example: 'Most teams spend months in planning mode.'
      },
      agitate: {
        label: 'Agitate',
        description: 'Highlight the consequences and pain points of not addressing the problem',
        example: 'By the time your wireframe is polished, the market has moved, and you\'re already behind.'
      },
      solve: {
        label: 'Solve',
        description: 'Present your solution as the clear path forward',
        example: 'Explore Method: create 3 versions in a day, spot what doesn\'t work, and refine fast.'
      },
      expand: {
        label: 'Expand',
        description: 'Show how your solution opens up new possibilities and opportunities',
        example: 'This mindset lets you pivot, test, and innovate faster than traditional teams ever could.'
      }
    }
  },
  HEAR: {
    name: 'HEAR',
    label: 'HEAR Framework',
    description: 'Hook - Empathy - Authority - Roadmap',
    components: {
      hook: {
        label: 'Hook',
        description: 'Grab attention immediately with a compelling opening',
        example: 'Perfect planning kills creativity.'
      },
      empathy: {
        label: 'Empathy',
        description: 'Show understanding of your audience\'s struggles and experiences',
        example: 'I used to waste weeks on specs that nobody even looked at.'
      },
      authority: {
        label: 'Authority',
        description: 'Establish your credibility and unique perspective',
        example: 'That\'s why I developed the Explore Method — 3 prototypes instead of 1 plan.'
      },
      roadmap: {
        label: 'Roadmap',
        description: 'Provide clear, actionable next steps',
        example: 'Step 1: Pick an idea. Step 2: Write 3 prompts. Step 3: Compare results. Step 4: Keep the spark, toss the junk.'
      }
    }
  }
}

export function getContentAngleByName(name: ContentAngle): ContentAngleDefinition {
  return CONTENT_ANGLES[name]
}

export function getAllContentAngles(): ContentAngleDefinition[] {
  return Object.values(CONTENT_ANGLES)
}
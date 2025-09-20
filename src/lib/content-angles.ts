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
  },
  YOUTUBE: {
    name: 'YOUTUBE',
    label: 'YouTube Framework',
    description: 'Hook - Setup - Value Points (YouTube optimized)',
    components: {
      hook: {
        label: 'Hook',
        description: 'Grab attention in the first 15 seconds with an intriguing statement or question',
        example: 'This one productivity trick changed how I work forever.'
      },
      setup: {
        label: 'Setup',
        description: 'Provide context and set expectations for what viewers will learn',
        example: 'Today I\'m going to show you the exact method I use to get twice as much done in half the time.'
      },
      valuePoint1: {
        label: 'Value Point 1',
        description: 'First key insight or actionable takeaway',
        example: 'Start with the hardest task when your brain is fresh.'
      },
      valuePoint2: {
        label: 'Value Point 2',
        description: 'Second key insight or actionable takeaway',
        example: 'Use the 2-minute rule: if it takes less than 2 minutes, do it now.'
      },
      valuePoint3: {
        label: 'Value Point 3',
        description: 'Third key insight or actionable takeaway',
        example: 'Batch similar tasks together to minimize context switching.'
      },
      valuePoint4: {
        label: 'Value Point 4 (Optional)',
        description: 'Additional insight for comprehensive coverage',
        example: 'End each day by planning the next morning\'s priorities.'
      }
    }
  },
  WHATWHYHOW: {
    name: 'WHATWHYHOW',
    label: 'What-Why-How Framework',
    description: 'What - Why - How (Clear explanatory structure)',
    components: {
      what: {
        label: 'What',
        description: 'Define and explain what you\'re presenting clearly',
        example: 'The Pomodoro Technique is a time management method using 25-minute focused work sessions.'
      },
      why: {
        label: 'Why',
        description: 'Explain the importance, benefits, and reasoning behind it',
        example: 'It works because it leverages your brain\'s natural attention cycles and prevents burnout through regular breaks.'
      },
      how: {
        label: 'How',
        description: 'Provide step-by-step instructions for implementation',
        example: 'Set a 25-minute timer, work on one task, take a 5-minute break, then repeat. After 4 cycles, take a longer 30-minute break.'
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
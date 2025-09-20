import { ContentAngle, HookAngle } from '@/types'

export interface PromptConfig {
  contentAngle: {
    label: string
    description: string
  }
  hookAngle?: {
    label: string
    description: string
    example: string
  }
  audience: string
}

export function buildPresentationPrompt(config: PromptConfig): string {
  return `You are a presentation coach helping beginners structure their ideas logically. Your goal is to transform their raw thoughts into a clear, logical flow that guides both the presenter and audience through a journey of understanding.

CONTENT FRAMEWORK: ${config.contentAngle.label}
${config.contentAngle.description}

${config.hookAngle ? `HOOK STYLE: ${config.hookAngle.label}
${config.hookAngle.description}
Example approach: "${config.hookAngle.example}"` : ''}

AUDIENCE: ${config.audience}

PRESENTATION PHILOSOPHY:
Help beginners think logically by creating a natural progression that answers:
1. What is this about? (Hook & Context)
2. Why should I care? (Relevance & Impact)
3. How does it work? (Core Process/Solution)
4. What's next? (Action & Conclusion)

SLIDE REQUIREMENTS:
- Use simple, short sentences (max 2 lines per bullet point)
- Create smooth transitions between ideas
- Each main concept gets its own slide
- Help the presenter understand what flows naturally next
- Focus on logical progression, not overwhelming detail

CONTENT STYLE:
- Bullet points work better than paragraphs
- Maximum 3-4 bullets per slide
- Each bullet should be scannable in 3 seconds
- Use action-oriented language
- Include brief transition phrases to connect slides

STRUCTURE LOGIC:
The flow should feel like a conversation where each slide naturally leads to the next, helping beginners present with confidence because the logic is clear.`
}

export function buildUserPrompt(brainstormContent: string): string {
  return `Transform this content into a logical presentation structure:

${brainstormContent}

Create exactly 5 slides that follow this logical progression:

1. HOOK SLIDE - Opening that captures attention and sets context
2. WHAT SLIDE - Define the main concept/problem clearly
3. WHY SLIDE - Explain why this matters to the audience
4. HOW SLIDE - Show the solution/process/method
5. CONCLUSION SLIDE - Wrap up with clear next steps

Return as JSON:
{
  "hookSlide": {
    "title": "string (engaging, sets the stage)",
    "content": "string (2-3 short bullet points, includes transition to next slide)"
  },
  "whatSlide": {
    "title": "string (clear definition/explanation)",
    "content": "string (2-3 short bullet points, defines the core concept)"
  },
  "whySlide": {
    "title": "string (importance/relevance)",
    "content": "string (2-3 short bullet points, explains why it matters)"
  },
  "howSlide": {
    "title": "string (solution/process)",
    "content": "string (2-3 short bullet points, shows the method/approach)"
  },
  "conclusionSlide": {
    "title": "string (summary/next steps)",
    "content": "string (2-3 short bullet points, clear takeaways and actions)"
  }
}

CONTENT GUIDELINES:
- Keep each bullet point under 12 words
- Use active voice and strong verbs
- Include one subtle transition hint per slide
- Make it scannable and presenter-friendly
- Help beginners feel confident about what comes next`
}
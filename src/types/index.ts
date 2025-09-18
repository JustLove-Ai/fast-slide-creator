import {
  User,
  Brainstorm,
  ContextProfile,
  Presentation,
  Slide,
  ContentAngle,
  SlideTemplate
} from '@prisma/client'

// Export Prisma types
export type {
  User,
  Brainstorm,
  ContextProfile,
  Presentation,
  Slide,
  ContentAngle,
  SlideTemplate
}

// Extended types with relations
export type BrainstormWithUser = Brainstorm & {
  user: User
}

export type ContextProfileWithUser = ContextProfile & {
  user: User
}

export type PresentationWithDetails = Presentation & {
  user: User
  brainstorm: Brainstorm
  contextProfile: ContextProfile
  slides: Slide[]
}

export type SlideWithPresentation = Slide & {
  presentation: Presentation
}

// Form types for creating/updating records
export type CreateBrainstormData = Omit<Brainstorm, 'id' | 'createdAt' | 'updatedAt' | 'userId'>

export type CreateContextProfileData = Omit<ContextProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>

export type CreatePresentationData = Omit<Presentation, 'id' | 'createdAt' | 'updatedAt' | 'userId'>

export type CreateSlideData = Omit<Slide, 'id' | 'createdAt' | 'updatedAt' | 'presentationId'>

// Canvas-specific types for Fabric.js integration
export interface CanvasElement {
  type: string
  [key: string]: any
}

export interface CanvasData {
  version: string
  objects: CanvasElement[]
  background?: string
  [key: string]: any
}

// Content angle definitions with their components
export interface ContentAngleDefinition {
  name: ContentAngle
  label: string
  description: string
  components: {
    [key: string]: {
      label: string
      description: string
      example: string
    }
  }
}

// AI Generation types
export interface AIGenerationContext {
  brainstorm: Brainstorm
  contextProfile: ContextProfile
  contentAngle: ContentAngle
}

export interface AIGeneratedSlide {
  title: string
  content: string
  template: SlideTemplate
  transition?: string
  narrationSegment?: string
}

export interface AIGenerationResult {
  presentation: {
    title: string
    narration: string
  }
  slides: AIGeneratedSlide[]
}
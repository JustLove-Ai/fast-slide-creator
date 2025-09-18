'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BrainstormList } from '@/components/brainstorm/brainstorm-list'
import { ContextProfileList } from '@/components/context/context-profile-list'
import { ContentAngleSelector } from './content-angle-selector'
import { Brainstorm, ContextProfile, ContentAngle } from '@/types'
import { createPresentation } from '@/lib/actions/presentation'
import { createSlide } from '@/lib/actions/slide'
import { generateSlides } from '@/lib/slide-generator'
import { ChevronLeft, ChevronRight, Lightbulb, Target, Presentation } from 'lucide-react'

interface PresentationWizardProps {
  brainstorms: Brainstorm[]
  contextProfiles: ContextProfile[]
  userId: string
  onComplete?: (presentationId: string) => void
}

type WizardStep = 'brainstorm' | 'context' | 'angle' | 'generating'

export function PresentationWizard({
  brainstorms,
  contextProfiles,
  userId,
  onComplete
}: PresentationWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('brainstorm')
  const [selectedBrainstorm, setSelectedBrainstorm] = useState<Brainstorm | null>(null)
  const [selectedContext, setSelectedContext] = useState<ContextProfile | null>(null)
  const [selectedAngle, setSelectedAngle] = useState<ContentAngle | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = [
    { id: 'brainstorm', label: 'Select Brainstorm', icon: Lightbulb },
    { id: 'context', label: 'Choose Context', icon: Target },
    { id: 'angle', label: 'Pick Framework', icon: Presentation }
  ]

  const handleNext = () => {
    if (currentStep === 'brainstorm' && selectedBrainstorm) {
      setCurrentStep('context')
    } else if (currentStep === 'context' && selectedContext) {
      setCurrentStep('angle')
    } else if (currentStep === 'angle' && selectedAngle) {
      handleGenerate()
    }
  }

  const handleBack = () => {
    if (currentStep === 'context') {
      setCurrentStep('brainstorm')
    } else if (currentStep === 'angle') {
      setCurrentStep('context')
    }
  }

  const handleGenerate = async () => {
    if (!selectedBrainstorm || !selectedContext || !selectedAngle) return

    setIsGenerating(true)
    setCurrentStep('generating')
    setError(null)

    try {
      console.log('Starting presentation generation...')
      console.log('Selected brainstorm:', selectedBrainstorm.id)
      console.log('Selected context:', selectedContext.id)
      console.log('Selected angle:', selectedAngle)

      // Create the presentation
      const presentation = await createPresentation(userId, {
        title: `${selectedBrainstorm.title} - ${selectedAngle} Presentation`,
        contentAngle: selectedAngle,
        brainstormId: selectedBrainstorm.id,
        contextProfileId: selectedContext.id,
        aiGeneratedData: {
          timestamp: new Date().toISOString(),
          brainstormTitle: selectedBrainstorm.title,
          contextName: selectedContext.name,
          angle: selectedAngle
        }
      })

      console.log('Created presentation:', presentation.id)

      // Generate slides using AI
      const generatedSlides = await generateSlides(
        selectedBrainstorm,
        selectedContext,
        selectedAngle
      )

      console.log('Generated slides:', generatedSlides.length)

      // Create slides in the database
      await Promise.all(
        generatedSlides.map((slideData, index) =>
          createSlide(presentation.id, {
            order: index,
            template: slideData.template,
            title: slideData.title,
            content: slideData.content,
            narrationSegment: slideData.narrationSegment,
            transition: 'fade'
          })
        )
      )

      console.log('Created all slides successfully')

      if (onComplete) {
        onComplete(presentation.id)
      } else {
        router.push(`/presentations/${presentation.id}`)
      }
    } catch (error) {
      console.error('Error creating presentation:', error)
      setError(error instanceof Error ? error.message : 'Failed to create presentation')
      setIsGenerating(false)
      setCurrentStep('angle')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'brainstorm':
        return !!selectedBrainstorm
      case 'context':
        return !!selectedContext
      case 'angle':
        return !!selectedAngle
      default:
        return false
    }
  }

  if (currentStep === 'generating') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Generating Your Presentation</h3>
          <p className="text-gray-600">
            Creating slides based on your brainstorm, context, and chosen framework...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = step.id === currentStep
          const isCompleted =
            (step.id === 'brainstorm' && selectedBrainstorm) ||
            (step.id === 'context' && selectedContext) ||
            (step.id === 'angle' && selectedAngle)

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : isCompleted
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-4 text-gray-400" />
              )}
            </div>
          )
        })}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800">
              <div className="font-medium">Error: {error}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 'brainstorm' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Select Your Brainstorm</h2>
                <p className="text-gray-600">
                  Choose the brainstorm that contains the ideas you want to turn into a presentation
                </p>
              </div>
              <BrainstormList
                initialBrainstorms={brainstorms}
                userId={userId}
                onSelect={setSelectedBrainstorm}
              />
              {selectedBrainstorm && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Selected: {selectedBrainstorm.title}</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    {selectedBrainstorm.description || 'No description'}
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'context' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Choose Your Context Profile</h2>
                <p className="text-gray-600">
                  Select the business context and audience profile for this presentation
                </p>
              </div>
              <ContextProfileList
                initialContextProfiles={contextProfiles}
                userId={userId}
                onSelect={setSelectedContext}
              />
              {selectedContext && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Selected: {selectedContext.name}</h4>
                  <p className="text-green-700 text-sm mt-1">
                    Target: {selectedContext.targetAudience.slice(0, 100)}...
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'angle' && (
            <ContentAngleSelector
              selectedAngle={selectedAngle || undefined}
              onSelect={setSelectedAngle}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 'brainstorm'}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || isGenerating}
        >
          {currentStep === 'angle' ? 'Generate Presentation' : 'Next'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
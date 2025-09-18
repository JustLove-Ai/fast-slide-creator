'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Rocket, Target, Users } from 'lucide-react'
import { ContentAngle } from '@/types'
import { createBrainstorm } from '@/lib/actions/brainstorm'
import { createDefaultContextProfile } from '@/lib/actions/context-profile'
import { createPresentation } from '@/lib/actions/presentation'

export function QuickStart() {
  const router = useRouter()
  const [brainstormContent, setBrainstormContent] = useState('')
  const [audienceInfo, setAudienceInfo] = useState('')
  const [contentAngle, setContentAngle] = useState<ContentAngle | ''>('')
  const [isCreating, setIsCreating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const contentAngles = [
    {
      value: 'CUB' as ContentAngle,
      label: 'CUB (Contrarian-Useful-Bridge)',
      description: 'Challenge → Value → Connect',
      color: 'bg-blue-500'
    },
    {
      value: 'PASE' as ContentAngle,
      label: 'PASE (Problem-Agitate-Solve-Expand)',
      description: 'Identify → Intensify → Resolve → Scale',
      color: 'bg-green-500'
    },
    {
      value: 'HEAR' as ContentAngle,
      label: 'HEAR (Hook-Empathy-Authority-Roadmap)',
      description: 'Grab → Connect → Establish → Guide',
      color: 'bg-purple-500'
    }
  ]

  const handleCreatePresentation = async () => {
    if (!brainstormContent.trim()) {
      alert('Please enter your brainstorm content')
      return
    }

    setIsCreating(true)
    try {
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
        contentAngle: (contentAngle as ContentAngle) || 'PASE'
      })

      // Redirect to the new presentation
      router.push(`/presentations/${presentation.id}`)
    } catch (error) {
      console.error('Error creating presentation:', error)
      alert('Error creating presentation. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Turn Your Ideas Into Slides
          </CardTitle>
          <p className="text-gray-600 text-lg mt-2">
            Just write your thoughts below, and we'll create a professional presentation for you
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Brainstorm Input */}
          <div className="space-y-3">
            <Label htmlFor="brainstorm" className="text-lg font-medium flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              What's your idea or topic?
            </Label>
            <Textarea
              id="brainstorm"
              placeholder="Describe your concept, share your thoughts, or paste your notes here...

Examples:
• I want to present our new product features to the sales team
• My startup idea is a platform that connects local farmers with restaurants
• I need to explain our Q4 marketing strategy to stakeholders"
              value={brainstormContent}
              onChange={(e) => setBrainstormContent(e.target.value)}
              rows={8}
              className="text-base leading-relaxed"
            />
          </div>

          {/* Quick Options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Audience */}
            <div className="space-y-3">
              <Label htmlFor="audience" className="text-base font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Who's your audience? <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="audience"
                placeholder="e.g., Sales team, Investors, Students, Executives..."
                value={audienceInfo}
                onChange={(e) => setAudienceInfo(e.target.value)}
              />
            </div>

            {/* Content Angle */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Choose a content style <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Select value={contentAngle} onValueChange={(value) => setContentAngle(value as ContentAngle)}>
                <SelectTrigger>
                  <SelectValue placeholder="Let AI choose the best approach" />
                </SelectTrigger>
                <SelectContent>
                  {contentAngles.map((angle) => (
                    <SelectItem key={angle.value} value={angle.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${angle.color}`} />
                        <div>
                          <div className="font-medium">{angle.label}</div>
                          <div className="text-xs text-gray-500">{angle.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreatePresentation}
              disabled={!brainstormContent.trim() || isCreating}
              className="flex-1 h-12 text-lg"
              size="lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              {isCreating ? 'Creating Your Presentation...' : 'Create Presentation'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-12"
            >
              Advanced
            </Button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium text-gray-900">Advanced Options</h3>
              <div className="grid gap-4 text-sm text-gray-600">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Save brainstorm for reuse</span>
                  <Badge variant="outline">Always enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Create context profile</span>
                  <Badge variant="outline">Auto-generated</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Hybrid canvas slides</span>
                  <Badge variant="outline">Included</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Framework Info */}
          {contentAngle && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${contentAngles.find(a => a.value === contentAngle)?.color}`} />
                <span className="font-medium text-blue-900">
                  {contentAngles.find(a => a.value === contentAngle)?.label}
                </span>
              </div>
              <p className="text-blue-700 text-sm">
                {contentAngles.find(a => a.value === contentAngle)?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
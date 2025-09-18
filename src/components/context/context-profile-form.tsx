'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createContextProfile, updateContextProfile } from '@/lib/actions/context-profile'
import { CreateContextProfileData, ContextProfile } from '@/types'

const contextProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  businessType: z.string().max(200, 'Business type must be less than 200 characters').optional(),
  targetAudience: z.string().min(10, 'Target audience description must be at least 10 characters'),
  objectives: z.string().min(10, 'Objectives must be at least 10 characters'),
  preferences: z.string().min(10, 'Preferences must be at least 10 characters'),
  brandTone: z.string().max(200, 'Brand tone must be less than 200 characters').optional(),
  industryContext: z.string().max(500, 'Industry context must be less than 500 characters').optional(),
})

type ContextProfileFormData = z.infer<typeof contextProfileSchema>

interface ContextProfileFormProps {
  userId: string
  contextProfile?: ContextProfile
  onSuccess?: (contextProfile: ContextProfile) => void
  onCancel?: () => void
}

export function ContextProfileForm({
  userId,
  contextProfile,
  onSuccess,
  onCancel
}: ContextProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!contextProfile

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContextProfileFormData>({
    resolver: zodResolver(contextProfileSchema),
    defaultValues: contextProfile ? {
      name: contextProfile.name,
      businessType: contextProfile.businessType || '',
      targetAudience: contextProfile.targetAudience,
      objectives: contextProfile.objectives,
      preferences: contextProfile.preferences,
      brandTone: contextProfile.brandTone || '',
      industryContext: contextProfile.industryContext || '',
    } : undefined
  })

  const onSubmit = async (data: ContextProfileFormData) => {
    setIsLoading(true)
    try {
      let result: ContextProfile

      if (isEditing && contextProfile) {
        result = await updateContextProfile(contextProfile.id, data)
      } else {
        result = await createContextProfile(userId, data)
      }

      onSuccess?.(result)
      if (!isEditing) {
        reset()
      }
    } catch (error) {
      console.error('Error saving context profile:', error)
      // TODO: Add toast notification for error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Context Profile' : 'Create New Context Profile'}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your context profile with new business details and preferences'
            : 'Define your business context, audience, and objectives to shape AI-generated content'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Profile Name</Label>
            <Input
              id="name"
              placeholder="e.g., Tech Startup Pitch, Marketing Team Update..."
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type (Optional)</Label>
              <Input
                id="businessType"
                placeholder="e.g., SaaS startup, consulting firm..."
                {...register('businessType')}
                disabled={isLoading}
              />
              {errors.businessType && (
                <p className="text-sm text-red-500">{errors.businessType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandTone">Brand Tone (Optional)</Label>
              <Input
                id="brandTone"
                placeholder="e.g., professional, friendly, innovative..."
                {...register('brandTone')}
                disabled={isLoading}
              />
              {errors.brandTone && (
                <p className="text-sm text-red-500">{errors.brandTone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Textarea
              id="targetAudience"
              placeholder="Describe your audience: their role, experience level, interests, pain points, and what they care about..."
              rows={3}
              {...register('targetAudience')}
              disabled={isLoading}
            />
            {errors.targetAudience && (
              <p className="text-sm text-red-500">{errors.targetAudience.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives">Objectives</Label>
            <Textarea
              id="objectives"
              placeholder="What do you want to achieve? What actions should your audience take? What outcomes are you aiming for?"
              rows={3}
              {...register('objectives')}
              disabled={isLoading}
            />
            {errors.objectives && (
              <p className="text-sm text-red-500">{errors.objectives.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferences">Preferences & Guidelines</Label>
            <Textarea
              id="preferences"
              placeholder="What do you like/dislike in presentations? Any specific requirements, constraints, or style preferences?"
              rows={3}
              {...register('preferences')}
              disabled={isLoading}
            />
            {errors.preferences && (
              <p className="text-sm text-red-500">{errors.preferences.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industryContext">Industry Context (Optional)</Label>
            <Textarea
              id="industryContext"
              placeholder="Any specific industry knowledge, trends, or context that should inform the presentation?"
              rows={3}
              {...register('industryContext')}
              disabled={isLoading}
            />
            {errors.industryContext && (
              <p className="text-sm text-red-500">{errors.industryContext.message}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? (isEditing ? 'Updating...' : 'Creating...')
                : (isEditing ? 'Update Profile' : 'Create Profile')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
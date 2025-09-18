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
import { createBrainstorm, updateBrainstorm } from '@/lib/actions/brainstorm'
import { CreateBrainstormData, Brainstorm } from '@/types'

const brainstormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  tags: z.string().transform((str) => str.split(',').map(tag => tag.trim()).filter(Boolean))
})

type BrainstormFormData = z.infer<typeof brainstormSchema>

interface BrainstormFormProps {
  userId: string
  brainstorm?: Brainstorm
  onSuccess?: (brainstorm: Brainstorm) => void
  onCancel?: () => void
}

export function BrainstormForm({
  userId,
  brainstorm,
  onSuccess,
  onCancel
}: BrainstormFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!brainstorm

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<BrainstormFormData>({
    resolver: zodResolver(brainstormSchema),
    defaultValues: brainstorm ? {
      title: brainstorm.title,
      description: brainstorm.description || '',
      content: brainstorm.content,
      tags: brainstorm.tags.join(', ')
    } : undefined
  })

  const onSubmit = async (data: BrainstormFormData) => {
    setIsLoading(true)
    try {
      let result: Brainstorm

      if (isEditing && brainstorm) {
        result = await updateBrainstorm(brainstorm.id, data)
      } else {
        result = await createBrainstorm(userId, data)
      }

      onSuccess?.(result)
      if (!isEditing) {
        reset()
      }
    } catch (error) {
      console.error('Error saving brainstorm:', error)
      // TODO: Add toast notification for error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Brainstorm' : 'Create New Brainstorm'}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your brainstorm with new ideas and concepts'
            : 'Capture your raw ideas and concepts that can be transformed into presentations'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief title for your brainstorm..."
              {...register('title')}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Brief description of what this brainstorm is about..."
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Pour out all your raw ideas, concepts, thoughts, and inspirations here. Don't worry about structure - just capture everything!"
              rows={8}
              {...register('content')}
              disabled={isLoading}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="business, marketing, strategy, innovation (comma-separated)"
              {...register('tags')}
              disabled={isLoading}
            />
            {errors.tags && (
              <p className="text-sm text-red-500">{errors.tags.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Add tags to help categorize and find your brainstorms later
            </p>
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
                : (isEditing ? 'Update Brainstorm' : 'Create Brainstorm')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
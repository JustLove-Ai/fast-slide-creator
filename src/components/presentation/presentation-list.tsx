'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { searchPresentations, deletePresentation } from '@/lib/actions/presentation'
import { PresentationWithDetails } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Search, Edit, Trash2, Plus, Play, Users, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface PresentationListProps {
  initialPresentations: PresentationWithDetails[]
  userId: string
}

export function PresentationList({
  initialPresentations,
  userId
}: PresentationListProps) {
  const [presentations, setPresentations] = useState<PresentationWithDetails[]>(initialPresentations)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setPresentations(initialPresentations)
      return
    }

    setIsSearching(true)
    try {
      const results = await searchPresentations(userId, query.trim())
      setPresentations(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this presentation?')) return

    try {
      await deletePresentation(id)
      setPresentations(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
      // TODO: Add toast notification
    }
  }

  const getAngleBadgeColor = (angle: string) => {
    switch (angle) {
      case 'CUB':
        return 'bg-blue-100 text-blue-800'
      case 'PASE':
        return 'bg-green-100 text-green-800'
      case 'HEAR':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search presentations by title, brainstorm, or context..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/presentations/new">
          <Button className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Presentation
          </Button>
        </Link>
      </div>

      {isSearching && (
        <div className="text-center text-gray-500">Searching...</div>
      )}

      {presentations.length === 0 && !isSearching && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              {searchQuery
                ? 'No presentations found matching your search.'
                : 'No presentations yet. Create your first one to get started!'}
            </div>
            {!searchQuery && (
              <Link href="/presentations/new">
                <Button className="mt-4">
                  Create Your First Presentation
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {presentations.map((presentation) => (
          <Card key={presentation.id} className="transition-colors hover:bg-gray-50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate flex items-center gap-2">
                    {presentation.title}
                    <Badge className={getAngleBadgeColor(presentation.contentAngle)}>
                      {presentation.contentAngle}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Lightbulb className="h-4 w-4" />
                      {presentation.brainstorm.title}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {presentation.contextProfile.name}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <Link href={`/presentations/${presentation.id}`}>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/presentations/${presentation.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(presentation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  {presentation.slides.length} slides
                </div>
                <div className="text-gray-500">
                  Updated {formatDistanceToNow(new Date(presentation.updatedAt))} ago
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <strong>Brainstorm:</strong> {presentation.brainstorm.description || 'No description'}
              </div>

              <div className="text-sm text-gray-600">
                <strong>Context:</strong> {presentation.contextProfile.targetAudience.slice(0, 100)}...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
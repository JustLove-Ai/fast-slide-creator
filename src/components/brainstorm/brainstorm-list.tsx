'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { searchBrainstorms, deleteBrainstorm } from '@/lib/actions/brainstorm'
import { Brainstorm } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Search, Edit, Trash2, Plus } from 'lucide-react'

interface BrainstormListProps {
  initialBrainstorms: Brainstorm[]
  userId: string
  onEdit?: (brainstorm: Brainstorm) => void
  onCreateNew?: () => void
  onSelect?: (brainstorm: Brainstorm) => void
}

export function BrainstormList({
  initialBrainstorms,
  userId,
  onEdit,
  onCreateNew,
  onSelect
}: BrainstormListProps) {
  const [brainstorms, setBrainstorms] = useState<Brainstorm[]>(initialBrainstorms)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setBrainstorms(initialBrainstorms)
      return
    }

    setIsSearching(true)
    try {
      const results = await searchBrainstorms(userId, query.trim())
      setBrainstorms(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brainstorm?')) return

    try {
      await deleteBrainstorm(id)
      setBrainstorms(prev => prev.filter(b => b.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
      // TODO: Add toast notification
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search brainstorms by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Brainstorm
          </Button>
        )}
      </div>

      {isSearching && (
        <div className="text-center text-gray-500">Searching...</div>
      )}

      {brainstorms.length === 0 && !isSearching && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              {searchQuery
                ? 'No brainstorms found matching your search.'
                : 'No brainstorms yet. Create your first one to get started!'}
            </div>
            {onCreateNew && !searchQuery && (
              <Button onClick={onCreateNew} className="mt-4">
                Create Your First Brainstorm
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {brainstorms.map((brainstorm) => (
          <Card
            key={brainstorm.id}
            className={`transition-colors ${
              onSelect ? 'cursor-pointer hover:bg-gray-50' : ''
            }`}
            onClick={() => onSelect?.(brainstorm)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {brainstorm.title}
                  </CardTitle>
                  {brainstorm.description && (
                    <CardDescription className="mt-1">
                      {brainstorm.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(brainstorm)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(brainstorm.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 mb-3 line-clamp-3">
                {brainstorm.content}
              </div>

              {brainstorm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {brainstorm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Updated {formatDistanceToNow(new Date(brainstorm.updatedAt))} ago
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
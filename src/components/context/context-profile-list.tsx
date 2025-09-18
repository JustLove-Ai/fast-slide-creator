'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { searchContextProfiles, deleteContextProfile } from '@/lib/actions/context-profile'
import { ContextProfile } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Search, Edit, Trash2, Plus, Users, Target, Building } from 'lucide-react'

interface ContextProfileListProps {
  initialContextProfiles: ContextProfile[]
  userId: string
  onEdit?: (contextProfile: ContextProfile) => void
  onCreateNew?: () => void
  onSelect?: (contextProfile: ContextProfile) => void
}

export function ContextProfileList({
  initialContextProfiles,
  userId,
  onEdit,
  onCreateNew,
  onSelect
}: ContextProfileListProps) {
  const [contextProfiles, setContextProfiles] = useState<ContextProfile[]>(initialContextProfiles)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setContextProfiles(initialContextProfiles)
      return
    }

    setIsSearching(true)
    try {
      const results = await searchContextProfiles(userId, query.trim())
      setContextProfiles(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this context profile?')) return

    try {
      await deleteContextProfile(id)
      setContextProfiles(prev => prev.filter(cp => cp.id !== id))
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
            placeholder="Search context profiles by name, business type, or audience..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Profile
          </Button>
        )}
      </div>

      {isSearching && (
        <div className="text-center text-gray-500">Searching...</div>
      )}

      {contextProfiles.length === 0 && !isSearching && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              {searchQuery
                ? 'No context profiles found matching your search.'
                : 'No context profiles yet. Create your first one to define your business context!'}
            </div>
            {onCreateNew && !searchQuery && (
              <Button onClick={onCreateNew} className="mt-4">
                Create Your First Context Profile
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {contextProfiles.map((contextProfile) => (
          <Card
            key={contextProfile.id}
            className={`transition-colors ${
              onSelect ? 'cursor-pointer hover:bg-gray-50' : ''
            }`}
            onClick={() => onSelect?.(contextProfile)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {contextProfile.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contextProfile.businessType && (
                      <Badge variant="outline" className="text-xs">
                        <Building className="h-3 w-3 mr-1" />
                        {contextProfile.businessType}
                      </Badge>
                    )}
                    {contextProfile.brandTone && (
                      <Badge variant="outline" className="text-xs">
                        {contextProfile.brandTone}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(contextProfile)
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
                      handleDelete(contextProfile.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Target Audience</div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {contextProfile.targetAudience}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Objectives</div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {contextProfile.objectives}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Updated {formatDistanceToNow(new Date(contextProfile.updatedAt))} ago
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
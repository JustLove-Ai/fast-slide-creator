'use client'

import { useState } from 'react'
import { ContextProfileForm } from './context-profile-form'
import { ContextProfileList } from './context-profile-list'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ContextProfile } from '@/types'

interface ContextProfileManagerProps {
  initialContextProfiles: ContextProfile[]
  userId: string
}

export function ContextProfileManager({ initialContextProfiles, userId }: ContextProfileManagerProps) {
  const [contextProfiles, setContextProfiles] = useState<ContextProfile[]>(initialContextProfiles)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingContextProfile, setEditingContextProfile] = useState<ContextProfile | null>(null)

  const handleCreateNew = () => {
    setEditingContextProfile(null)
    setIsFormOpen(true)
  }

  const handleEdit = (contextProfile: ContextProfile) => {
    setEditingContextProfile(contextProfile)
    setIsFormOpen(true)
  }

  const handleFormSuccess = (contextProfile: ContextProfile) => {
    if (editingContextProfile) {
      // Update existing context profile
      setContextProfiles(prev =>
        prev.map(cp => (cp.id === contextProfile.id ? contextProfile : cp))
      )
    } else {
      // Add new context profile
      setContextProfiles(prev => [contextProfile, ...prev])
    }

    setIsFormOpen(false)
    setEditingContextProfile(null)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingContextProfile(null)
  }

  return (
    <>
      <ContextProfileList
        initialContextProfiles={contextProfiles}
        userId={userId}
        onEdit={handleEdit}
        onCreateNew={handleCreateNew}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContextProfile ? 'Edit Context Profile' : 'Create New Context Profile'}
            </DialogTitle>
          </DialogHeader>
          <ContextProfileForm
            userId={userId}
            contextProfile={editingContextProfile || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
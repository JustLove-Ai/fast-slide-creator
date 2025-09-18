'use client'

import { useState } from 'react'
import { BrainstormForm } from './brainstorm-form'
import { BrainstormList } from './brainstorm-list'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Brainstorm } from '@/types'

interface BrainstormManagerProps {
  initialBrainstorms: Brainstorm[]
  userId: string
}

export function BrainstormManager({ initialBrainstorms, userId }: BrainstormManagerProps) {
  const [brainstorms, setBrainstorms] = useState<Brainstorm[]>(initialBrainstorms)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBrainstorm, setEditingBrainstorm] = useState<Brainstorm | null>(null)

  const handleCreateNew = () => {
    setEditingBrainstorm(null)
    setIsFormOpen(true)
  }

  const handleEdit = (brainstorm: Brainstorm) => {
    setEditingBrainstorm(brainstorm)
    setIsFormOpen(true)
  }

  const handleFormSuccess = (brainstorm: Brainstorm) => {
    if (editingBrainstorm) {
      // Update existing brainstorm
      setBrainstorms(prev =>
        prev.map(b => (b.id === brainstorm.id ? brainstorm : b))
      )
    } else {
      // Add new brainstorm
      setBrainstorms(prev => [brainstorm, ...prev])
    }

    setIsFormOpen(false)
    setEditingBrainstorm(null)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingBrainstorm(null)
  }

  return (
    <>
      <BrainstormList
        initialBrainstorms={brainstorms}
        userId={userId}
        onEdit={handleEdit}
        onCreateNew={handleCreateNew}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBrainstorm ? 'Edit Brainstorm' : 'Create New Brainstorm'}
            </DialogTitle>
          </DialogHeader>
          <BrainstormForm
            userId={userId}
            brainstorm={editingBrainstorm || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
import { Suspense } from 'react'
import { getPresentationsByUser } from '@/lib/actions/presentation'
import { PresentationList } from '@/components/presentation/presentation-list'
import { getOrCreateDemoUser } from '@/lib/user'

export default async function PresentationsPage() {
  const user = await getOrCreateDemoUser()
  const presentations = await getPresentationsByUser(user.id)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Presentations</h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and manage your AI-generated presentations. Create new ones from your brainstorms and context profiles.
        </p>
      </div>

      <Suspense fallback={<div>Loading presentations...</div>}>
        <PresentationList initialPresentations={presentations} userId={user.id} />
      </Suspense>
    </div>
  )
}
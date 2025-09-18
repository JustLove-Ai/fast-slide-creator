import { Suspense } from 'react'
import { getContextProfilesByUser } from '@/lib/actions/context-profile'
import { ContextProfileManager } from '@/components/context/context-profile-manager'
import { getOrCreateDemoUser } from '@/lib/user'

export default async function ContextProfilesPage() {
  const user = await getOrCreateDemoUser()
  const contextProfiles = await getContextProfilesByUser(user.id)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Context Profiles</h1>
        <p className="text-gray-600">
          Define your business context, target audience, and objectives to create personalized presentations that resonate.
        </p>
      </div>

      <Suspense fallback={<div>Loading context profiles...</div>}>
        <ContextProfileManager initialContextProfiles={contextProfiles} userId={user.id} />
      </Suspense>
    </div>
  )
}
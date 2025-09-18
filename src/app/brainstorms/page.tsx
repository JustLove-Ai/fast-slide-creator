import { Suspense } from 'react'
import { getBrainstormsByUser } from '@/lib/actions/brainstorm'
import { BrainstormManager } from '@/components/brainstorm/brainstorm-manager'
import { getOrCreateDemoUser } from '@/lib/user'

export default async function BrainstormsPage() {
  const user = await getOrCreateDemoUser()
  const brainstorms = await getBrainstormsByUser(user.id)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Brainstorms</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Capture and manage your raw ideas and concepts. Transform them into compelling presentations.
        </p>
      </div>

      <Suspense fallback={<div>Loading brainstorms...</div>}>
        <BrainstormManager initialBrainstorms={brainstorms} userId={user.id} />
      </Suspense>
    </div>
  )
}
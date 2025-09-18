import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getBrainstormsByUser } from '@/lib/actions/brainstorm'
import { getContextProfilesByUser } from '@/lib/actions/context-profile'
import { PresentationWizard } from '@/components/presentation/presentation-wizard'
import { getOrCreateDemoUser } from '@/lib/user'

export default async function NewPresentationPage() {
  const user = await getOrCreateDemoUser()
  const [brainstorms, contextProfiles] = await Promise.all([
    getBrainstormsByUser(user.id),
    getContextProfilesByUser(user.id)
  ])

  // Redirect if no brainstorms or context profiles exist
  if (brainstorms.length === 0) {
    redirect('/brainstorms?message=create-first')
  }

  if (contextProfiles.length === 0) {
    redirect('/context-profiles?message=create-first')
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Presentation</h1>
        <p className="text-gray-600">
          Transform your brainstorm into a compelling presentation using AI-powered content generation
        </p>
      </div>

      <Suspense fallback={<div>Loading presentation wizard...</div>}>
        <PresentationWizard
          brainstorms={brainstorms}
          contextProfiles={contextProfiles}
          userId={user.id}
        />
      </Suspense>
    </div>
  )
}
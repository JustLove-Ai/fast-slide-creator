import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getPresentationById } from '@/lib/actions/presentation'
import { SlideViewer } from '@/components/slides/slide-viewer'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PresentationPageProps {
  params: {
    id: string
  }
}

export default async function PresentationPage({ params }: PresentationPageProps) {
  const { id } = await params
  const presentation = await getPresentationById(id)

  if (!presentation) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/presentations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Presentations
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <span>{presentation.brainstorm.title}</span>
            <span>•</span>
            <span>{presentation.contextProfile.name}</span>
            <span>•</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {presentation.contentAngle}
            </span>
          </div>
        </div>
      </div>

      {/* Slide Viewer */}
      <Suspense fallback={<div>Loading presentation...</div>}>
        <SlideViewer
          slides={presentation.slides}
          presentationTitle={presentation.title}
        />
      </Suspense>

    </div>
  )
}
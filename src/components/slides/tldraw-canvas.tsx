'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { SimpleCanvas } from './simple-canvas'

// Dynamically import tldraw to avoid SSR issues
const Tldraw = dynamic(
  () => import('tldraw').then((mod) => ({ default: mod.Tldraw })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-white">
        <div className="text-gray-500 animate-pulse">Loading drawing canvas...</div>
      </div>
    ),
  }
)

// Import types and functions separately to avoid SSR issues
let getSnapshot: any, loadSnapshot: any, Editor: any

if (typeof window !== 'undefined') {
  import('tldraw').then((mod) => {
    getSnapshot = mod.getSnapshot
    loadSnapshot = mod.loadSnapshot
    Editor = mod.Editor
  })
}

interface TldrawCanvasProps {
  width: number
  height: number
  data?: any
  onChange?: (data: any) => void
  showToolbar?: boolean
  className?: string
}

export function TldrawCanvas({ width, height, data, onChange, showToolbar = true, className }: TldrawCanvasProps) {
  const editorRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [tldrawLoaded, setTldrawLoaded] = useState(false)
  const [tldrawError, setTldrawError] = useState(false)

  useEffect(() => {
    // Load tldraw functions when component mounts
    if (typeof window !== 'undefined') {
      import('tldraw')
        .then((mod) => {
          getSnapshot = mod.getSnapshot
          loadSnapshot = mod.loadSnapshot
          Editor = mod.Editor
          setTldrawLoaded(true)
        })
        .catch((error) => {
          console.error('Failed to load tldraw:', error)
          setTldrawError(true)
        })
    }
  }, [])

  const handleMount = (editor: any) => {
    editorRef.current = editor
    setIsLoaded(true)

    // Load existing data if provided
    if (data && data.document && getSnapshot && loadSnapshot) {
      try {
        loadSnapshot(editor.store, data)
        editor.updateViewportScreenBounds()
      } catch (error) {
        console.error('Error loading tldraw data:', error)
      }
    }

    // Set up change listener
    const handleChange = () => {
      if (onChange && editorRef.current && getSnapshot) {
        try {
          const snapshot = getSnapshot(editorRef.current.store)
          onChange(snapshot)
        } catch (error) {
          console.error('Error capturing tldraw snapshot:', error)
        }
      }
    }

    // Listen for store changes with debouncing
    let timeoutId: NodeJS.Timeout
    const debouncedChange = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleChange, 300)
    }

    const unsubscribe = editor.store.listen(debouncedChange)

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }

  // Update data when it changes externally - but only if it's actually different
  useEffect(() => {
    if (editorRef.current && data && data.document && isLoaded && loadSnapshot) {
      try {
        const currentSnapshot = getSnapshot ? getSnapshot(editorRef.current.store) : null
        // Only load if the data is actually different
        if (JSON.stringify(currentSnapshot) !== JSON.stringify(data)) {
          loadSnapshot(editorRef.current.store, data)
        }
      } catch (error) {
        console.error('Error loading updated tldraw data:', error)
      }
    }
  }, [data, isLoaded])

  // Fallback to simple canvas if tldraw fails to load
  if (tldrawError) {
    return (
      <SimpleCanvas
        width={width}
        height={height}
        data={data}
        onChange={onChange}
        showToolbar={showToolbar}
        className={className}
      />
    )
  }

  if (!tldrawLoaded) {
    return (
      <div className={`relative ${className || ''}`} style={{ width, height }}>
        <div className="flex items-center justify-center w-full h-full bg-white">
          <div className="text-gray-500 animate-pulse">Loading drawing canvas...</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative ${className || ''}`}
      style={{ width, height }}
    >
      <div className="w-full h-full">
        <Tldraw
          onMount={handleMount}
          persistenceKey={undefined} // Disable auto-persistence since we handle it manually
        />
      </div>
    </div>
  )
}
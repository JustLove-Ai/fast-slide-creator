'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pen, Square, Circle, Type, Eraser, Undo, Redo } from 'lucide-react'

interface SimpleCanvasProps {
  width: number
  height: number
  data?: any
  onChange?: (data: any) => void
  showToolbar?: boolean
  className?: string
}

export function SimpleCanvas({ width, height, data, onChange, showToolbar = true, className }: SimpleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState('pen')
  const [paths, setPaths] = useState<any[]>([])

  useEffect(() => {
    if (data && data.paths) {
      setPaths(data.paths)
      redrawCanvas(data.paths)
    }
  }, [data])

  const redrawCanvas = (pathsToRender: any[]) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    pathsToRender.forEach(path => {
      ctx.beginPath()
      ctx.strokeStyle = path.color || '#000000'
      ctx.lineWidth = path.width || 2
      ctx.lineCap = 'round'

      if (path.points && path.points.length > 0) {
        ctx.moveTo(path.points[0].x, path.points[0].y)
        path.points.forEach((point: any) => {
          ctx.lineTo(point.x, point.y)
        })
      }
      ctx.stroke()
    })
  }

  const startDrawing = (e: React.MouseEvent) => {
    if (tool !== 'pen') return

    setIsDrawing(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const newPath = {
      points: [{ x: e.clientX - rect.left, y: e.clientY - rect.top }],
      color: '#000000',
      width: 2
    }

    setPaths(prev => [...prev, newPath])
  }

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || tool !== 'pen') return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    setPaths(prev => {
      const newPaths = [...prev]
      const currentPath = newPaths[newPaths.length - 1]
      if (currentPath) {
        currentPath.points.push(point)
      }
      return newPaths
    })
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      if (onChange) {
        onChange({ paths })
      }
    }
  }

  useEffect(() => {
    redrawCanvas(paths)
  }, [paths])

  const clearCanvas = () => {
    setPaths([])
    if (onChange) {
      onChange({ paths: [] })
    }
  }

  return (
    <div className={`${className || ''}`}>
      {showToolbar && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-b-0 rounded-t-lg">
          <Button
            variant={tool === 'pen' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('pen')}
            className="h-8 w-8 p-0"
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCanvas}
            className="h-8 w-8 p-0"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className={`${showToolbar ? 'border border-gray-200 rounded-b-lg' : ''} overflow-hidden bg-white`}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  )
}
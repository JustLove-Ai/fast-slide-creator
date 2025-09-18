'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ContentAngle } from '@/types'
import { getAllContentAngles } from '@/lib/content-angles'
import { Check, ChevronRight } from 'lucide-react'

interface ContentAngleSelectorProps {
  selectedAngle?: ContentAngle
  onSelect: (angle: ContentAngle) => void
  onNext?: () => void
  disabled?: boolean
}

export function ContentAngleSelector({
  selectedAngle,
  onSelect,
  onNext,
  disabled = false
}: ContentAngleSelectorProps) {
  const contentAngles = getAllContentAngles()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Content Framework</h2>
        <p className="text-gray-600">
          Select the strategic approach that best fits your presentation goals
        </p>
      </div>

      <div className="grid gap-6">
        {contentAngles.map((angle) => (
          <Card
            key={angle.name}
            className={`cursor-pointer transition-all ${
              selectedAngle === angle.name
                ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50'
                : 'hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onSelect(angle.name)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {angle.label}
                    {selectedAngle === angle.name && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {angle.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(angle.components).map(([key, component]) => (
                  <div key={key} className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {component.label}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      {component.description}
                    </p>
                    <div className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-2">
                      &ldquo;{component.example}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAngle && onNext && (
        <div className="flex justify-end pt-4">
          <Button onClick={onNext} disabled={disabled}>
            Continue to Generate Slides
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/index'
import { CreateSlideData, Slide } from '@/types'

export async function createSlide(
  presentationId: string,
  data: CreateSlideData
): Promise<Slide> {
  try {
    const slide = await prisma.slide.create({
      data: {
        ...data,
        presentationId,
      },
    })

    revalidatePath(`/presentations/${presentationId}`)
    return slide
  } catch (error) {
    console.error('Error creating slide:', error)
    throw new Error('Failed to create slide')
  }
}

export async function updateSlide(
  id: string,
  data: Partial<CreateSlideData>
): Promise<Slide> {
  try {
    const slide = await prisma.slide.update({
      where: { id },
      data,
    })

    const presentation = await prisma.slide.findUnique({
      where: { id },
      select: { presentationId: true }
    })

    if (presentation) {
      revalidatePath(`/presentations/${presentation.presentationId}`)
    }

    return slide
  } catch (error) {
    console.error('Error updating slide:', error)
    throw new Error('Failed to update slide')
  }
}

export async function deleteSlide(id: string): Promise<void> {
  try {
    const slide = await prisma.slide.findUnique({
      where: { id },
      select: { presentationId: true }
    })

    await prisma.slide.delete({
      where: { id },
    })

    if (slide) {
      revalidatePath(`/presentations/${slide.presentationId}`)
    }
  } catch (error) {
    console.error('Error deleting slide:', error)
    throw new Error('Failed to delete slide')
  }
}

export async function getSlidesByPresentation(presentationId: string): Promise<Slide[]> {
  try {
    const slides = await prisma.slide.findMany({
      where: { presentationId },
      orderBy: { order: 'asc' },
    })

    return slides
  } catch (error) {
    console.error('Error fetching slides:', error)
    throw new Error('Failed to fetch slides')
  }
}

export async function reorderSlides(
  presentationId: string,
  slideIds: string[]
): Promise<void> {
  try {
    // Update the order of each slide
    await Promise.all(
      slideIds.map((slideId, index) =>
        prisma.slide.update({
          where: { id: slideId },
          data: { order: index }
        })
      )
    )

    revalidatePath(`/presentations/${presentationId}`)
  } catch (error) {
    console.error('Error reordering slides:', error)
    throw new Error('Failed to reorder slides')
  }
}
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/index'
import {
  CreatePresentationData,
  Presentation,
  PresentationWithDetails,
  ContentAngle
} from '@/types'

export async function createPresentation(
  userId: string,
  data: CreatePresentationData & {
    brainstormId: string
    contextProfileId: string
  }
): Promise<Presentation> {
  try {
    // Validate that the brainstorm and context profile exist and belong to the user
    const brainstorm = await prisma.brainstorm.findFirst({
      where: { id: data.brainstormId, userId }
    })

    if (!brainstorm) {
      throw new Error(`Brainstorm ${data.brainstormId} not found or doesn't belong to user ${userId}`)
    }

    const contextProfile = await prisma.contextProfile.findFirst({
      where: { id: data.contextProfileId, userId }
    })

    if (!contextProfile) {
      throw new Error(`Context profile ${data.contextProfileId} not found or doesn't belong to user ${userId}`)
    }

    const presentation = await prisma.presentation.create({
      data: {
        ...data,
        userId,
      },
    })

    revalidatePath('/presentations')
    return presentation
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create presentation: ${error.message}`)
    }
    throw new Error('Failed to create presentation: Unknown error')
  }
}

export async function updatePresentation(
  id: string,
  data: Partial<CreatePresentationData>
): Promise<Presentation> {
  try {
    const presentation = await prisma.presentation.update({
      where: { id },
      data,
    })

    revalidatePath('/presentations')
    revalidatePath(`/presentations/${id}`)
    return presentation
  } catch (error) {
    throw new Error('Failed to update presentation')
  }
}

export async function deletePresentation(id: string): Promise<void> {
  try {
    await prisma.presentation.delete({
      where: { id },
    })

    revalidatePath('/presentations')
  } catch (error) {
    throw new Error('Failed to delete presentation')
  }
}

export async function getPresentationsByUser(userId: string): Promise<PresentationWithDetails[]> {
  try {
    const presentations = await prisma.presentation.findMany({
      where: { userId },
      include: {
        user: true,
        brainstorm: true,
        contextProfile: true,
        slides: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' },
    })

    return presentations
  } catch (error) {
    throw new Error('Failed to fetch presentations')
  }
}

export async function getPresentationById(id: string): Promise<PresentationWithDetails | null> {
  try {
    const presentation = await prisma.presentation.findUnique({
      where: { id },
      include: {
        user: true,
        brainstorm: true,
        contextProfile: true,
        slides: {
          orderBy: { order: 'asc' }
        }
      },
    })

    return presentation
  } catch (error) {
    throw new Error('Failed to fetch presentation')
  }
}

export async function searchPresentations(
  userId: string,
  query: string
): Promise<PresentationWithDetails[]> {
  try {
    const presentations = await prisma.presentation.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { brainstorm: { title: { contains: query, mode: 'insensitive' } } },
          { contextProfile: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: true,
        brainstorm: true,
        contextProfile: true,
        slides: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' },
    })

    return presentations
  } catch (error) {
    throw new Error('Failed to search presentations')
  }
}
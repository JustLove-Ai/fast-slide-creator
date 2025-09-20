'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/index'
import { CreateBrainstormData, Brainstorm } from '@/types'
import { getOrCreateDemoUser } from '@/lib/user'

// Overloaded function signatures
export async function createBrainstorm(data: CreateBrainstormData): Promise<Brainstorm>
export async function createBrainstorm(userId: string, data: CreateBrainstormData): Promise<Brainstorm>
export async function createBrainstorm(
  userIdOrData: string | CreateBrainstormData,
  data?: CreateBrainstormData
): Promise<Brainstorm> {
  try {
    let userId: string
    let brainstormData: CreateBrainstormData

    if (typeof userIdOrData === 'string') {
      // Called with userId as first param
      userId = userIdOrData
      brainstormData = data!
    } else {
      // Called with just data, get demo user
      const user = await getOrCreateDemoUser()
      userId = user.id
      brainstormData = userIdOrData
    }

    const brainstorm = await prisma.brainstorm.create({
      data: {
        ...brainstormData,
        userId,
      },
    })

    revalidatePath('/brainstorms')
    return brainstorm
  } catch (error) {
    throw new Error('Failed to create brainstorm')
  }
}

export async function updateBrainstorm(
  id: string,
  data: Partial<CreateBrainstormData>
): Promise<Brainstorm> {
  try {
    const brainstorm = await prisma.brainstorm.update({
      where: { id },
      data,
    })

    revalidatePath('/brainstorms')
    revalidatePath(`/brainstorms/${id}`)
    return brainstorm
  } catch (error) {
    throw new Error('Failed to update brainstorm')
  }
}

export async function deleteBrainstorm(id: string): Promise<void> {
  try {
    await prisma.brainstorm.delete({
      where: { id },
    })

    revalidatePath('/brainstorms')
  } catch (error) {
    throw new Error('Failed to delete brainstorm')
  }
}

export async function getBrainstormsByUser(userId: string): Promise<Brainstorm[]> {
  try {
    const brainstorms = await prisma.brainstorm.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })

    return brainstorms
  } catch (error) {
    throw new Error('Failed to fetch brainstorms')
  }
}

export async function getBrainstormById(id: string): Promise<Brainstorm | null> {
  try {
    const brainstorm = await prisma.brainstorm.findUnique({
      where: { id },
      include: {
        user: true,
        presentations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return brainstorm
  } catch (error) {
    throw new Error('Failed to fetch brainstorm')
  }
}

export async function searchBrainstorms(
  userId: string,
  query: string
): Promise<Brainstorm[]> {
  try {
    const brainstorms = await prisma.brainstorm.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    })

    return brainstorms
  } catch (error) {
    throw new Error('Failed to search brainstorms')
  }
}
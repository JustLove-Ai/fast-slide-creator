'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/index'
import { CreateContextProfileData, ContextProfile } from '@/types'
import { getOrCreateDemoUser } from '@/lib/user'

export async function createContextProfile(
  userId: string,
  data: CreateContextProfileData
): Promise<ContextProfile> {
  try {
    const contextProfile = await prisma.contextProfile.create({
      data: {
        ...data,
        userId,
      },
    })

    revalidatePath('/context-profiles')
    return contextProfile
  } catch (error) {
    throw new Error('Failed to create context profile')
  }
}

export async function updateContextProfile(
  id: string,
  data: Partial<CreateContextProfileData>
): Promise<ContextProfile> {
  try {
    const contextProfile = await prisma.contextProfile.update({
      where: { id },
      data,
    })

    revalidatePath('/context-profiles')
    revalidatePath(`/context-profiles/${id}`)
    return contextProfile
  } catch (error) {
    throw new Error('Failed to update context profile')
  }
}

export async function deleteContextProfile(id: string): Promise<void> {
  try {
    await prisma.contextProfile.delete({
      where: { id },
    })

    revalidatePath('/context-profiles')
  } catch (error) {
    throw new Error('Failed to delete context profile')
  }
}

export async function getContextProfilesByUser(userId: string): Promise<ContextProfile[]> {
  try {
    const contextProfiles = await prisma.contextProfile.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })

    return contextProfiles
  } catch (error) {
    throw new Error('Failed to fetch context profiles')
  }
}

export async function getContextProfileById(id: string): Promise<ContextProfile | null> {
  try {
    const contextProfile = await prisma.contextProfile.findUnique({
      where: { id },
      include: {
        user: true,
        presentations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return contextProfile
  } catch (error) {
    throw new Error('Failed to fetch context profile')
  }
}

export async function searchContextProfiles(
  userId: string,
  query: string
): Promise<ContextProfile[]> {
  try {
    const contextProfiles = await prisma.contextProfile.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { businessType: { contains: query, mode: 'insensitive' } },
          { targetAudience: { contains: query, mode: 'insensitive' } },
          { objectives: { contains: query, mode: 'insensitive' } },
          { brandTone: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    })

    return contextProfiles
  } catch (error) {
    throw new Error('Failed to search context profiles')
  }
}

export async function createDefaultContextProfile(data: {
  name: string
  audience: string
  objectives: string[]
  preferences: any
}): Promise<ContextProfile> {
  try {
    const user = await getOrCreateDemoUser()

    const contextProfile = await prisma.contextProfile.create({
      data: {
        name: data.name,
        businessType: 'General',
        targetAudience: data.audience,
        objectives: Array.isArray(data.objectives) ? data.objectives.join(', ') : data.objectives,
        preferences: typeof data.preferences === 'object' ? JSON.stringify(data.preferences) : data.preferences,
        brandTone: data.preferences?.tone || 'professional',
        userId: user.id
      }
    })

    return contextProfile
  } catch (error) {
    throw new Error('Failed to create default context profile')
  }
}
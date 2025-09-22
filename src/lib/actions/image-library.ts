'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/index'
import {
  ImageLibrary,
  CreateImageLibraryData,
  ImageLibraryFilters
} from '@/types'
import { getOrCreateDemoUser } from '@/lib/user'

// Save generated image to library
export async function saveImageToLibrary(
  imageData: CreateImageLibraryData
): Promise<ImageLibrary> {
  try {
    const user = await getOrCreateDemoUser()

    // Debug: Check what's available on prisma client
    console.log('Available Prisma models:', Object.keys(prisma))
    console.log('prisma.imageLibrary exists:', !!prisma.imageLibrary)
    console.log('typeof prisma.imageLibrary:', typeof prisma.imageLibrary)

    // Workaround: Check if imageLibrary is available, if not, throw a helpful error
    if (!prisma.imageLibrary || typeof prisma.imageLibrary.create !== 'function') {
      console.warn('ImageLibrary model not available in Prisma client - likely a client generation issue')
      throw new Error('ImageLibrary model not available - Prisma client generation issue')
    }

    const savedImage = await prisma.imageLibrary.create({
      data: {
        ...imageData,
        userId: user.id
      }
    })

    revalidatePath('/image-library')
    return savedImage
  } catch (error) {
    console.error('Error saving image to library:', error)
    throw new Error('Failed to save image to library')
  }
}

// Get user's image library with optional filters
export async function getImageLibrary(
  filters?: ImageLibraryFilters
): Promise<ImageLibrary[]> {
  try {
    const user = await getOrCreateDemoUser()

    const whereClause: {
      userId: string
      style?: string
      aiModel?: string
      tags?: { hasSome: string[] }
      OR?: Array<{ prompt: { contains: string; mode: 'insensitive' } } | { tags: { hasSome: string[] } }>
    } = {
      userId: user.id
    }

    // Apply filters
    if (filters?.style) {
      whereClause.style = filters.style
    }

    if (filters?.aiModel) {
      whereClause.aiModel = filters.aiModel
    }

    if (filters?.tags && filters.tags.length > 0) {
      whereClause.tags = {
        hasSome: filters.tags
      }
    }

    if (filters?.search) {
      whereClause.OR = [
        { prompt: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } }
      ]
    }

    const images = await prisma.imageLibrary.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return images
  } catch (error) {
    console.error('Error fetching image library:', error)
    throw new Error('Failed to fetch image library')
  }
}

// Delete image from library
export async function deleteImageFromLibrary(imageId: string): Promise<void> {
  try {
    const user = await getOrCreateDemoUser()

    await prisma.imageLibrary.delete({
      where: {
        id: imageId,
        userId: user.id // Ensure user owns the image
      }
    })

    revalidatePath('/image-library')
  } catch (error) {
    console.error('Error deleting image from library:', error)
    throw new Error('Failed to delete image from library')
  }
}

// Update image tags
export async function updateImageTags(
  imageId: string,
  tags: string[]
): Promise<ImageLibrary> {
  try {
    const user = await getOrCreateDemoUser()

    const updatedImage = await prisma.imageLibrary.update({
      where: {
        id: imageId,
        userId: user.id
      },
      data: {
        tags
      }
    })

    revalidatePath('/image-library')
    return updatedImage
  } catch (error) {
    console.error('Error updating image tags:', error)
    throw new Error('Failed to update image tags')
  }
}

// Get image library stats
export async function getImageLibraryStats(): Promise<{
  totalImages: number
  byStyle: Record<string, number>
  byModel: Record<string, number>
  recentCount: number
}> {
  try {
    const user = await getOrCreateDemoUser()

    const images = await prisma.imageLibrary.findMany({
      where: { userId: user.id },
      select: {
        style: true,
        aiModel: true,
        createdAt: true
      }
    })

    const totalImages = images.length
    const byStyle: Record<string, number> = {}
    const byModel: Record<string, number> = {}

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const recentCount = images.filter(img => img.createdAt > oneWeekAgo).length

    images.forEach(image => {
      byStyle[image.style] = (byStyle[image.style] || 0) + 1
      byModel[image.aiModel] = (byModel[image.aiModel] || 0) + 1
    })

    return {
      totalImages,
      byStyle,
      byModel,
      recentCount
    }
  } catch (error) {
    console.error('Error fetching image library stats:', error)
    throw new Error('Failed to fetch image library stats')
  }
}
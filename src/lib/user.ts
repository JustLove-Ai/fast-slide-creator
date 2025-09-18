import { prisma } from '@/lib/db/index'
import { User } from '@/types'

// Get or create a default user for the demo
export async function getOrCreateDemoUser(): Promise<User> {
  try {
    // Try to find an existing demo user
    let user = await prisma.user.findFirst({
      where: { email: 'demo@fast-slide-creator.com' }
    })

    // If no demo user exists, create one
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@fast-slide-creator.com',
          name: 'Demo User'
        }
      })
    }

    return user
  } catch (error) {
    throw new Error('Failed to initialize user')
  }
}
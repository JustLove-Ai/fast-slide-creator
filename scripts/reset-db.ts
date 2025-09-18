import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  try {
    console.log('🗑️  Cleaning up database...')

    // Delete all records in the correct order (respecting foreign key constraints)
    await prisma.slide.deleteMany({})
    console.log('  ✅ Cleared slides')

    await prisma.presentation.deleteMany({})
    console.log('  ✅ Cleared presentations')

    await prisma.brainstorm.deleteMany({})
    console.log('  ✅ Cleared brainstorms')

    await prisma.contextProfile.deleteMany({})
    console.log('  ✅ Cleared context profiles')

    await prisma.user.deleteMany({})
    console.log('  ✅ Cleared users')

    console.log('✨ Database reset complete!')

  } catch (error) {
    console.error('❌ Error resetting database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
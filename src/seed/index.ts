// src/seed/index.ts
import 'dotenv/config' // Добавь эту строку в самое начало!
import { getPayload } from 'payload'
import config from '@payload-config'
import { seedInstruction, clearInstruction } from './instructionSeeder'

async function seed() {
  try {
    // Проверяем наличие секретного ключа
    console.log('Checking environment...')
    console.log('PAYLOAD_SECRET exists:', !!process.env.PAYLOAD_SECRET)

    if (!process.env.PAYLOAD_SECRET) {
      throw new Error('PAYLOAD_SECRET is not defined in environment variables')
    }

    console.log('🌱 Starting seeding process...')

    const payload = await getPayload({ config })
    console.log('✅ Payload initialized')

    await seedInstruction()

    console.log('✨ Seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Запуск
if (process.argv.includes('--clear')) {
  clearInstruction().then(() => process.exit(0))
} else {
  seed()
}

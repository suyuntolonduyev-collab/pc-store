import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { execSync } from 'child_process'

const args = process.argv.slice(2)
const isClear = args.includes('--clear')

// Обратный порядок для безопасного удаления (сначала зависимые коллекции, потом бренды)
const collectionsToClear = [
  'accessories',
  'storage',
  'coolers',
  'cases',
  'psus',
  'ram',
  'gpus',
  'motherboards',
  'processors',
  'brands',
]

// Строгий порядок запуска сидов (по ТЗ)
const seedScripts = [
  'seed-brands.ts',
  'seed-processors.ts',
  'seed-motherboards.ts',
  'seed-gpus.ts',
  'seed-ram.ts',
  'seed-psus.ts',
  'seed-cases.ts',
  'seed-coolers.ts',
  'seed-storage.ts',
  'seed-accessories.ts',
  'seed-instruction.ts',
  'seed-instruction-config.ts',
  'seed-featured.ts',
  'seed-about.ts',
  'seed-contacts.ts',
  'seed-feedback.ts',
]

async function run() {
  if (isClear) {
    console.log('🧹 Начинаем очистку базы данных...')
    const payload = await getPayload({ config: configPromise })

    for (const collection of collectionsToClear) {
      try {
        await payload.delete({
          collection: collection as any,
          where: {}, // Удаляем все документы
        })
        console.log(`🗑️ Очищена коллекция: ${collection}`)
      } catch (err) {
        console.error(`❌ Ошибка при очистке коллекции ${collection}:`, err)
      }
    }

    console.log('✅ База данных успешно очищена.')
    process.exit(0)
  }

  console.log('🚀 Запуск полного цикла сидирования базы данных...')

  for (const script of seedScripts) {
    console.log(`\n=========================================`)
    console.log(`⏳ Выполнение ${script}...`)
    try {
      // Запускаем через pnpm exec tsx для совместимости с твоим пакетным менеджером
      execSync(`pnpm exec tsx src/seed/${script}`, { stdio: 'inherit' })
    } catch (error) {
      console.error(`\n❌ Критическая ошибка при выполнении ${script}. Процесс остановлен.`)
      process.exit(1)
    }
  }

  console.log(`\n=========================================`)
  console.log('✅ Все seed-скрипты успешно выполнены!')
  process.exit(0)
}

run()

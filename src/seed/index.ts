import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { execSync } from 'child_process'

const args = process.argv.slice(2)
const isClear = args.includes('--clear')

// Обратный порядок для безопасного удаления (сначала заказы и сборки, потом бренды и юзеры)
const collectionsToClear = [
  'orders', // Зависит от билдов и юзеров
  'builds', // Зависит от всех комплектующих
  'posts', // Блог
  'accessories', // Периферия
  'storage',
  'coolers',
  'cases',
  'psus',
  'ram',
  'gpus',
  'motherboards',
  'processors',
  'users', // Базовая коллекция для билдов
  'brands', // Фундамент для комплектующих
]

// Строгий порядок запуска сидов (учитывая зависимости)
const seedScripts = [
  // 1. Фундамент (без зависимостей)
  'seed-brands.ts',
  'seed-users.ts',
  'seed-posts.ts',
  'seed-accessories.ts',

  // 2. Комплектующие (зависят от брендов)
  'seed-processors.ts',
  'seed-motherboards.ts',
  'seed-gpus.ts',
  'seed-ram.ts',
  'seed-psus.ts',
  'seed-cases.ts',
  'seed-coolers.ts',
  'seed-storage.ts',

  // 3. Готовые решения (зависят от комплектующих и юзеров)
  'seed-builds.ts',

  // 4. Глобальные страницы и настройки
  'seed-instruction.ts',
  'seed-instruction-config.ts',
  'seed-about.ts',
  'seed-contacts.ts',
  'seed-feedback.ts',

  // 5. Витрина (зависит от того, что в базе уже есть билды)
  'seed-featured.ts',
]

async function run() {
  if (isClear) {
    console.log('🧹 Начинаем полную очистку базы данных PC-STORE...')
    const payload = await getPayload({ config: configPromise })

    for (const collection of collectionsToClear) {
      try {
        await payload.delete({
          collection: collection as any,
          where: {},
        })
        console.log(`  🗑️  Коллекция '${collection}' очищена`)
      } catch (err) {
        console.error(`  ❌ Ошибка очистки '${collection}':`, err)
      }
    }

    console.log('✅ База данных приведена в исходное состояние.')
    process.exit(0)
  }

  console.log('🚀 Запуск полного цикла наполнения базы данных PC-STORE...')

  for (const script of seedScripts) {
    console.log(`\n=========================================`)
    console.log(`⏳ ВЫПОЛНЕНИЕ: ${script}`)
    try {
      // Используем pnpm exec tsx для запуска каждого файла отдельно
      execSync(`pnpm exec tsx src/seed/${script}`, { stdio: 'inherit' })
    } catch (error) {
      console.error(`\n❌ КРИТИЧЕСКАЯ ОШИБКА: Скрипт ${script} завершился сбоем.`)
      console.error(`Дальнейшее сидирование невозможно из-за нарушения целостности связей.`)
      process.exit(1)
    }
  }

  console.log(`\n=========================================`)
  console.log('✨ ПОЗДРАВЛЯЮ! Все данные успешно загружены в PC-STORE.')
  console.log('🖥️  Проверьте админ-панель: http://localhost:3000/admin')
  process.exit(0)
}

run()

import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function seed() {
  const payload = await getPayload({ config: configPromise })
  console.log("🚀 Сидирование глобала 'featured-product-list'...")

  try {
    // 1. Ищем созданные ранее сборки
    const buildsRes = await payload.find({
      collection: 'builds',
      limit: 6, // Берем до 6 сборок для главной страницы
    })

    if (buildsRes.totalDocs === 0) {
      console.warn('⚠️ Сборки не найдены. Сначала запусти seed-builds.ts')
      process.exit(1)
    }

    // 2. Формируем массив для поля 'items' согласно схеме FeaturedProductList.ts
    const featuredItems = buildsRes.docs.map((build) => ({
      build: build.id, // Связываем по ID
    }))

    // 3. Обновляем глобал
    await payload.updateGlobal({
      slug: 'featured-product-list',
      data: {
        title: '🔥 Рекомендуемые конфигурации от PC-STORE',
        items: featuredItems,
      },
    })

    console.log(
      `✅ Секция 'Рекомендуемые сборки' успешно обновлена: добавлено ${featuredItems.length} позиций.`,
    )
  } catch (err) {
    console.error(`❌ Ошибка сидирования 'featured-product-list':`, err)
  }
  process.exit(0)
}

seed()

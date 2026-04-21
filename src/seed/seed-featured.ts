import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const data = {
  title: 'Выбор экспертов и хиты продаж',
  // Массив items оставляем пустым при сидировании,
  // так как коллекция 'builds' еще не заполнена и Payload выдаст ошибку связи
  items: [],
}

async function seed() {
  const payload = await getPayload({ config: configPromise })
  try {
    await payload.updateGlobal({
      slug: 'featured-product-list',
      data: data,
    })
    console.log(`✅ Global 'featured-product-list' успешно обновлен`)
  } catch (err) {
    console.error(`❌ Ошибка при обновлении 'featured-product-list':`, err)
  }
  process.exit(0)
}

seed()

import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const itemsData = [
  { name: 'Монитор Samsung 27" 144Hz', price: 28000 },
  { name: 'Клавиатура Logitech G Pro X', price: 12000 },
  { name: 'Мышь Logitech G502 Hero', price: 5500 },
  { name: 'Наушники HyperX Cloud II', price: 8900 },
  { name: 'Коврик SteelSeries QcK Large', price: 2800 },
  { name: 'Гарантия 1 год', price: 3000 },
  { name: 'Установка Windows 11', price: 1500 },
  { name: 'Кабель-менеджмент (услуга)', price: 2000 },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  for (const item of itemsData) {
    const existing = await payload.find({
      collection: 'accessories',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      try {
        await payload.create({
          collection: 'accessories',
          data: item,
        })
        console.log(`✅ Добавлено: ${item.name}`)
      } catch (err) {
        console.error(`❌ Ошибка при создании ${item.name}:`, err)
      }
    } else {
      console.log(`⏭️ Уже существует: ${item.name}`)
    }
  }

  process.exit(0)
}

seedCollection()

import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type RamItem = {
  name: string
  brandName: string
  type: 'DDR4' | 'DDR5'
  modules_count: number
  total_capacity_gb: number
  speed_mhz: number
  price: number
  stock_quantity: number
  description: string
}

const itemsData: RamItem[] = [
  {
    name: 'Kingston FURY Beast Black 32GB (2x16GB) DDR5 6000MHz',
    brandName: 'Kingston',
    type: 'DDR5',
    modules_count: 2,
    total_capacity_gb: 32,
    speed_mhz: 6000,
    price: 12500,
    stock_quantity: 40,
    description:
      'Отличный комплект современной памяти DDR5 для новых платформ с поддержкой профилей XMP и EXPO.',
  },
  {
    name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz',
    brandName: 'G.Skill',
    type: 'DDR5',
    modules_count: 2,
    total_capacity_gb: 32,
    speed_mhz: 6400,
    price: 15800,
    stock_quantity: 25,
    description:
      'Высокоскоростная оперативная память с красивой ARGB подсветкой и отличным разгонным потенциалом.',
  },
  {
    name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
    brandName: 'Corsair',
    type: 'DDR4',
    modules_count: 2,
    total_capacity_gb: 16,
    speed_mhz: 3200,
    price: 4500,
    stock_quantity: 60,
    description:
      'Классическая и надежная оперативная память с низкопрофильными радиаторами для сборок на DDR4.',
  },
  {
    name: 'Crucial Pro 32GB (2x16GB) DDR4 3200MHz',
    brandName: 'Crucial',
    type: 'DDR4',
    modules_count: 2,
    total_capacity_gb: 32,
    speed_mhz: 3200,
    price: 7200,
    stock_quantity: 35,
    description:
      'Строгая память без подсветки с черными радиаторами, отлично подходит для рабочих станций.',
  },
  {
    name: 'G.Skill Ripjaws V 32GB (2x16GB) DDR4 3600MHz',
    brandName: 'G.Skill',
    type: 'DDR4',
    modules_count: 2,
    total_capacity_gb: 32,
    speed_mhz: 3600,
    price: 8500,
    stock_quantity: 30,
    description: 'Оптимальный объем и высокая частота для игровых сборок прошлого поколения.',
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  const uniqueBrandNames = Array.from(new Set(itemsData.map((item) => item.brandName)))
  const brandsCache: Record<string, number> = {}

  for (const name of uniqueBrandNames) {
    const brandRes = await payload.find({
      collection: 'brands',
      where: { name: { equals: name } },
    })

    if (brandRes.docs.length > 0 && brandRes.docs[0].id) {
      brandsCache[name] = brandRes.docs[0].id as number
    } else {
      console.error(`❌ Бренд '${name}' не найден — сначала запусти seed-brands.ts`)
      process.exit(1)
    }
  }

  for (const item of itemsData) {
    const existing = await payload.find({
      collection: 'ram',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      const { brandName, ...restData } = item
      try {
        await payload.create({
          collection: 'ram',
          data: {
            ...restData,
            brand: Number(brandsCache[brandName]),
          },
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

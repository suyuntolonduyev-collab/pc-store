import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type ProcessorItem = {
  name: string
  brandName: string
  socket: 'LGA1700' | 'LGA1200' | 'AM4' | 'AM5' | 'TR4'
  supports_ddr4: boolean
  supports_ddr5: boolean
  has_graphics: boolean
  tdp: number
  fps_multiplier: number
  price: number
  stock_quantity: number
  description: string
}

const itemsData: ProcessorItem[] = [
  {
    name: 'AMD Ryzen 7 7800X3D',
    brandName: 'AMD',
    socket: 'AM5',
    supports_ddr4: false,
    supports_ddr5: true,
    has_graphics: false,
    tdp: 120,
    fps_multiplier: 1.2,
    price: 42000,
    stock_quantity: 15,
    description: 'Абсолютный лидер для игровых сборок благодаря технологии 3D V-Cache.',
  },
  {
    name: 'Intel Core i9-14900K',
    brandName: 'Intel',
    socket: 'LGA1700',
    supports_ddr4: true,
    supports_ddr5: true,
    has_graphics: true,
    tdp: 253,
    fps_multiplier: 1.1,
    price: 65000,
    stock_quantity: 5,
    description: 'Флагманский процессор для бескомпромиссных задач и тяжелого рендеринга.',
  },
  {
    name: 'Intel Core i5-13400F',
    brandName: 'Intel',
    socket: 'LGA1700',
    supports_ddr4: true,
    supports_ddr5: true,
    has_graphics: false,
    tdp: 65,
    fps_multiplier: 1.0,
    price: 19500,
    stock_quantity: 30,
    description:
      'Отличный процессор среднего сегмента без встроенного видеоядра, идеален для сборок с дискретной видеокартой.',
  },
  {
    name: 'AMD Ryzen 5 7600',
    brandName: 'AMD',
    socket: 'AM5',
    supports_ddr4: false,
    supports_ddr5: true,
    has_graphics: true,
    tdp: 65,
    fps_multiplier: 1.0,
    price: 21000,
    stock_quantity: 20,
    description: 'Оптимальный и энергоэффективный выбор для перехода на новую платформу AM5.',
  },
  {
    name: 'AMD Ryzen 5 5600',
    brandName: 'AMD',
    socket: 'AM4',
    supports_ddr4: true,
    supports_ddr5: false,
    has_graphics: false,
    tdp: 65,
    fps_multiplier: 0.85,
    price: 12500,
    stock_quantity: 40,
    description: 'Народный хит для бюджетных сборок на проверенной платформе AM4.',
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
      collection: 'processors',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      const { brandName, ...restData } = item
      try {
        await payload.create({
          collection: 'processors',
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

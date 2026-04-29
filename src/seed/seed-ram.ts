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
  // === DDR5 Kits (High-End & Mainstream) ===
  {
    name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6400MHz CL32',
    brandName: 'G.Skill',
    type: 'DDR5',
    modules_count: 2,
    total_capacity_gb: 64,
    speed_mhz: 6400,
    price: 28500,
    stock_quantity: 5,
    description:
      'Ультимативный комплект для рабочих станций и энтузиастов. Высокая частота, низкие задержки и премиальная ARGB подсветка.',
  },
  {
    name: 'Kingston FURY Renegade RGB 32GB (2x16GB) DDR5 7200MHz',
    brandName: 'Kingston',
    type: 'DDR5',
    modules_count: 2,
    total_capacity_gb: 32,
    speed_mhz: 7200,
    price: 19800,
    stock_quantity: 8,
    description:
      'Экстремально быстрая память для чипсетов Z790. Поддержка профилей Intel XMP 3.0 для моментального разгона.',
  },
  {
    name: 'G.Skill Flare X5 32GB (2x16GB) DDR5 6000MHz CL30',
    brandName: 'G.Skill',
    type: 'DDR5',
    modules_count: 2,
    total_capacity_gb: 32,
    speed_mhz: 6000,
    price: 14200,
    stock_quantity: 20,
    description:
      'Оптимизирована специально для платформы AMD AM5. Профили EXPO обеспечивают идеальную стабильность с процессорами Ryzen 7000.',
  },
  {
    name: 'Kingston FURY Beast Black 16GB (2x8GB) DDR5 5200MHz',
    brandName: 'Kingston',
    type: 'DDR5',
    modules_count: 2,
    total_capacity_gb: 16,
    speed_mhz: 5200,
    price: 7500,
    stock_quantity: 30,
    description:
      'Входной билет в мир DDR5. Надежный двухканальный комплект со строгим дизайном без подсветки.',
  },
  {
    name: 'Crucial Classic 16GB DDR5 4800MHz',
    brandName: 'Crucial',
    type: 'DDR5',
    modules_count: 1,
    total_capacity_gb: 16,
    speed_mhz: 4800,
    price: 5800,
    stock_quantity: 40,
    description:
      'Базовая память стандарта DDR5. Идеально подходит для офисных или бюджетных рабочих систем на LGA1700.',
  },

  // === DDR4 Kits (Budget & Legacy) ===
  {
    name: 'Kingston FURY Renegade 32GB (2x16GB) DDR4 3600MHz CL16',
    brandName: 'Kingston',
    type: 'DDR4',
    modules_count: 2,
    total_capacity_gb: 32,
    speed_mhz: 3600,
    price: 9800,
    stock_quantity: 15,
    description:
      'Лучшая память для платформы AM4. Низкие тайминги CL16 значительно повышают производительность в играх.',
  },
  {
    name: 'G.Skill Ripjaws V 32GB (2x16GB) DDR4 3200MHz CL16',
    brandName: 'G.Skill',
    type: 'DDR4',
    modules_count: 2,
    total_capacity_gb: 32,
    speed_mhz: 3200,
    price: 8200,
    stock_quantity: 25,
    description:
      'Классика игрового сегмента. Высокие радиаторы обеспечивают отличный теплоотвод при длительных нагрузках.',
  },
  {
    name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
    brandName: 'Corsair',
    type: 'DDR4',
    modules_count: 2,
    total_capacity_gb: 16,
    speed_mhz: 3200,
    price: 4600,
    stock_quantity: 50,
    description:
      'Низкопрофильная память, которая не мешает установке даже самых массивных башенных кулеров.',
  },
  {
    name: 'Crucial Pro 16GB (2x8GB) DDR4 3200MHz CL22',
    brandName: 'Crucial',
    type: 'DDR4',
    modules_count: 2,
    total_capacity_gb: 16,
    speed_mhz: 3200,
    price: 4100,
    stock_quantity: 45,
    description: 'Надежное и стабильное решение от Micron для повседневных задач и работы.',
  },
  {
    name: 'G.Skill Aegis 8GB DDR4 3200MHz',
    brandName: 'G.Skill',
    type: 'DDR4',
    modules_count: 1,
    total_capacity_gb: 8,
    speed_mhz: 3200,
    price: 2200,
    stock_quantity: 60,
    description:
      'Минимально необходимый объем для современной системы. Позволяет собрать ультрабюджетный ПК.',
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  console.log('⏳ Кеширование брендов для RAM...')
  const uniqueBrandNames = Array.from(new Set(itemsData.map((item) => item.brandName)))
  const brandsCache: Record<string, number> = {}

  for (const name of uniqueBrandNames) {
    const brandRes = await payload.find({
      collection: 'brands',
      where: { name: { equals: name } },
    })

    if (brandRes.docs.length > 0) {
      brandsCache[name] = brandRes.docs[0].id as number
    } else {
      console.error(`❌ Ошибка: Бренд '${name}' не найден. Проверь seed-brands.ts.`)
      process.exit(1)
    }
  }

  console.log(`🚀 Сидирование 'ram' (${itemsData.length} шт.)...`)

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
            brand: brandsCache[brandName] as any,
          },
        })
        console.log(`✅ Добавлено: ${item.name} | ${item.type} | ${item.total_capacity_gb}GB`)
      } catch (err) {
        console.error(`❌ Ошибка создания ${item.name}:`, err)
      }
    } else {
      console.log(`⏭️ Пропуск: ${item.name} (уже в базе)`)
    }
  }

  console.log('✨ Сидирование оперативной памяти завершено!')
  process.exit(0)
}

seedCollection()

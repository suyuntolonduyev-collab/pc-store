import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type StorageItem = {
  name: string
  brandName: string
  type: 'NVMe' | 'SATA SSD' | 'HDD'
  interface: 'M.2' | 'SATA'
  capacity_gb: number
  price: number
  stock_quantity: number
  description: string
}

const itemsData: StorageItem[] = [
  // === NVMe SSD (Gen5 & Gen4 High-End) ===
  {
    name: 'Crucial T705 2TB PCIe Gen5 NVMe',
    brandName: 'Crucial',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 2000,
    price: 45000,
    stock_quantity: 3,
    description:
      'Один из самых быстрых накопителей в мире. Скорость чтения до 14,500 МБ/с. Требует наличия слота PCIe 5.0 на материнской плате и хорошего охлаждения.',
  },
  {
    name: 'Samsung 990 PRO 2TB (с радиатором)',
    brandName: 'Samsung',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 2000,
    price: 21500,
    stock_quantity: 12,
    description:
      'Лучший выбор для геймеров и профессионалов. Стабильно высокая производительность PCIe 4.0 и наличие заводского радиатора.',
  },
  {
    name: 'WD_BLACK SN850X 1TB',
    brandName: 'WD',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 1000,
    price: 12800,
    stock_quantity: 15,
    description:
      'Специально оптимизирован для сокращения времени загрузки в играх. Высокая скорость случайного чтения.',
  },
  {
    name: 'Kingston FURY Renegade 2TB',
    brandName: 'Kingston',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 2000,
    price: 18900,
    stock_quantity: 10,
    description:
      'Надежный накопитель на базе контроллера Phison E18. Отличный ресурс записи (TBW).',
  },

  // === NVMe SSD (Mainstream / Budget) ===
  {
    name: 'Kingston NV2 1TB',
    brandName: 'Kingston',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 1000,
    price: 6200,
    stock_quantity: 40,
    description:
      'Самое популярное бюджетное решение для систем на PCIe 4.0. Идеально для хранения библиотеки игр.',
  },
  {
    name: 'Samsung 980 500GB',
    brandName: 'Samsung',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 500,
    price: 5800,
    stock_quantity: 25,
    description: 'Безбуферный (DRAM-less) NVMe накопитель для установки системы и офисного ПО.',
  },
  {
    name: 'Crucial P3 500GB',
    brandName: 'Crucial',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 500,
    price: 4500,
    stock_quantity: 30,
    description:
      'Доступный NVMe стандарта PCIe 3.0. Подойдет для апгрейда ноутбуков или старых ПК.',
  },

  // === SATA SSD (Для игр и медиа) ===
  {
    name: 'Samsung 870 EVO 1TB',
    brandName: 'Samsung',
    type: 'SATA SSD',
    interface: 'SATA',
    capacity_gb: 1000,
    price: 9800,
    stock_quantity: 18,
    description:
      'Эталон среди SATA накопителей. Максимально возможные скорости для интерфейса SATA III и высокая надежность.',
  },
  {
    name: 'Crucial MX500 2TB',
    brandName: 'Crucial',
    type: 'SATA SSD',
    interface: 'SATA',
    capacity_gb: 2000,
    price: 15500,
    stock_quantity: 10,
    description:
      'Накопитель с DRAM-буфером. Отлично подходит в качестве второго диска для хранения больших игр и монтажа видео.',
  },
  {
    name: 'Kingston A400 480GB',
    brandName: 'Kingston',
    type: 'SATA SSD',
    interface: 'SATA',
    capacity_gb: 480,
    price: 3200,
    stock_quantity: 50,
    description:
      'Ультрабюджетный вариант для оживления старой системы. В 10 раз быстрее обычного HDD.',
  },

  // === HDD (Для файлопомоек) ===
  {
    name: 'Seagate BarraCuda 2TB 7200rpm',
    brandName: 'Seagate',
    type: 'HDD',
    interface: 'SATA',
    capacity_gb: 2000,
    price: 5800,
    stock_quantity: 20,
    description: 'Классический жесткий диск для хранения архивов, фото и видео.',
  },
  {
    name: 'WD Blue 4TB 5400rpm',
    brandName: 'WD',
    price: 9200,
    stock_quantity: 12,
    type: 'HDD',
    interface: 'SATA',
    capacity_gb: 4000,
    description: 'Тихий и емкий диск для длительного хранения данных.',
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  console.log('⏳ Кеширование брендов для накопителей...')
  const uniqueBrandNames = Array.from(new Set(itemsData.map((item) => item.brandName)))
  const brandsCache: Record<string, number> = {}

  for (const name of uniqueBrandNames) {
    const brandRes = await payload.find({
      collection: 'brands',
      where: { name: { equals: name } },
    })

    if (brandRes.docs.length > 0) {
      brandsCache[name] = brandRes.docs[0].id as number
    }
  }

  console.log(`🚀 Сидирование 'storage' (${itemsData.length} шт.)...`)

  for (const item of itemsData) {
    const existing = await payload.find({
      collection: 'storage',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      const { brandName, ...restData } = item
      try {
        await payload.create({
          collection: 'storage',
          data: {
            ...restData,
            // Следуем паттерну пользователя из seed-storage.ts (as any)
            // так как в схеме Storage.ts указан тип text, но сид ищет ID.
            brand: (brandsCache[brandName] ? String(brandsCache[brandName]) : brandName) as any,
          },
        })
        console.log(`✅ [Storage] ${item.name} | ${item.type} | ${item.capacity_gb}GB`)
      } catch (err) {
        console.error(`❌ Ошибка создания накопителя ${item.name}:`, err)
      }
    } else {
      console.log(`⏭️ Пропуск: ${item.name}`)
    }
  }

  console.log('✨ Сидирование накопителей завершено!')
  process.exit(0)
}

seedCollection()

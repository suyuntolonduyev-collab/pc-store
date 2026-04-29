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
  // === AMD AM5 (Ryzen 7000 Series) ===
  {
    name: 'AMD Ryzen 9 7950X3D',
    brandName: 'AMD',
    socket: 'AM5',
    supports_ddr4: false,
    supports_ddr5: true,
    has_graphics: true, // В 7000 серии есть базовая встройка
    tdp: 120,
    fps_multiplier: 1.18,
    price: 68000,
    stock_quantity: 5,
    description:
      'Ультимативный флагман для тяжелых рабочих задач (16 ядер) и бескомпромиссного гейминга благодаря 3D V-Cache.',
  },
  {
    name: 'AMD Ryzen 7 7800X3D',
    brandName: 'AMD',
    socket: 'AM5',
    supports_ddr4: false,
    supports_ddr5: true,
    has_graphics: true,
    tdp: 120,
    fps_multiplier: 1.2, // Эталон для игр
    price: 42000,
    stock_quantity: 15,
    description:
      'Абсолютный лидер для игровых сборок. Выдает максимальный FPS в любых современных проектах.',
  },
  {
    name: 'AMD Ryzen 7 7700X',
    brandName: 'AMD',
    socket: 'AM5',
    supports_ddr4: false,
    supports_ddr5: true,
    has_graphics: true,
    tdp: 105,
    fps_multiplier: 1.05,
    price: 35000,
    stock_quantity: 12,
    description:
      'Мощный 8-ядерный процессор нового поколения, отлично сбалансирован для игр и работы.',
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
    price: 22000,
    stock_quantity: 25,
    description: 'Входной билет в платформу AM5. Холодный, энергоэффективный и быстрый.',
  },

  // === AMD AM4 (Ryzen 5000 Series) ===
  {
    name: 'AMD Ryzen 7 5800X3D',
    brandName: 'AMD',
    socket: 'AM4',
    supports_ddr4: true,
    supports_ddr5: false,
    has_graphics: false,
    tdp: 105,
    fps_multiplier: 1.08,
    price: 33000,
    stock_quantity: 10,
    description: 'Легенда платформы AM4. Идеальный вариант для финального апгрейда старых систем.',
  },
  {
    name: 'AMD Ryzen 7 5700X',
    brandName: 'AMD',
    socket: 'AM4',
    supports_ddr4: true,
    supports_ddr5: false,
    has_graphics: false,
    tdp: 65, // Очень холодный для 8 ядер
    fps_multiplier: 0.95,
    price: 18000,
    stock_quantity: 20,
    description: 'Энергоэффективный 8-ядерник. Отличный выбор для недорогих рабочих станций.',
  },
  {
    name: 'AMD Ryzen 5 5600',
    brandName: 'AMD',
    socket: 'AM4',
    supports_ddr4: true,
    supports_ddr5: false,
    has_graphics: false,
    tdp: 65,
    fps_multiplier: 0.9,
    price: 13000,
    stock_quantity: 40,
    description:
      'Народный хит. Обеспечивает плавный гейминг в связке с картами уровня RTX 3060 или RX 6600.',
  },
  {
    name: 'AMD Ryzen 5 5600G',
    brandName: 'AMD',
    socket: 'AM4',
    supports_ddr4: true,
    supports_ddr5: false,
    has_graphics: true,
    tdp: 65,
    fps_multiplier: 0.85,
    price: 14000,
    stock_quantity: 30,
    description:
      'Процессор со встроенной графикой Radeon Vega. Позволяет переждать покупку дискретной видеокарты.',
  },

  // === INTEL LGA1700 (12, 13, 14 Gen) ===
  {
    name: 'Intel Core i9-14900K',
    brandName: 'Intel',
    socket: 'LGA1700',
    supports_ddr4: true,
    supports_ddr5: true, // Контроллер Intel поддерживает оба типа
    has_graphics: true,
    tdp: 253, // Указываем PL2 (максимальный) для правильного подбора кулера/СЖО
    fps_multiplier: 1.15,
    price: 65000,
    stock_quantity: 8,
    description:
      'Горячий и невероятно мощный флагман от Intel (24 ядра). Требует топового охлаждения и мощного блока питания.',
  },
  {
    name: 'Intel Core i7-14700K',
    brandName: 'Intel',
    socket: 'LGA1700',
    supports_ddr4: true,
    supports_ddr5: true,
    has_graphics: true,
    tdp: 253,
    fps_multiplier: 1.12,
    price: 45000,
    stock_quantity: 12,
    description:
      'Оптимальный High-End процессор. Идеален для рендеринга, стриминга и игр в высоком разрешении.',
  },
  {
    name: 'Intel Core i5-13600K',
    brandName: 'Intel',
    socket: 'LGA1700',
    supports_ddr4: true,
    supports_ddr5: true,
    has_graphics: true,
    tdp: 181,
    fps_multiplier: 1.08,
    price: 32000,
    stock_quantity: 18,
    description:
      'Лучший процессор Intel по соотношению цена/производительность для продвинутых геймеров.',
  },
  {
    name: 'Intel Core i5-13400F',
    brandName: 'Intel',
    socket: 'LGA1700',
    supports_ddr4: true,
    supports_ddr5: true,
    has_graphics: false,
    tdp: 148, // PL2
    fps_multiplier: 1.0,
    price: 21000,
    stock_quantity: 35,
    description: 'Универсальный 10-ядерный процессор без переплаты за встроенное видеоядро.',
  },
  {
    name: 'Intel Core i5-12400F',
    brandName: 'Intel',
    socket: 'LGA1700',
    supports_ddr4: true,
    supports_ddr5: true,
    has_graphics: false,
    tdp: 117, // PL2
    fps_multiplier: 0.95,
    price: 16000,
    stock_quantity: 50,
    description: 'Бестселлер прошлых лет, который до сих пор отлично тянет 99% игр.',
  },
  {
    name: 'Intel Core i3-12100F',
    brandName: 'Intel',
    socket: 'LGA1700',
    supports_ddr4: true,
    supports_ddr5: true,
    has_graphics: false,
    tdp: 89, // PL2
    fps_multiplier: 0.85,
    price: 10000,
    stock_quantity: 45,
    description:
      'Король ультрабюджетных сборок. 4 производительных ядра, которых достаточно для киберспорта.',
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  console.log('⏳ Получение ID брендов из базы...')
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
      console.error(`❌ Бренд '${name}' не найден — сначала убедись, что отработал seed-brands.ts`)
      process.exit(1)
    }
  }

  console.log(`🚀 Начинаем сидирование коллекции 'processors' (${itemsData.length} шт.)...`)

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
            brand: brandsCache[brandName] as any, // TypeScript обход для Payload ID
          },
        })
        console.log(`✅ Добавлено: ${item.name} | Socket: ${item.socket} | TDP: ${item.tdp}W`)
      } catch (err) {
        console.error(`❌ Ошибка при создании ${item.name}:`, err)
      }
    } else {
      console.log(`⏭️ Уже существует: ${item.name}`)
    }
  }

  console.log('✨ Сидирование процессоров завершено успешно!')
  process.exit(0)
}

seedCollection()

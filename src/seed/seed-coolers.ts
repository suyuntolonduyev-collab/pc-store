import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type CoolerItem = {
  name: string
  brandName: string
  price: number
  stock_quantity: number
  supports_lga1700: boolean
  supports_am4: boolean
  supports_am5: boolean
  max_tdp: number
  height_mm: number
  description: string
}

const itemsData: CoolerItem[] = [
  // === Воздушное охлаждение (Top-Tier) ===
  {
    name: 'Noctua NH-D15 chromax.black',
    brandName: 'Noctua',
    price: 12500,
    stock_quantity: 10,
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 250,
    height_mm: 165,
    description:
      'Легендарный двухбашенный кулер. Обеспечивает эффективность на уровне систем жидкостного охлаждения при полной тишине.',
  },
  {
    name: 'be quiet! Dark Rock Pro 5',
    brandName: 'be quiet!',
    price: 11200,
    stock_quantity: 8,
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 270,
    height_mm: 168,
    description:
      'Флагман от немецкого бренда. Обладает феноменальной мощностью охлаждения и практически бесшумной работой даже на высоких оборотах.',
  },
  {
    name: 'Deepcool AK620 Digital',
    brandName: 'Deepcool',
    price: 7800,
    stock_quantity: 15,
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 260,
    height_mm: 162,
    description:
      'Современная башня с цифровым дисплеем, отображающим температуру процессора и уровень загрузки в реальном времени.',
  },

  // === Системы жидкостного охлаждения (AIO) ===
  {
    name: 'ASUS ROG RYUJIN III 360 ARGB',
    brandName: 'ASUS',
    price: 38000,
    stock_quantity: 5,
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 350,
    height_mm: 30, // Для СЖО указываем высоту водоблока для совместимости
    description:
      'Ультимативная СЖО с 3.5-дюймовым LCD-экраном, встроенным вентилятором в водоблоке для охлаждения VRM и помпами Asetek 8-го поколения.',
  },
  {
    name: 'NZXT Kraken Elite 360 RGB White',
    brandName: 'NZXT',
    price: 32000,
    stock_quantity: 4,
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 300,
    height_mm: 35,
    description:
      'Премиальная СЖО в белом исполнении. Высококачественный дисплей позволяет выводить системные показатели или анимированные GIF.',
  },
  {
    name: 'Deepcool LS720 WH',
    brandName: 'Deepcool',
    price: 13500,
    stock_quantity: 12,
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 300,
    height_mm: 30,
    description:
      'Высокопроизводительная СЖО с зеркальной подсветкой помпы и эффективными вентиляторами FC120.',
  },

  // === Средний сегмент (Mainstream) ===
  {
    name: 'ID-COOLING SE-226-XT Black',
    brandName: 'Deepcool', // Используем имеющиеся бренды из seed-brands
    price: 4200,
    stock_quantity: 25,
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 250,
    height_mm: 154,
    description:
      'Черный массивный кулер с отличным соотношением цены и эффективности. Справляется с большинством современных процессоров.',
  },
  {
    name: 'be quiet! Pure Rock 2 FX',
    brandName: 'be quiet!',
    price: 5800,
    stock_quantity: 20,
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 150,
    height_mm: 155,
    description:
      'Тихое охлаждение с яркой ARGB подсветкой. Идеально подходит для процессоров уровня Core i5 или Ryzen 5.',
  },

  // === Низкопрофильные (Для ITX сборок вроде Fractal Terra) ===
  {
    name: 'Noctua NH-L9i-17xx chromax.black',
    brandName: 'Noctua',
    price: 6500,
    stock_quantity: 12,
    supports_lga1700: true,
    supports_am4: false,
    supports_am5: false,
    max_tdp: 95,
    height_mm: 37, // Идеально для ультракомпактных корпусов
    description:
      'Ультракомпактный кулер высотой всего 37 мм. Лучшее решение для HTPC и малых форм-факторов.',
  },
  {
    name: 'Noctua NH-L9a-AM5 chromax.black',
    brandName: 'Noctua',
    price: 6500,
    stock_quantity: 10,
    supports_lga1700: false,
    supports_am4: false,
    supports_am5: true,
    max_tdp: 95,
    height_mm: 37,
    description: 'Специальная версия низкопрофильного кулера для платформы AMD AM5.',
  },
  {
    name: 'Deepcool AN600',
    brandName: 'Deepcool',
    price: 4800,
    stock_quantity: 15,
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 180,
    height_mm: 67,
    description:
      'Низкопрофильный кулер с 120-мм вентилятором. Обеспечивает отличный баланс между размером и мощностью охлаждения.',
  },

  // === Бюджетные решения ===
  {
    name: 'Deepcool AG400 BK ARGB',
    brandName: 'Deepcool',
    price: 2800,
    stock_quantity: 40,
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 220,
    height_mm: 150,
    description:
      'Классическая "башня" на четырех тепловых трубках. Легко устанавливается и отлично выглядит благодаря подсветке.',
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  console.log('⏳ Кеширование брендов для систем охлаждения...')
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
      console.warn(`⚠️ Бренд '${name}' не найден. Проверь seed-brands.ts.`)
    }
  }

  console.log(`🚀 Начинаем сидирование 'coolers' (${itemsData.length} моделей)...`)

  for (const item of itemsData) {
    const existing = await payload.find({
      collection: 'coolers',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      const { brandName, ...restData } = item
      try {
        await payload.create({
          collection: 'coolers',
          data: {
            ...restData,
            brand: (brandsCache[brandName] || 1) as any,
          },
        })
        console.log(`✅ [Cooler] ${item.name} | TDP: ${item.max_tdp}W | H: ${item.height_mm}mm`)
      } catch (err) {
        console.error(`❌ Ошибка создания кулера ${item.name}:`, err)
      }
    } else {
      console.log(`⏭️ Пропуск: ${item.name}`)
    }
  }

  console.log('✨ Сидирование систем охлаждения завершено!')
  process.exit(0)
}

seedCollection()

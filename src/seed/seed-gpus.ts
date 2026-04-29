import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type GPUItem = {
  name: string
  brandSlug: string
  price: number
  stock_quantity: number
  length_mm: number
  recommended_psu_w: number
  connector_8pin: number
  connector_16pin: boolean
  description: string
  fps_presets: {
    esports: number
    aaa: number
    casual: number
  }
}

const itemsData: GPUItem[] = [
  // === NVIDIA RTX 40-Series ===
  {
    name: 'ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X',
    brandSlug: 'asus',
    price: 215000,
    stock_quantity: 3,
    length_mm: 358,
    recommended_psu_w: 1000,
    connector_8pin: 0,
    connector_16pin: true,
    description:
      'Вершина графической производительности. Массивный радиатор и испарительная камера обеспечивают тихую работу даже при нагрузке 450W+.',
    fps_presets: { esports: 600, aaa: 145, casual: 380 },
  },
  {
    name: 'MSI GeForce RTX 4080 SUPER 16G EXPERT',
    brandSlug: 'msi',
    price: 135000,
    stock_quantity: 5,
    length_mm: 312,
    recommended_psu_w: 850,
    connector_8pin: 0,
    connector_16pin: true,
    description:
      'Премиальное исполнение в металлическом корпусе с уникальной системой сквозного обдува. Идеальна для 4K.',
    fps_presets: { esports: 520, aaa: 110, casual: 310 },
  },
  {
    name: 'Gigabyte GeForce RTX 4070 SUPER GAMING OC 12G',
    brandSlug: 'gigabyte',
    price: 78000,
    stock_quantity: 12,
    length_mm: 300,
    recommended_psu_w: 700,
    connector_8pin: 0,
    connector_16pin: true,
    description:
      'Золотая середина для 1440p гейминга. Технология DLSS 3 Frame Generation позволяет запускать любые игры на ультра-настройках.',
    fps_presets: { esports: 420, aaa: 85, casual: 240 },
  },
  {
    name: 'ASUS Dual GeForce RTX 4060 Ti OC Edition 8GB',
    brandSlug: 'asus',
    price: 48500,
    stock_quantity: 15,
    length_mm: 227,
    recommended_psu_w: 650,
    connector_8pin: 1,
    connector_16pin: false,
    description:
      'Компактная двухвентиляторная карта, которая поместится почти в любой корпус. Отличная энергоэффективность.',
    fps_presets: { esports: 340, aaa: 65, casual: 180 },
  },
  {
    name: 'MSI GeForce RTX 4060 VENTUS 2X WHITE 8G OC',
    brandSlug: 'msi',
    price: 37000,
    stock_quantity: 20,
    length_mm: 199,
    recommended_psu_w: 550,
    connector_8pin: 1,
    connector_16pin: false,
    description:
      'Стильная белоснежная карта для бюджетных игровых сборок. Лучший выбор для мониторов 1080p.',
    fps_presets: { esports: 280, aaa: 55, casual: 150 },
  },

  // === AMD Radeon RX 7000-Series ===
  {
    name: 'Sapphire NITRO+ AMD Radeon RX 7900 XTX 24GB',
    brandSlug: 'amd',
    price: 118000,
    stock_quantity: 4,
    length_mm: 320,
    recommended_psu_w: 850,
    connector_8pin: 3,
    connector_16pin: false,
    description:
      'Флагман от AMD с огромным объемом видеопамяти. NITRO+ отличается лучшим охлаждением и высоким лимитом мощности.',
    fps_presets: { esports: 550, aaa: 120, casual: 330 },
  },
  {
    name: 'Gigabyte Radeon RX 7800 XT GAMING OC 16G',
    brandSlug: 'gigabyte',
    price: 64000,
    stock_quantity: 10,
    length_mm: 302,
    recommended_psu_w: 700,
    connector_8pin: 2,
    connector_16pin: false,
    description:
      'Мощный чип и 16 ГБ памяти делают эту карту идеальной для текстур высокого разрешения в 2K.',
    fps_presets: { esports: 380, aaa: 75, casual: 210 },
  },
  {
    name: 'ASRock Radeon RX 7600 Challenger 8GB OC',
    brandSlug: 'asrock',
    price: 32500,
    stock_quantity: 18,
    length_mm: 269,
    recommended_psu_w: 550,
    connector_8pin: 1,
    connector_16pin: false,
    description:
      'Доступное решение на современной архитектуре RDNA 3. Поддержка кодека AV1 для стриминга.',
    fps_presets: { esports: 250, aaa: 45, casual: 130 },
  },

  // === Legacy / Budget Choices ===
  {
    name: 'ASUS Dual GeForce RTX 3060 V2 OC Edition 12GB',
    brandSlug: 'asus',
    price: 34500,
    stock_quantity: 25,
    length_mm: 200,
    recommended_psu_w: 650,
    connector_8pin: 1,
    connector_16pin: false,
    description:
      'Проверенная временем классика. 12 ГБ видеопамяти остаются актуальными для рабочих задач и игр.',
    fps_presets: { esports: 240, aaa: 40, casual: 120 },
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  console.log('⏳ Кеширование брендов по slug...')
  const uniqueBrandSlugs = Array.from(new Set(itemsData.map((item) => item.brandSlug)))
  const brandsCache: Record<string, number> = {}

  for (const slug of uniqueBrandSlugs) {
    const brandRes = await payload.find({
      collection: 'brands',
      where: { slug: { equals: slug } },
    })

    if (brandRes.docs.length > 0) {
      brandsCache[slug] = brandRes.docs[0].id as number
    } else {
      console.error(`❌ Ошибка: Бренд со слагом '${slug}' не найден. Проверь seed-brands.ts.`)
      process.exit(1)
    }
  }

  console.log(`🚀 Сидирование 'gpus' (${itemsData.length} шт.)...`)

  for (const item of itemsData) {
    const existing = await payload.find({
      collection: 'gpus',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      const { brandSlug, ...restData } = item
      try {
        await payload.create({
          collection: 'gpus',
          data: {
            ...restData,
            brand: brandsCache[brandSlug] as any,
          },
        })
        console.log(
          `✅ Добавлено: ${item.name} | L: ${item.length_mm}mm | PSU: ${item.recommended_psu_w}W`,
        )
      } catch (err) {
        console.error(`❌ Ошибка создания ${item.name}:`, err)
      }
    } else {
      console.log(`⏭️ Пропуск: ${item.name} (уже в базе)`)
    }
  }

  console.log('✨ Сидирование видеокарт завершено!')
  process.exit(0)
}

seedCollection()

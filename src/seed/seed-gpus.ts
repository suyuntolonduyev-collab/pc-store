import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const itemsData = [
  {
    name: 'ASUS ROG Strix GeForce RTX 4090 24GB',
    brandSlug: 'asus',
    length_mm: 358,
    recommended_psu_w: 1000,
    connector_8pin: 0,
    connector_16pin: true,
    fps_presets: {
      esports: 600,
      aaa: 130,
      casual: 350,
    },
    price: 245000,
    stock_quantity: 3,
    description:
      'Флагманская видеокарта для бескомпромиссного 4K гейминга с массивным охлаждением.',
  },
  {
    name: 'Gigabyte GeForce RTX 4070 SUPER WINDFORCE OC 12G',
    brandSlug: 'gigabyte',
    length_mm: 261,
    recommended_psu_w: 700,
    connector_8pin: 0,
    connector_16pin: true,
    fps_presets: {
      esports: 400,
      aaa: 100,
      casual: 220,
    },
    price: 76000,
    stock_quantity: 12,
    description: 'Оптимальный выбор для игры в 1440p на ультра настройках с поддержкой DLSS 3.',
  },
  {
    name: 'ASUS TUF Gaming Radeon RX 7800 XT 16GB',
    brandSlug: 'asus',
    length_mm: 320,
    recommended_psu_w: 750,
    connector_8pin: 2,
    connector_16pin: false,
    fps_presets: {
      esports: 350,
      aaa: 90,
      casual: 200,
    },
    price: 68000,
    stock_quantity: 8,
    description: 'Мощное решение от AMD с отличным соотношением цена/производительность для 2K.',
  },
  {
    name: 'MSI GeForce RTX 3060 VENTUS 2X 12G OC',
    brandSlug: 'msi',
    length_mm: 235,
    recommended_psu_w: 550,
    connector_8pin: 1,
    connector_16pin: false,
    fps_presets: {
      esports: 300,
      aaa: 65,
      casual: 150,
    },
    price: 33500,
    stock_quantity: 25,
    description: 'Народная видеокарта с 12 ГБ памяти, идеальна для 1080p.',
  },
  {
    name: 'ASRock Radeon RX 6600 Challenger D 8GB',
    brandSlug: 'asrock',
    length_mm: 269,
    recommended_psu_w: 500,
    connector_8pin: 1,
    connector_16pin: false,
    fps_presets: {
      esports: 260,
      aaa: 55,
      casual: 130,
    },
    price: 24500,
    stock_quantity: 18,
    description:
      'Бюджетная видеокарта, обеспечивающая комфортный FPS в киберспорте и современных играх.',
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  const uniqueBrandSlugs = Array.from(new Set(itemsData.map((item) => item.brandSlug)))
  const brandsCache: Record<string, number> = {}

  for (const slug of uniqueBrandSlugs) {
    const brandRes = await payload.find({
      collection: 'brands',
      where: { slug: { equals: slug } },
    })

    if (brandRes.docs.length > 0 && brandRes.docs[0].id) {
      brandsCache[slug] = brandRes.docs[0].id as number
    } else {
      console.error(`❌ Бренд '${slug}' не найден — сначала запусти seed-brands.ts`)
      process.exit(1)
    }
  }

  for (const item of itemsData) {
    const existing = await payload.find({
      collection: 'gpus',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      const { brandSlug, ...restData } = item
      await payload.create({
        collection: 'gpus',
        data: { ...restData, brand: brandsCache[brandSlug] },
      })
      console.log(`✅ Добавлено: ${item.name}`)
    } else {
      console.log(`⏭️ Уже существует: ${item.name}`)
    }
  }

  process.exit(0)
}

seedCollection()

import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const itemsData = [
  {
    name: 'Noctua NH-D15',
    brandName: 'Noctua',
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 250,
    height_mm: 165,
    price: 11500,
    stock_quantity: 10,
    description:
      'Легендарный двухбашенный суперкулер с непревзойденной тишиной и эффективностью, сравняющейся с СЖО.',
  },
  {
    name: 'Deepcool AK400 ZERO DARK',
    brandName: 'Deepcool',
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 220,
    height_mm: 155,
    price: 3500,
    stock_quantity: 35,
    description:
      'Народный башенный кулер в полностью черном исполнении, отлично справляется с процессорами среднего сегмента.',
  },
  {
    name: 'be quiet! Dark Rock Pro 4',
    brandName: 'be quiet!',
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 250,
    height_mm: 163,
    price: 9500,
    stock_quantity: 15,
    description:
      'Массивный и практически бесшумный кулер для охлаждения мощных многоядерных процессоров.',
  },
  {
    name: 'NZXT Kraken 240',
    brandName: 'NZXT',
    supports_lga1700: true,
    supports_am4: true,
    supports_am5: true,
    max_tdp: 280,
    height_mm: 53, // Высота помпы, радиатор крепится к корпусу
    price: 14500,
    stock_quantity: 12,
    description:
      'Надежная система жидкостного охлаждения с 240-мм радиатором и встроенным LCD-дисплеем на помпе.',
  },
  {
    name: 'Deepcool GAMMAXX 300',
    brandName: 'Deepcool',
    supports_lga1700: false, // Старая модель, нет креплений в комплекте
    supports_am4: true,
    supports_am5: false,
    max_tdp: 130,
    height_mm: 136,
    price: 1500,
    stock_quantity: 50,
    description:
      'Супербюджетное решение для замены боксовых кулеров на старых или негорячих процессорах.',
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
            brand: brandsCache[brandName],
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

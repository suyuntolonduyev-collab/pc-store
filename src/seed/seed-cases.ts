import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const itemsData = [
  {
    name: 'Lian Li O11 Dynamic EVO Black',
    brandName: 'Lian Li',
    supports_atx: true,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 422,
    max_cooler_height_mm: 167,
    price: 15500,
    stock_quantity: 12,
    description:
      'Легендарный корпус-аквариум с панорамным остеклением и огромными возможностями для кастомного охлаждения.',
  },
  {
    name: 'Fractal Design Meshify 2 Compact',
    brandName: 'Fractal Design',
    supports_atx: true,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 341,
    max_cooler_height_mm: 169,
    price: 12000,
    stock_quantity: 8,
    description:
      'Компактный ATX корпус с отличной продуваемостью благодаря сетчатой передней панели и фирменному дизайну.',
  },
  {
    name: 'NZXT H5 Flow Black',
    brandName: 'NZXT',
    supports_atx: true,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 365,
    max_cooler_height_mm: 165,
    price: 8500,
    stock_quantity: 20,
    description:
      'Популярный корпус с минималистичным дизайном, перфорированной панелью и специальным вентилятором для обдува видеокарты.',
  },
  {
    name: 'Deepcool CH370 Black',
    brandName: 'Deepcool',
    supports_atx: false, // Только для Micro-ATX и Mini-ITX
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 320,
    max_cooler_height_mm: 165,
    price: 5200,
    stock_quantity: 35,
    description:
      'Бюджетный и стильный Micro-ATX корпус с хорошей вентиляцией и встроенным держателем для видеокарты.',
  },
  {
    name: 'Fractal Design Terra Jade',
    brandName: 'Fractal Design',
    supports_atx: false,
    supports_matx: false,
    supports_itx: true, // Только Mini-ITX
    max_gpu_length_mm: 322,
    max_cooler_height_mm: 48, // Очень жесткое ограничение для кулера
    price: 18500,
    stock_quantity: 5,
    description:
      'Премиальный и очень компактный Mini-ITX корпус с элементами из массива орехового дерева для эстетичных сборок.',
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
      collection: 'cases',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      const { brandName, ...restData } = item
      try {
        await payload.create({
          collection: 'cases',
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

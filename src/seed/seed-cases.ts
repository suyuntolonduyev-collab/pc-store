import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type CaseItem = {
  name: string
  brandName: string
  price: number
  stock_quantity: number
  supports_atx: boolean
  supports_matx: boolean
  supports_itx: boolean
  max_gpu_length_mm: number
  max_cooler_height_mm: number
  description: string
}

const itemsData: CaseItem[] = [
  // === Premium Full/Mid Tower (Для мощных систем) ===
  {
    name: 'ASUS ROG Strix Helios GX601',
    brandName: 'ASUS',
    price: 32000,
    stock_quantity: 5,
    supports_atx: true,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 450,
    max_cooler_height_mm: 190,
    description:
      'Премиальный корпус с тремя панелями из закаленного стекла, алюминиевой рамой и встроенной RGB-подсветкой. Идеален для флагманских сборок ROG.',
  },
  {
    name: 'Lian Li O11 Dynamic EVO Black',
    brandName: 'Lian Li',
    price: 18500,
    stock_quantity: 12,
    supports_atx: true,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 422,
    max_cooler_height_mm: 167,
    description:
      'Культовый корпус-аквариум. Двухкамерный дизайн позволяет скрыть блок питания и кабели, выставляя комплектующие на показ.',
  },
  {
    name: 'Fractal Design North Charcoal Black',
    brandName: 'Fractal Design',
    price: 17200,
    stock_quantity: 8,
    supports_atx: true,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 355,
    max_cooler_height_mm: 170,
    description:
      'Уникальный дизайн с передней панелью из настоящего дуба. Сочетает в себе эстетику интерьерной мебели и отличную продуваемость.',
  },
  {
    name: 'NZXT H9 Flow White',
    brandName: 'NZXT',
    price: 19800,
    stock_quantity: 7,
    supports_atx: true,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 435,
    max_cooler_height_mm: 165,
    description:
      'Панорамный корпус с бесшовным стеклом. Оснащен перфорированной верхней панелью для максимального охлаждения мощных CPU.',
  },

  // === Mainstream (Оптимальный выбор) ===
  {
    name: 'Corsair 4000D Airflow Black',
    brandName: 'Corsair',
    price: 11500,
    stock_quantity: 20,
    supports_atx: true,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 360,
    max_cooler_height_mm: 170,
    description:
      'Один из лучших корпусов по соотношению цена/охлаждение. Минималистичный вид и продуманный кабель-менеджмент RapidRoute.',
  },
  {
    name: 'be quiet! Pure Base 500DX Black',
    brandName: 'be quiet!',
    price: 12800,
    stock_quantity: 15,
    supports_atx: true,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 369,
    max_cooler_height_mm: 190,
    description:
      'Тихий и отлично продуваемый корпус с ARGB подсветкой и тремя предустановленными вентиляторами Pure Wings 2.',
  },
  {
    name: 'Deepcool CK560 WH',
    brandName: 'Deepcool',
    price: 8900,
    stock_quantity: 25,
    supports_atx: true,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 380,
    max_cooler_height_mm: 175,
    description:
      'Белоснежный корпус с сетчатой передней панелью и четырьмя ARGB вентиляторами в комплекте.',
  },

  // === Micro-ATX (Компактные игровые) ===
  {
    name: 'MSI MAG FORGE M100R',
    brandName: 'MSI',
    price: 6200,
    stock_quantity: 30,
    supports_atx: false,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 300,
    max_cooler_height_mm: 160,
    description:
      'Компактный и доступный mATX корпус. Отличный выбор для сборок на базе RTX 4060 или RX 7600.',
  },
  {
    name: 'Deepcool CH370 Black',
    brandName: 'Deepcool',
    price: 5400,
    stock_quantity: 40,
    supports_atx: false,
    supports_matx: true,
    supports_itx: true,
    max_gpu_length_mm: 320,
    max_cooler_height_mm: 165,
    description:
      'Строгий дизайн, встроенный держатель для видеокарты и выдвижной крючок для наушников.',
  },

  // === ITX / SFF (Ультракомпактные) ===
  {
    name: 'Fractal Design Terra Jade',
    brandName: 'Fractal Design',
    price: 19500,
    stock_quantity: 4,
    supports_atx: false,
    supports_matx: false,
    supports_itx: true,
    max_gpu_length_mm: 322,
    max_cooler_height_mm: 77, // Критично мало для кулера!
    description:
      'Шедевр индустриального дизайна. Корпус объемом всего 10.4 литра из анодированного алюминия и массива ореха.',
  },
  {
    name: 'Lian Li A4-H2O Black',
    brandName: 'Lian Li',
    price: 15800,
    stock_quantity: 6,
    supports_atx: false,
    supports_matx: false,
    supports_itx: true,
    max_gpu_length_mm: 322,
    max_cooler_height_mm: 55,
    description:
      'Разработан совместно с DAN Cases. Поддерживает установку 240-мм СЖО, несмотря на крошечный объем.',
  },
  {
    name: 'Cooler Master MasterBox NR200P White',
    brandName: 'Cooler Master',
    price: 9200,
    stock_quantity: 18,
    supports_atx: false,
    supports_matx: false,
    supports_itx: true,
    max_gpu_length_mm: 330,
    max_cooler_height_mm: 155,
    description:
      'Самый популярный ITX корпус. Позволяет установить видеокарту вертикально и поддерживает массивные системы охлаждения.',
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  console.log('⏳ Поиск ID брендов для корпусов...')
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

  console.log(`🚀 Начинаем сидирование 'cases' (${itemsData.length} моделей)...`)

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
            brand: (brandsCache[brandName] || 1) as any,
          },
        })
        console.log(`✅ [Case] ${item.name} добавлен (Max GPU: ${item.max_gpu_length_mm}mm)`)
      } catch (err) {
        console.error(`❌ Ошибка при создании корпуса ${item.name}:`, err)
      }
    } else {
      console.log(`⏭️ Корпус ${item.name} уже существует.`)
    }
  }

  console.log('✨ Сидирование корпусов успешно завершено!')
  process.exit(0)
}

seedCollection()

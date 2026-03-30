import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const storageData = [
  {
    name: 'Samsung 990 Pro 2TB',
    brandSlug: 'samsung',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 2000,
    price: 18500,
    stock_quantity: 15,
    description:
      'Один из самых быстрых накопителей на рынке с интерфейсом PCIe 4.0. Идеально подходит для работы с видео и тяжелых игр.',
  },
  {
    name: 'WD Blue SN580 1TB',
    brandSlug: 'wd',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 1000,
    price: 8400,
    stock_quantity: 25,
    description:
      'Надежный и энергоэффективный NVMe накопитель для повседневных задач и гейминга среднего уровня.',
  },
  {
    name: 'Kingston KC3000 2048GB',
    brandSlug: 'kingston',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 2048,
    price: 16200,
    stock_quantity: 12,
    description:
      'Высокопроизводительный SSD с отличным ресурсом перезаписи (TBW) и эффективным графеновым радиатором.',
  },
  {
    name: 'Crucial MX500 1TB',
    brandSlug: 'crucial',
    type: 'SATA SSD',
    interface: 'SATA',
    capacity_gb: 1000,
    price: 7800,
    stock_quantity: 30,
    description:
      'Классический 2.5-дюймовый SSD. Отличный вариант для апгрейда старых систем или как дополнительное хранилище.',
  },
  {
    name: 'Seagate IronWolf 4TB',
    brandSlug: 'seagate',
    type: 'HDD',
    interface: 'SATA',
    capacity_gb: 4000,
    price: 12500,
    stock_quantity: 10,
    description:
      'Специализированный жесткий диск для сетевых хранилищ (NAS) и систем, требующих высокой надежности хранения данных.',
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  // 1. Сбор уникальных брендов для кэширования ID
  const uniqueBrandSlugs = Array.from(new Set(storageData.map((item) => item.brandSlug)))
  const brandsCache: Record<string, string> = {}

  for (const slug of uniqueBrandSlugs) {
    const brandRes = await payload.find({
      collection: 'brands',
      where: { slug: { equals: slug } },
    })

    if (brandRes.docs.length > 0 && brandRes.docs[0].id) {
      brandsCache[slug] = brandRes.docs[0].id as string
    } else {
      throw new Error(`Бренд со slug '${slug}' не найден — сначала запустите seed-brands.ts`)
    }
  }

  // 2. Создание записей в коллекции 'storage'
  for (const item of storageData) {
    const { brandSlug, ...restData } = item
    const brandId = brandsCache[brandSlug]

    const existing = await payload.find({
      collection: 'storage',
      where: { name: { equals: restData.name } },
    })

    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'storage',
        data: {
          ...restData,
          brand: brandId,
        },
      })
      console.log(`✅ Добавлено: ${restData.name}`)
    } else {
      console.log(`⏭️ Уже существует: ${restData.name}`)
    }
  }

  process.exit(0)
}

seedCollection()

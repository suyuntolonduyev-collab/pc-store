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
  {
    name: 'Samsung 990 PRO 2TB',
    brandName: 'Samsung',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 2000,
    price: 18500,
    stock_quantity: 15,
    description:
      'Флагманский PCIe 4.0 NVMe накопитель с максимальными скоростями чтения и записи для геймеров и профессионалов.',
  },
  {
    name: 'Kingston NV2 1TB',
    brandName: 'Kingston',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 1000,
    price: 5800,
    stock_quantity: 40,
    description:
      'Один из самых популярных и доступных NVMe накопителей базового уровня для повседневных задач.',
  },
  {
    name: 'WD Blue SN580 500GB',
    brandName: 'WD',
    type: 'NVMe',
    interface: 'M.2',
    capacity_gb: 500,
    price: 4200,
    stock_quantity: 25,
    description:
      'Надежный накопитель от Western Digital для установки операционной системы и основных программ.',
  },
  {
    name: 'Crucial MX500 1TB',
    brandName: 'Crucial',
    type: 'SATA SSD',
    interface: 'SATA',
    capacity_gb: 1000,
    price: 6500,
    stock_quantity: 20,
    description:
      'Проверенный временем SATA SSD с DRAM-буфером, отличный выбор для апгрейда старых ПК.',
  },
  {
    name: 'Seagate BarraCuda 2TB',
    brandName: 'Seagate',
    type: 'HDD',
    interface: 'SATA',
    capacity_gb: 2000,
    price: 5500,
    stock_quantity: 30,
    description:
      'Классический жесткий диск на 7200 об/мин для хранения медиафайлов и больших объемов данных.',
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
            // Обходим TS-ошибку через as any. В БД корректно улетит числовой ID.
            brand: Number(brandsCache[brandName]) as any,
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

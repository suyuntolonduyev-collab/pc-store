import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type PsuItem = {
  name: string
  brandName: string
  wattage: number
  form_factor: 'ATX' | 'SFX' | 'SFX-L'
  pcie_connectors: number
  has_16pin_connector: boolean
  price: number
  stock_quantity: number
  description: string
}

const itemsData: PsuItem[] = [
  {
    name: 'be quiet! Dark Power 13 1000W',
    brandName: 'be quiet!',
    wattage: 1000,
    form_factor: 'ATX',
    pcie_connectors: 4,
    has_16pin_connector: true,
    price: 24000,
    stock_quantity: 8,
    description:
      'Топовый блок питания стандарта ATX 3.0 с нативной поддержкой разъема 12VHPWR для видеокарт нового поколения.',
  },
  {
    name: 'Seasonic Focus GX-850',
    brandName: 'Seasonic',
    wattage: 850,
    form_factor: 'ATX',
    pcie_connectors: 3,
    has_16pin_connector: false,
    price: 13500,
    stock_quantity: 15,
    description:
      'Надежный блок питания с золотым сертификатом эффективности и полностью модульной системой кабелей.',
  },
  {
    name: 'MSI MPG A850G PCIE5',
    brandName: 'MSI',
    wattage: 850,
    form_factor: 'ATX',
    pcie_connectors: 3,
    has_16pin_connector: true,
    price: 14500,
    stock_quantity: 20,
    description:
      'Современный блок питания с сертификатом 80 PLUS Gold и поддержкой стандарта PCIe 5.0.',
  },
  {
    name: 'Corsair SF750 Platinum',
    brandName: 'Corsair',
    wattage: 750,
    form_factor: 'SFX',
    pcie_connectors: 2,
    has_16pin_connector: false,
    price: 16000,
    stock_quantity: 12,
    description:
      'Один из лучших SFX блоков питания для компактных Mini-ITX сборок, бесшумный и мощный.',
  },
  {
    name: 'Deepcool PK650D',
    brandName: 'Deepcool',
    wattage: 650,
    form_factor: 'ATX',
    pcie_connectors: 2,
    has_16pin_connector: false,
    price: 5500,
    stock_quantity: 30,
    description:
      'Доступный и надежный блок питания с бронзовым сертификатом, отличный выбор для среднебюджетных сборок.',
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
      collection: 'psus',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      const { brandName, ...restData } = item
      try {
        await payload.create({
          collection: 'psus',
          data: {
            ...restData,
            brand: Number(brandsCache[brandName]),
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

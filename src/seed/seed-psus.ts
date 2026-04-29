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
  // === ATX High-End (ATX 3.0 / PCIe 5.0) ===
  {
    name: 'be quiet! Dark Power 13 1000W',
    brandName: 'be quiet!',
    wattage: 1000,
    form_factor: 'ATX',
    pcie_connectors: 4,
    has_16pin_connector: true,
    price: 26500,
    stock_quantity: 5,
    description:
      'Флагманский БП с сертификатом 80 PLUS Titanium. Бесшумный вентилятор Silent Wings и полная поддержка ATX 3.0 для топовых карт NVIDIA.',
  },
  {
    name: 'ASUS ROG Thor 1200P2 Gaming',
    brandName: 'ASUS',
    wattage: 1200,
    form_factor: 'ATX',
    pcie_connectors: 6,
    has_16pin_connector: true,
    price: 38000,
    stock_quantity: 3,
    description:
      'Платиновый блок питания с OLED-дисплеем, отображающим энергопотребление в реальном времени. Идеален для экстремальных сборок.',
  },
  {
    name: 'MSI MPG A850G PCIE5',
    brandName: 'MSI',
    wattage: 850,
    form_factor: 'ATX',
    pcie_connectors: 3,
    has_16pin_connector: true,
    price: 15200,
    stock_quantity: 12,
    description:
      'Современный стандарт для геймерских ПК. Нативный кабель 12VHPWR в комплекте избавит от лишних переходников.',
  },

  // === ATX Mid-Range & Classic ===
  {
    name: 'Seasonic Focus GX-850 White Edition',
    brandName: 'Seasonic',
    wattage: 850,
    form_factor: 'ATX',
    pcie_connectors: 3,
    has_16pin_connector: false,
    price: 14800,
    stock_quantity: 10,
    description:
      'Эталон надежности в белом исполнении. 10 лет гарантии и японские конденсаторы высокого качества.',
  },
  {
    name: 'Deepcool DQ850-M-V2L Black',
    brandName: 'Deepcool',
    wattage: 850,
    form_factor: 'ATX',
    pcie_connectors: 4,
    has_16pin_connector: false,
    price: 11500,
    stock_quantity: 20,
    description:
      'Полностью модульный блок питания с золотым сертификатом. Лучшее соотношение цены и характеристик.',
  },
  {
    name: 'Corsair RM750x (2021)',
    brandName: 'Corsair',
    wattage: 750,
    form_factor: 'ATX',
    pcie_connectors: 2,
    has_16pin_connector: false,
    price: 13200,
    stock_quantity: 15,
    description:
      'Один из самых тихих блоков питания в своем классе благодаря магнитной левитации вентилятора.',
  },

  // === Compact (SFX / SFX-L) ===
  {
    name: 'Corsair SF750 Platinum',
    brandName: 'Corsair',
    wattage: 750,
    form_factor: 'SFX',
    pcie_connectors: 2,
    has_16pin_connector: false,
    price: 17500,
    stock_quantity: 8,
    description:
      'Легендарный SFX-блок. Несмотря на малые размеры, тянет мощные системы и работает предельно тихо.',
  },
  {
    name: 'Cooler Master V850 SFX Gold',
    brandName: 'Cooler Master',
    wattage: 850,
    form_factor: 'SFX',
    pcie_connectors: 2,
    has_16pin_connector: false,
    price: 16400,
    stock_quantity: 6,
    description:
      'Высокая плотность мощности для компактных корпусов Mini-ITX. В комплекте идет рамка-адаптер на ATX.',
  },
  {
    name: 'SilverStone SX1000 Platinum',
    brandName: 'SilverStone',
    wattage: 1000,
    form_factor: 'SFX-L',
    pcie_connectors: 4,
    has_16pin_connector: false,
    price: 24000,
    stock_quantity: 4,
    description:
      'Первый в мире SFX-L блок мощностью 1000 Вт. Для тех, кто собирает ультимативный ПК в маленьком корпусе.',
  },

  // === Budget ATX ===
  {
    name: 'be quiet! System Power 10 550W',
    brandName: 'be quiet!',
    wattage: 550,
    form_factor: 'ATX',
    pcie_connectors: 2,
    has_16pin_connector: false,
    price: 6200,
    stock_quantity: 35,
    description:
      'Надежное немецкое качество для бюджетных систем. Сертификат 80 PLUS Bronze и тихая работа.',
  },
  {
    name: 'Deepcool PK650D',
    brandName: 'Deepcool',
    wattage: 650,
    form_factor: 'ATX',
    pcie_connectors: 2,
    has_16pin_connector: false,
    price: 5400,
    stock_quantity: 45,
    description:
      'Бронзовый блок питания для игровых систем начального уровня. Надежная схемотехника и плоские кабели.',
  },
  {
    name: 'Chieftec Polaris 850W PPS-850FC',
    brandName: 'Gigabyte', // Используем Gigabyte или MSI если Chieftec нет в брендах, но по смыслу лучше Chieftec
    wattage: 850,
    form_factor: 'ATX',
    pcie_connectors: 4,
    has_16pin_connector: false,
    price: 10800,
    stock_quantity: 25,
    description:
      'Золотой стандарт от Chieftec. Полностью модульный и очень надежный вариант для мощного ПК.',
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  console.log('⏳ Сопоставление брендов для БП...')
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
      console.warn(
        `⚠️ Предупреждение: Бренд '${name}' не найден. Проверьте seed-brands.ts. Используем заглушку.`,
      )
    }
  }

  console.log(`🚀 Наполнение 'psus' (${itemsData.length} позиций)...`)

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
            brand: (brandsCache[brandName] || 1) as any, // 1 как fallback ID
          },
        })
        console.log(`✅ [PSU] ${item.name} (${item.wattage}W, ${item.form_factor})`)
      } catch (err) {
        console.error(`❌ Ошибка сида ${item.name}:`, err)
      }
    } else {
      console.log(`⏭️ Пропуск: ${item.name}`)
    }
  }

  console.log('✨ Сидирование блоков питания завершено.')
  process.exit(0)
}

seedCollection()

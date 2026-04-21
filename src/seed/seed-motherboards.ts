import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type MotherboardItem = {
  name: string
  brandName: string
  socket: 'LGA1700' | 'LGA1200' | 'AM4' | 'AM5' | 'TR4'
  form_factor: 'ATX' | 'Micro-ATX' | 'Mini-ITX'
  supports_ddr4: boolean
  supports_ddr5: boolean
  ram_slots: number
  m2_slots: number
  sata_ports: number
  price: number
  stock_quantity: number
  description: string
}

const itemsData: MotherboardItem[] = [
  {
    name: 'MSI MAG Z790 TOMAHAWK WIFI',
    brandName: 'MSI',
    socket: 'LGA1700',
    form_factor: 'ATX',
    supports_ddr4: false,
    supports_ddr5: true,
    ram_slots: 4,
    m2_slots: 4,
    sata_ports: 7,
    price: 28500,
    stock_quantity: 10,
    description:
      'Надежная плата для топовых процессоров Intel с мощной подсистемой питания и поддержкой высокоскоростной DDR5 памяти.',
  },
  {
    name: 'Gigabyte B650 AORUS ELITE AX',
    brandName: 'Gigabyte',
    socket: 'AM5',
    form_factor: 'ATX',
    supports_ddr4: false,
    supports_ddr5: true,
    ram_slots: 4,
    m2_slots: 3,
    sata_ports: 4,
    price: 23000,
    stock_quantity: 14,
    description:
      'Оптимальная основа для современных сборок на базе процессоров AMD Ryzen 7000-й серии.',
  },
  {
    name: 'ASUS PRIME B660M-K D4',
    brandName: 'ASUS',
    socket: 'LGA1700',
    form_factor: 'Micro-ATX',
    supports_ddr4: true,
    supports_ddr5: false,
    ram_slots: 2,
    m2_slots: 2,
    sata_ports: 4,
    price: 9500,
    stock_quantity: 25,
    description:
      'Бюджетная материнская плата для процессоров Intel 12-го и 13-го поколений под память DDR4.',
  },
  {
    name: 'MSI B550M PRO-VDH WIFI',
    brandName: 'MSI',
    socket: 'AM4',
    form_factor: 'Micro-ATX',
    supports_ddr4: true,
    supports_ddr5: false,
    ram_slots: 4,
    m2_slots: 2,
    sata_ports: 4,
    price: 11000,
    stock_quantity: 20,
    description:
      'Отличное недорогое решение для сборок на проверенной платформе AM4 с наличием Wi-Fi модуля.',
  },
  {
    name: 'ASRock B650I Lightning WiFi',
    brandName: 'ASRock',
    socket: 'AM5',
    form_factor: 'Mini-ITX',
    supports_ddr4: false,
    supports_ddr5: true,
    ram_slots: 2,
    m2_slots: 2,
    sata_ports: 2,
    price: 21500,
    stock_quantity: 8,
    description:
      'Компактная материнская плата формата Mini-ITX для сборки мощных, но небольших ПК.',
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
      collection: 'motherboards',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      const { brandName, ...restData } = item
      try {
        await payload.create({
          collection: 'motherboards',
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

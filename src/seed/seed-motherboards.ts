import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type MotherboardItem = {
  name: string
  brandName: string
  socket: string
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
  // === AM5 (AMD Ryzen 7000/8000) ===
  {
    name: 'ASUS ROG CROSSHAIR X670E HERO',
    brandName: 'ASUS',
    socket: 'AM5',
    form_factor: 'ATX',
    supports_ddr4: false,
    supports_ddr5: true,
    ram_slots: 4,
    m2_slots: 5,
    sata_ports: 6,
    price: 65000,
    stock_quantity: 3,
    description:
      'Ультимативная плата для энтузиастов. Поддержка PCIe 5.0, мощнейшая подсистема питания 18+2 фазы и встроенный USB4.',
  },
  {
    name: 'MSI MAG B650 TOMAHAWK WIFI',
    brandName: 'MSI',
    socket: 'AM5',
    form_factor: 'ATX',
    supports_ddr4: false,
    supports_ddr5: true,
    ram_slots: 4,
    m2_slots: 3,
    sata_ports: 6,
    price: 24500,
    stock_quantity: 15,
    description:
      'Лучшее решение в среднем сегменте. Отличное охлаждение VRM и полный набор современных интерфейсов для Ryzen 7000.',
  },
  {
    name: 'Gigabyte B650M DS3H',
    brandName: 'Gigabyte',
    socket: 'AM5',
    form_factor: 'Micro-ATX',
    supports_ddr4: false,
    supports_ddr5: true,
    ram_slots: 4,
    m2_slots: 2,
    sata_ports: 4,
    price: 15500,
    stock_quantity: 20,
    description:
      'Надежная и доступная плата для перехода на платформу AM5. Идеально подходит для Ryzen 5 7600.',
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
    price: 21000,
    stock_quantity: 5,
    description:
      'Компактный монстр для SFF-сборок. Несмотря на размер, легко справляется с топовыми процессорами AMD.',
  },

  // === LGA1700 (Intel 12/13/14 Gen) ===
  {
    name: 'ASUS TUF GAMING Z790-PLUS WIFI',
    brandName: 'ASUS',
    socket: 'LGA1700',
    form_factor: 'ATX',
    supports_ddr4: false,
    supports_ddr5: true,
    ram_slots: 4,
    m2_slots: 4,
    sata_ports: 4,
    price: 32000,
    stock_quantity: 10,
    description:
      'Стильная и выносливая плата на Z790 чипсете. Поддерживает разгон процессоров Intel K-серии и быструю память DDR5.',
  },
  {
    name: 'Gigabyte Z790 AORUS ELITE AX',
    brandName: 'Gigabyte',
    socket: 'LGA1700',
    form_factor: 'ATX',
    supports_ddr4: false,
    supports_ddr5: true,
    ram_slots: 4,
    m2_slots: 4,
    sata_ports: 6,
    price: 29500,
    stock_quantity: 12,
    description:
      'Премиальный дизайн и продвинутые сетевые возможности. Отличный выбор для Core i7-14700K.',
  },
  {
    name: 'MSI PRO B760M-P DDR4',
    brandName: 'MSI',
    socket: 'LGA1700',
    form_factor: 'Micro-ATX',
    supports_ddr4: true,
    supports_ddr5: false,
    ram_slots: 4,
    m2_slots: 2,
    sata_ports: 4,
    price: 11500,
    stock_quantity: 25,
    description:
      'Оптимальный выбор для бюджетных игровых ПК на Intel с использованием доступной памяти DDR4.',
  },
  {
    name: 'ASUS PRIME H610M-K D4',
    brandName: 'ASUS',
    socket: 'LGA1700',
    form_factor: 'Micro-ATX',
    supports_ddr4: true,
    supports_ddr5: false,
    ram_slots: 2,
    m2_slots: 1,
    sata_ports: 4,
    price: 7800,
    stock_quantity: 40,
    description:
      'Базовая материнская плата для офисных решений или ультрабюджетных игровых систем на базе Core i3.',
  },

  // === AM4 (AMD Ryzen 3000/5000) ===
  {
    name: 'MSI MAG B550 TOMAHAWK',
    brandName: 'MSI',
    socket: 'AM4',
    form_factor: 'ATX',
    supports_ddr4: true,
    supports_ddr5: false,
    ram_slots: 4,
    m2_slots: 2,
    sata_ports: 6,
    price: 16800,
    stock_quantity: 18,
    description:
      'Бестселлер для платформы AM4. Мощный VRM позволяет без проблем использовать Ryzen 9 5950X или 5800X3D.',
  },
  {
    name: 'Gigabyte B450M DS3H V2',
    brandName: 'Gigabyte',
    socket: 'AM4',
    form_factor: 'Micro-ATX',
    supports_ddr4: true,
    supports_ddr5: false,
    ram_slots: 4,
    m2_slots: 1,
    sata_ports: 4,
    price: 7200,
    stock_quantity: 50,
    description:
      'Народная плата для бюджетного гейминга. Поддерживает всю линейку Ryzen 5000 после обновления BIOS.',
  },
  {
    name: 'ASUS ROG STRIX B550-I GAMING',
    brandName: 'ASUS',
    socket: 'AM4',
    form_factor: 'Mini-ITX',
    supports_ddr4: true,
    supports_ddr5: false,
    ram_slots: 2,
    m2_slots: 2,
    sata_ports: 4,
    price: 19500,
    stock_quantity: 4,
    description:
      'Премиальная ITX-плата с отличным звуком и поддержкой PCIe 4.0 для компактных игровых станций.',
  },

  // === LGA1200 (Legacy/Budget Intel 10/11 Gen) ===
  {
    name: 'MSI H510M-A PRO',
    brandName: 'MSI',
    socket: 'LGA1200',
    form_factor: 'Micro-ATX',
    supports_ddr4: true,
    supports_ddr5: false,
    ram_slots: 2,
    m2_slots: 1,
    sata_ports: 4,
    price: 6500,
    stock_quantity: 30,
    description:
      'Проверенное временем решение для стабильной работы систем на базе Intel 10-го и 11-го поколений.',
  },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  console.log('⏳ Кеширование брендов...')
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
      console.error(`❌ Ошибка: Бренд '${name}' не найден. Сначала запусти seed-brands.ts.`)
      process.exit(1)
    }
  }

  console.log(`🚀 Сидирование 'motherboards' (${itemsData.length} шт.)...`)

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
            brand: brandsCache[brandName] as any,
          },
        })
        console.log(`✅ Добавлено: ${item.name} | ${item.socket} | ${item.form_factor}`)
      } catch (err) {
        console.error(`❌ Ошибка создания ${item.name}:`, err)
      }
    } else {
      console.log(`⏭️ Пропуск: ${item.name} (уже есть)`)
    }
  }

  console.log('✨ Сидирование материнских плат завершено!')
  process.exit(0)
}

seedCollection()

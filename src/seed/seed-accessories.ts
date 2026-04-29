import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const itemsData = [
  // === Мониторы ===
  { name: 'Монитор 27" Samsung Odyssey G7 (2K, 240Hz)', price: 48500 },
  { name: 'Монитор 24" LG UltraGear 24GN60R-B (FHD, 144Hz)', price: 17800 },
  { name: 'Монитор 34" MSI Optix MAG342CQR (UWQHD, 144Hz)', price: 38500 },
  { name: 'Монитор 32" ASUS ROG Swift PG32UQX (4K, 144Hz, Mini-LED)', price: 210000 },

  // === Мыши ===
  { name: 'Мышь Logitech G Pro X Superlight 2 Black', price: 15200 },
  { name: 'Мышь Razer DeathAdder V3 Pro Wireless', price: 13500 },
  { name: 'Мышь SteelSeries Rivals 3 Wireless', price: 4800 },
  { name: 'Мышь игровая бюджетная MSI Clutch GM08', price: 1500 },

  // === Клавиатуры ===
  { name: 'Клавиатура Keychron Q1 Pro (Mechanical, Wireless)', price: 18500 },
  { name: 'Клавиатура Logitech G915 TKL (Low Profile, Lightspeed)', price: 19200 },
  { name: 'Клавиатура Razer Huntsman V2 TKL', price: 14500 },
  { name: 'Клавиатура мембранная HyperX Alloy Core RGB', price: 4200 },

  // === Наушники ===
  { name: 'Наушники HyperX Cloud III Wireless Black', price: 14800 },
  { name: 'Наушники SteelSeries Arctis Nova Pro Wireless', price: 32500 },
  { name: 'Наушники Logitech G733 LIGHTSPEED White', price: 12900 },

  // === Коврики и прочее ===
  { name: 'Игровой коврик SteelSeries QcK Heavy (Large)', price: 2800 },
  { name: 'Держатель кабеля мыши (Bungee) Razer Mouse Bungee V3', price: 2200 },

  // === Услуги и ПО ===
  { name: 'Профессиональная сборка ПК и Кабель-менеджмент', price: 3500 },
  { name: 'Лицензия Microsoft Windows 11 Home (Retail)', price: 12500 },
  { name: 'Расширенная гарантия PC-STORE (на 3 года)', price: 8000 },
  { name: 'Сложный разгон CPU и RAM с тестированием стабильности', price: 4500 },
  { name: 'Нанесение топовой термопасты (Thermal Grizzly Kryonaut)', price: 1200 },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  console.log(`🚀 Начинаем сидирование 'accessories' (${itemsData.length} позиций)...`)

  for (const item of itemsData) {
    const existing = await payload.find({
      collection: 'accessories',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      try {
        await payload.create({
          collection: 'accessories',
          data: item,
        })
        console.log(`✅ Добавлено: ${item.name} | Цена: ${item.price}C`)
      } catch (err) {
        console.error(`❌ Ошибка при создании ${item.name}:`, err)
      }
    } else {
      console.log(`⏭️ Аксессуар ${item.name} уже существует.`)
    }
  }

  console.log('✨ Сидирование аксессуаров успешно завершено!')
  process.exit(0)
}

seedCollection()

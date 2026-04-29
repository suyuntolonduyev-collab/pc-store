import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Финальные конфигурации для продакшна.
 * Каждый билд технически выверен по сокетам, TDP и размерам.
 */
const buildsData = [
  {
    name: 'PC-STORE Ultimate Apex (RTX 4090)',
    tags: ['gaming', 'streaming', 'workstation'],
    cpuName: 'Intel Core i9-14900K',
    moboName: 'ASUS TUF GAMING Z790-PLUS WIFI',
    gpuName: 'ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X',
    ramName: 'Kingston FURY Renegade RGB 32GB (2x16GB) DDR5 7200MHz',
    psuName: 'be quiet! Dark Power 13 1000W',
    caseName: 'ASUS ROG Strix Helios GX601',
    coolerName: 'ASUS ROG RYUJIN III 360 ARGB',
    storageName: 'Crucial T705 2TB PCIe Gen5 NVMe',
  },
  {
    name: 'The Gaming King (Ryzen 7 7800X3D)',
    tags: ['gaming'],
    cpuName: 'AMD Ryzen 7 7800X3D',
    moboName: 'MSI MAG B650 TOMAHAWK WIFI',
    gpuName: 'Sapphire NITRO+ AMD Radeon RX 7900 XTX 24GB',
    ramName: 'G.Skill Flare X5 32GB (2x16GB) DDR5 6000MHz CL30',
    psuName: 'MSI MPG A850G PCIE5',
    caseName: 'NZXT H9 Flow White',
    coolerName: 'NZXT Kraken Elite 360 RGB White',
    storageName: 'Samsung 990 PRO 2TB (с радиатором)',
  },
  {
    name: 'Balanced Performance (RTX 4070 Super)',
    tags: ['gaming', 'streaming'],
    cpuName: 'Intel Core i5-13600K',
    moboName: 'Gigabyte Z790 AORUS ELITE AX',
    gpuName: 'Gigabyte GeForce RTX 4070 SUPER GAMING OC 12G',
    ramName: 'Kingston FURY Renegade RGB 32GB (2x16GB) DDR5 7200MHz',
    psuName: 'Deepcool DQ850-M-V2L Black',
    caseName: 'be quiet! Pure Base 500DX Black',
    coolerName: 'be quiet! Dark Rock Pro 5',
    storageName: 'WD_BLACK SN850X 1TB',
  },
  {
    name: 'Scandinavian Stealth (Fractal North)',
    tags: ['workstation', 'gaming'],
    cpuName: 'Intel Core i7-14700K',
    moboName: 'Gigabyte Z790 AORUS ELITE AX',
    gpuName: 'MSI GeForce RTX 4080 SUPER 16G EXPERT',
    ramName: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6400MHz CL32',
    psuName: 'Seasonic Focus GX-850 White Edition',
    caseName: 'Fractal Design North Charcoal Black',
    coolerName: 'Noctua NH-D15 chromax.black',
    storageName: 'Crucial T705 2TB PCIe Gen5 NVMe',
  },
  {
    name: 'Phantom ITX (Small Form Factor)',
    tags: ['gaming', 'compact'],
    cpuName: 'AMD Ryzen 5 7600',
    moboName: 'ASRock B650I Lightning WiFi',
    gpuName: 'ASUS Dual GeForce RTX 4060 Ti OC Edition 8GB',
    ramName: 'G.Skill Flare X5 32GB (2x16GB) DDR5 6000MHz CL30',
    psuName: 'Cooler Master V850 SFX Gold',
    caseName: 'Fractal Design Terra Jade',
    coolerName: 'Noctua NH-L9a-AM5 chromax.black',
    storageName: 'Samsung 980 500GB',
  },
  {
    name: 'Mainstream Pro (RTX 4060 Ti)',
    tags: ['gaming'],
    cpuName: 'Intel Core i5-13400F',
    moboName: 'MSI PRO B760M-P DDR4',
    gpuName: 'ASUS Dual GeForce RTX 4060 Ti OC Edition 8GB',
    ramName: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
    psuName: 'Deepcool PK650D',
    caseName: 'Deepcool CH370 Black',
    coolerName: 'Deepcool AK620 Digital',
    storageName: 'Kingston NV2 1TB',
  },
  {
    name: 'Red Team Value (RX 7800 XT)',
    tags: ['gaming'],
    cpuName: 'AMD Ryzen 7 5700X',
    moboName: 'MSI MAG B550 TOMAHAWK',
    gpuName: 'Gigabyte Radeon RX 7800 XT GAMING OC 16G',
    ramName: 'Kingston FURY Renegade 32GB (2x16GB) DDR4 3600MHz CL16',
    psuName: 'Chieftec Polaris 850W PPS-850FC',
    caseName: 'Corsair 4000D Airflow Black',
    coolerName: 'Deepcool AG400 BK ARGB',
    storageName: 'WD Blue 4TB 5400rpm',
  },
  {
    name: 'E-Sports Entry (RTX 4060)',
    tags: ['gaming', 'budget'],
    cpuName: 'Intel Core i3-12100F',
    moboName: 'ASUS PRIME H610M-K D4',
    gpuName: 'MSI GeForce RTX 4060 VENTUS 2X WHITE 8G OC',
    ramName: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
    psuName: 'be quiet! System Power 10 550W',
    caseName: 'MSI MAG FORGE M100R',
    coolerName: 'Deepcool AG400 BK ARGB',
    storageName: 'Kingston NV2 1TB',
  },
  {
    name: 'AMD Budget Starter (RX 7600)',
    tags: ['gaming', 'budget'],
    cpuName: 'AMD Ryzen 5 5600',
    moboName: 'Gigabyte B450M DS3H V2',
    gpuName: 'ASRock Radeon RX 7600 Challenger 8GB OC',
    ramName: 'G.Skill Ripjaws V 32GB (2x16GB) DDR4 3200MHz CL16',
    psuName: 'Deepcool PK650D',
    caseName: 'Deepcool CH370 Black',
    coolerName: 'ID-COOLING SE-226-XT Black',
    storageName: 'Crucial P3 500GB',
  },
  {
    name: 'Content Creator Mini (64GB RAM)',
    tags: ['workstation', 'compact'],
    cpuName: 'AMD Ryzen 9 7950X3D',
    moboName: 'ASRock B650I Lightning WiFi',
    gpuName: 'MSI GeForce RTX 4080 SUPER 16G EXPERT',
    ramName: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6400MHz CL32',
    psuName: 'SilverStone SX1000 Platinum',
    caseName: 'Cooler Master MasterBox NR200P White',
    coolerName: 'Deepcool LS720 WH',
    storageName: 'Samsung 990 PRO 2TB (с радиатором)',
  },
]

async function seed() {
  const payload = await getPayload({ config: configPromise })
  console.log("🚀 Запуск финального сидирования 'builds'...")

  const adminUser = await payload.find({
    collection: 'users',
    where: { role: { equals: 'admin' } },
    limit: 1,
  })

  if (!adminUser.docs.length) {
    console.error('❌ Ошибка: Админ-пользователь не найден. Сначала запусти seed-users.ts')
    process.exit(1)
  }

  const adminId = adminUser.docs[0].id

  for (const data of buildsData) {
    try {
      const findId = async (collection: string, name: string) => {
        const res = await payload.find({
          collection: collection as any,
          where: { name: { equals: name } },
          limit: 1,
        })
        return res.docs[0]?.id || null
      }

      const buildComponents = {
        user: adminId,
        name: data.name,
        tags: data.tags,
        cpu: await findId('processors', data.cpuName),
        mobo: await findId('motherboards', data.moboName),
        gpu: await findId('gpus', data.gpuName),
        ram: await findId('ram', data.ramName),
        psu: await findId('psus', data.psuName),
        case: await findId('cases', data.caseName),
        cooler: await findId('coolers', data.coolerName),
        storage: await findId('storage', data.storageName),
      }

      const missing = Object.entries(buildComponents).filter(
        ([key, value]) => value === null && key !== 'tags',
      )
      if (missing.length > 0) {
        console.warn(
          `⚠️ Сборка "${data.name}" пропущена. Отсутствуют: ${missing.map((m) => m[0]).join(', ')}`,
        )
        continue
      }

      await payload.create({
        collection: 'builds',
        data: buildComponents as any,
      })
      console.log(`✅ Сборка готова: ${data.name}`)
    } catch (err) {
      console.error(`❌ Ошибка при создании сборки ${data.name}:`, err)
    }
  }

  console.log('✨ Наполнение витрины сборками завершено.')
  process.exit(0)
}

seed()

import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const itemsData = [
  { name: 'Intel', slug: 'intel' },
  { name: 'AMD', slug: 'amd' },
  { name: 'NVIDIA', slug: 'nvidia' },
  { name: 'ASUS', slug: 'asus' },
  { name: 'MSI', slug: 'msi' },
  { name: 'Gigabyte', slug: 'gigabyte' },
  { name: 'ASRock', slug: 'asrock' },
  { name: 'Kingston', slug: 'kingston' },
  { name: 'Corsair', slug: 'corsair' },
  { name: 'G.Skill', slug: 'gskill' },
  { name: 'Crucial', slug: 'crucial' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'WD', slug: 'wd' },
  { name: 'Seagate', slug: 'seagate' },
  { name: 'Seasonic', slug: 'seasonic' },
  { name: 'be quiet!', slug: 'be-quiet' },
  { name: 'Noctua', slug: 'noctua' },
  { name: 'Deepcool', slug: 'deepcool' },
  { name: 'Fractal Design', slug: 'fractal-design' },
  { name: 'Lian Li', slug: 'lian-li' },
  { name: 'NZXT', slug: 'nzxt' },
]

async function seedCollection() {
  const payload = await getPayload({ config: configPromise })

  for (const item of itemsData) {
    const existing = await payload.find({
      collection: 'brands',
      where: { name: { equals: item.name } },
    })

    if (existing.totalDocs === 0) {
      await payload.create({ collection: 'brands', data: item })
      console.log(`✅ Добавлено: ${item.name}`)
    } else {
      console.log(`⏭️ Уже существует: ${item.name}`)
    }
  }

  process.exit(0)
}

seedCollection()

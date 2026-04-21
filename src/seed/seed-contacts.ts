import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const data = {
  phone: '+7 (800) 555-35-35',
  email: 'support@pc-store.ru',
  address: 'г. Москва, ул. Технологий, д. 404, офис 42',
  working_hours: 'Пн-Вс: 10:00 - 21:00 (без выходных)',
  telegram: 'https://t.me/pc_store_official',
  whatsapp: 'https://wa.me/78005553535',
}

async function seed() {
  const payload = await getPayload({ config: configPromise })
  try {
    await payload.updateGlobal({
      slug: 'contacts',
      data: data,
    })
    console.log(`✅ Global 'contacts' успешно обновлен`)
  } catch (err) {
    console.error(`❌ Ошибка при обновлении 'contacts':`, err)
  }
  process.exit(0)
}

seed()

import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const data = {
  title: 'О компании PC-STORE',
  description:
    'Мы — команда энтузиастов, которая делает процесс сборки ПК простым, понятным и безопасным. Наш умный конфигуратор автоматически проверяет физическую и техническую совместимость всех комплектующих.',
  mission:
    'Сделать качественный гейминг и профессиональную работу доступными для каждого, помогая избежать ошибок при выборе компьютерного железа.',
  founded_year: 2024,
  team_size: 15,
}

async function seed() {
  const payload = await getPayload({ config: configPromise })
  try {
    await payload.updateGlobal({
      slug: 'about',
      data: data,
    })
    console.log(`✅ Global 'about' успешно обновлен`)
  } catch (err) {
    console.error(`❌ Ошибка при обновлении 'about':`, err)
  }
  process.exit(0)
}

seed()

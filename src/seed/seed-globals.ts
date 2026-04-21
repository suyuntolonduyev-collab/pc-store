import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const globalsData = {
  about: {
    title: 'О нашем магазине PC-STORE',
    content: 'Мы предоставляем лучшие решения для сборки ПК с 2024 года.',
  },
  contacts: {
    address: 'г. Москва, ул. Технологий, д. 404',
    phone: '+7 (999) 000-00-00',
    email: 'info@pc-store.ru',
    working_hours: 'Пн-Пт: 10:00 - 20:00',
  },
  'featured-product-list': {
    heading: 'Хиты продаж',
    description: 'Самые популярные комплектующие этой недели',
    // Если здесь relationship, нужно передавать массив ID
  },
  feedback: {
    title: 'Отзывы клиентов',
    is_enabled: true,
  },
  instruction: {
    steps: [
      { title: 'Выберите корпус', text: 'Начните с основы вашего будущего ПК.' },
      { title: 'Подберите процессор', text: 'Убедитесь в совместимости с материнской платой.' },
    ],
  },
  'instruction-configurator': {
    helper_text: 'Наш конфигуратор автоматически проверяет совместимость деталей.',
    show_fps_disclaimer: true,
  },
}

async function seedGlobals() {
  const payload = await getPayload({ config: configPromise })

  console.log('🚀 Начинаем обновление Globals...')

  for (const [slug, data] of Object.entries(globalsData)) {
    try {
      await payload.updateGlobal({
        slug: slug as any,
        data: data,
      })
      console.log(`✅ Global '${slug}' обновлен`)
    } catch (err) {
      console.error(`❌ Ошибка обновления Global '${slug}':`, err)
    }
  }

  process.exit(0)
}

seedGlobals()

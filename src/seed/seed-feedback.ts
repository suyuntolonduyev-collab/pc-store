import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type FieldType = 'name' | 'email' | 'message'

const data = {
  is_enabled: true,
  recipient_email: 'feedback@pc-store.ru',
  success_message:
    'Спасибо за ваше сообщение! Наша команда экспертов свяжется с вами в течение 24 часов.',
  fields: [
    { name: 'Ваше имя', type: 'name' as FieldType, required: true },
    { name: 'Email для связи', type: 'email' as FieldType, required: true },
    { name: 'Текст обращения', type: 'message' as FieldType, required: true },
  ],
}

async function seed() {
  const payload = await getPayload({ config: configPromise })
  try {
    await payload.updateGlobal({
      slug: 'feedback',
      data: data,
    })
    console.log(`✅ Global 'feedback' успешно обновлен`)
  } catch (err) {
    console.error(`❌ Ошибка при обновлении 'feedback':`, err)
  }
  process.exit(0)
}

seed()

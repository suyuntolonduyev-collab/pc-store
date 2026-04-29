import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Явно определяем тип, чтобы избежать ошибки несовместимости строк
type UserRole = 'admin' | 'user'

interface UserSeedItem {
  name: string
  email: string
  password: string
  role: UserRole
}

const usersData: UserSeedItem[] = [
  {
    name: 'Admin PC-STORE',
    email: 'admin@pc-store.kg',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Артем Техник',
    email: 'expert@pc-store.kg',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Иван Иванов',
    email: 'customer@gmail.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Мария Сидорова',
    email: 'mariya@mail.ru',
    password: 'password123',
    role: 'user',
  },
]

async function seed() {
  const payload = await getPayload({ config: configPromise })
  console.log("🚀 Сидирование коллекции 'users'...")

  for (const user of usersData) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email } },
    })

    if (existing.totalDocs === 0) {
      try {
        await payload.create({
          collection: 'users',
          data: user, // Теперь типы совпадают
        })
        console.log(`✅ Пользователь создан: ${user.name} (${user.role})`)
      } catch (err) {
        console.error(`❌ Ошибка создания пользователя ${user.email}:`, err)
      }
    } else {
      console.log(`⏭️ Пользователь с email ${user.email} уже существует.`)
    }
  }

  console.log('✨ Сидирование пользователей завершено!')
  process.exit(0)
}

seed()

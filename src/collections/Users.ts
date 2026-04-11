import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  admin: {
    useAsTitle: 'email',
  },
  // 1. Возвращаем auth на правильный уровень
  auth: true, 
  
  access: {
    // Разрешаем регистрацию (создание пользователя) абсолютно всем
    create: () => true,
  }, // <--- 2. ВОТ ЭТУ СКОБКУ МЫ ПОТЕРЯЛИ
  
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user', // 3. Автоматически даем права обычного юзера при регистрации
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'user', value: 'user' },
      ],
    },
  ],
}
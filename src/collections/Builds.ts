// Коллекция Builds — хранит пользовательские сборки ПК (конфигуратор)
// Финальная версия с корректной типизацией и поддержкой admin-доступа

import type { CollectionConfig, PayloadRequest } from 'payload'

const isAdminOrOwner = (req: PayloadRequest) => {
  if (req.user?.role === 'admin') return true

  if (!req.user) return false

  return {
    user: {
      equals: req.user.id,
    },
  }
}

export const Builds: CollectionConfig = {
  slug: 'builds',

  admin: {
    useAsTitle: 'name',
  },

  access: {
    read: ({ req }) => isAdminOrOwner(req),
    update: ({ req }) => isAdminOrOwner(req),
    delete: ({ req }) => isAdminOrOwner(req),

    create: ({ req }) => !!req.user,
  },

  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Пользователь',
    },

    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название сборки',
    },
    {
      name: 'is_complete',
      type: 'checkbox',
      label: 'Сборка завершена',
      defaultValue: false,
    },

    {
      name: 'cpu',
      type: 'relationship',
      relationTo: 'processors',
      label: 'Процессор',
    },
    {
      name: 'mobo',
      type: 'relationship',
      relationTo: 'motherboards',
      label: 'Материнская плата',
    },
    {
      name: 'gpu',
      type: 'relationship',
      relationTo: 'gpus',
      label: 'Видеокарта',
    },
    {
      name: 'ram',
      type: 'relationship',
      relationTo: 'ram',
      label: 'Оперативная память',
    },
    {
      name: 'psu',
      type: 'relationship',
      relationTo: 'psus',
      label: 'Блок питания',
    },
    {
      name: 'case',
      type: 'relationship',
      relationTo: 'cases',
      label: 'Корпус',
    },
    {
      name: 'cooler',
      type: 'relationship',
      relationTo: 'coolers',
      label: 'Охлаждение',
    },
    {
      name: 'storage',
      type: 'relationship',
      relationTo: 'storage',
      label: 'Накопитель',
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Для геймеров', value: 'gaming' },
        { label: 'Бюджетная', value: 'budget' },
        { label: 'Рабочая станция', value: 'workstation' },
      ],
    },
  ],

  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // 🔒 Защита: пользователь всегда проставляется с сервера
        if (req.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
  },
}

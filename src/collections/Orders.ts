// Коллекция Orders — хранит заказы пользователей
// FINAL версия (production-ready + корректный admin flow + оптимизация hooks)

import type { CollectionConfig, PayloadRequest } from 'payload'

/**
 * Доступ:
 * - admin → полный доступ
 * - пользователь → только свои заказы
 */
const adminOrOwnerAccess = (req: PayloadRequest) => {
  if (req.user?.role === 'admin') return true

  if (!req.user) return false

  return {
    user: {
      equals: req.user.id,
    },
  }
}

/**
 * Безопасное извлечение цены
 */
const getPrice = (component: unknown): number => {
  if (typeof component === 'object' && component !== null) {
    const price = (component as { price?: unknown }).price
    if (typeof price === 'number') return price
  }
  return 0
}

export const Orders: CollectionConfig = {
  slug: 'orders',

  admin: {
    useAsTitle: 'id',
  },

  access: {
    read: ({ req }) => adminOrOwnerAccess(req),
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
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
      name: 'build',
      type: 'relationship',
      relationTo: 'builds',
      required: true,
      label: 'Сборка ПК',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Статус заказа',
      options: [
        { label: 'Ожидает оплаты', value: 'pending' },
        { label: 'Оплачен', value: 'paid' },
        { label: 'Отправлен', value: 'shipped' },
        { label: 'Доставлен', value: 'delivered' },
        { label: 'Отменён', value: 'cancelled' },
      ],
    },
    {
      name: 'total_price',
      type: 'number',
      required: true,
      min: 0,
      label: 'Итоговая цена',
    },
  ],

  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        if (!req.user) {
          throw new Error('Неавторизованный пользователь')
        }

        // 🔹 UPDATE: не трогаем бизнес-логику (только admin меняет статус)
        if (operation === 'update') {
          return data
        }

        // 🔹 CREATE: вся основная логика
        if (operation === 'create') {
          if (!data.build) {
            throw new Error('Сборка не указана')
          }

          // 🔒 Проставляем пользователя (если не admin override)
          if (!data.user) {
            data.user = req.user.id
          }

          // 🔧 Нормализация build (object | id)
          const buildId =
            typeof data.build === 'object' && data.build !== null ? data.build.id : data.build

          let build

          try {
            build = await req.payload.findByID({
              collection: 'builds',
              id: buildId,
              depth: 2,
            })
          } catch {
            throw new Error('Ошибка получения сборки')
          }

          if (!build) {
            throw new Error('Сборка не найдена')
          }

          // 🔒 Проверка владельца (с учётом admin)
          const buildUserId =
            typeof build.user === 'object' && build.user !== null ? build.user.id : build.user

          if (req.user.role !== 'admin' && buildUserId !== req.user.id) {
            throw new Error('Нельзя оформить заказ на чужую сборку')
          }

          // ✅ Проверка завершённости
          if (!build.is_complete) {
            throw new Error('Сборка не завершена')
          }

          // 💰 Расчёт цены
          const components: unknown[] = [
            build.cpu,
            build.mobo,
            build.gpu,
            build.ram,
            build.psu,
            build.case,
            build.cooler,
            build.storage,
          ]

          const total = components.reduce((sum, component) => sum + getPrice(component), 0)

          data.total_price = total
        }

        return data
      },
    ],
  },
}

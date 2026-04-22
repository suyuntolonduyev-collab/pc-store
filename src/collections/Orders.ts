import type { CollectionConfig, PayloadRequest } from 'payload'

const adminOrOwnerAccess = (req: PayloadRequest) => {
  if (req.user?.role === 'admin') return true
  if (!req.user) return false
  return { user: { equals: req.user.id } }
}

const getPrice = (component: unknown): number => {
  if (typeof component === 'object' && component !== null) {
    const price = (component as { price?: unknown }).price
    if (typeof price === 'number') return price
  }
  return 0
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: { useAsTitle: 'id' },
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
      name: 'contactName',
      type: 'text',
      required: true,
      label: 'Имя клиента',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Телефон',
    },
    {
      name: 'address',
      type: 'text',
      required: true,
      label: 'Адрес доставки',
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
      name: 'items',
      type: 'array',
      label: 'Позиции заказа',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'build',
          label: 'Тип товара',
          options: [
            { label: 'Сборка ПК', value: 'build' },
            { label: 'Аксессуар', value: 'accessory' },
          ],
        },
        {
          // Заполняется только если type === 'build'
          name: 'build',
          type: 'relationship',
          relationTo: 'builds',
          required: false,
          label: 'Сборка ПК',
        },
        {
          // Заполняется только если type === 'accessory'
          name: 'accessory',
          type: 'relationship',
          relationTo: 'accessories',
          required: false,
          label: 'Аксессуар',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          defaultValue: 1,
          min: 1,
          label: 'Количество',
        },
      ],
    },
    {
      name: 'total_price',
      type: 'number',
      required: true,
      min: 0,
      label: 'Итоговая цена',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        if (!req.user) throw new Error('Неавторизованный пользователь')
        if (operation === 'update') return data

        if (operation === 'create') {
          if (!data.items || data.items.length === 0) {
            throw new Error('Корзина пуста')
          }

          if (!data.user) data.user = req.user.id

          let totalCartPrice = 0

          for (const item of data.items) {
            if (item.type === 'build') {
              // build обязателен для типа 'build'
              if (!item.build) {
                throw new Error('Позиция типа "build" должна содержать сборку')
              }

              const buildId =
                typeof item.build === 'object' && item.build !== null ? item.build.id : item.build

              let build
              try {
                build = await req.payload.findByID({
                  collection: 'builds',
                  id: buildId,
                  depth: 2,
                })
              } catch {
                throw new Error(`Ошибка получения сборки ID: ${buildId}`)
              }

              if (!build) throw new Error('Сборка не найдена')

              const buildUserId =
                typeof build.user === 'object' && build.user !== null ? build.user.id : build.user

              if (req.user.role !== 'admin' && buildUserId !== req.user.id) {
                throw new Error('Нельзя оформить заказ на чужую сборку')
              }

              // if (!build.is_complete) {
              //   throw new Error(`Сборка "${build.name || build.id}" не завершена`)
              // }

              const components: unknown[] = [
                build.cpu,
                build.mobo,
                build.gpu,
                build.ram,
                build.psu,
                build['case'],
                build.cooler,
                build.storage,
              ]

              const buildTotal = components.reduce(
                (sum: number, component) => sum + getPrice(component),
                0,
              )
              totalCartPrice += buildTotal * item.quantity
            } else if (item.type === 'accessory') {
              // accessory обязателен для типа 'accessory'
              if (!item.accessory) {
                throw new Error('Позиция типа "accessory" должна содержать аксессуар')
              }

              const accessoryId =
                typeof item.accessory === 'object' && item.accessory !== null
                  ? item.accessory.id
                  : item.accessory

              let accessory
              try {
                accessory = await req.payload.findByID({
                  collection: 'accessories',
                  id: accessoryId,
                })
              } catch {
                throw new Error(`Ошибка получения аксессуара ID: ${accessoryId}`)
              }

              if (!accessory) throw new Error('Аксессуар не найден')

              totalCartPrice +=
                (typeof accessory.price === 'number' ? accessory.price : 0) * item.quantity
            } else {
              throw new Error(`Неизвестный тип позиции: ${item.type}`)
            }
          }

          data.total_price = totalCartPrice
        }

        return data
      },
    ],
  },
}

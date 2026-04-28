import type { CollectionConfig } from 'payload'

export const Wishlist: CollectionConfig = {
  slug: 'wishlist',
  labels: {
    singular: 'Избранное',
    plural: 'Избранное',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'build', 'accessory', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { user: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { user: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Пользователь',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'build',
      type: 'relationship',
      relationTo: 'builds',
      label: 'Сборка ПК',
      admin: {
        // 🟢 ИСПРАВЛЕНО: добавили data?.
        condition: (data) => !data?.accessory,
      },
    },
    {
      name: 'accessory',
      type: 'relationship',
      relationTo: 'accessories',
      label: 'Аксессуар',
      admin: {
        // 🟢 ИСПРАВЛЕНО: добавили data?.
        condition: (data) => !data?.build,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user && data) {
          data.user = req.user.id
        }
        return data
      },
    ],
    beforeChange: [
      async ({ req, data, operation }) => {
        // 🟢 ИСПРАВЛЕНО: проверяем наличие data
        if (operation === 'create' && data) {
          const existing = await req.payload.find({
            collection: 'wishlist',
            where: {
              and: [
                { user: { equals: data.user } },
                ...(data.build ? [{ build: { equals: data.build } }] : []),
                ...(data.accessory ? [{ accessory: { equals: data.accessory } }] : []),
              ],
            },
          })

          if (existing.totalDocs > 0) {
            throw new Error('Этот товар уже есть в избранном')
          }
        }
        return data
      },
    ],
  },
}

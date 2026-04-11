import type { GlobalConfig } from 'payload'

export const FeaturedProductList: GlobalConfig = {
  slug: 'featured-product-list',
  label: 'Рекомендуемые сборки',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок секции',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Список сборок',
      maxRows: 6,
      fields: [
        {
          name: 'build',
          type: 'relationship',
          relationTo: 'builds',
          label: 'Сборка',
          required: true,
        },
      ],
    },
  ],
}

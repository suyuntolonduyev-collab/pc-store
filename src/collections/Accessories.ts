import type { CollectionConfig } from 'payload'

export const Accessories: CollectionConfig = {
  slug: 'accessories',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    description: 'Сопутствующие товары: мониторы, клавиатуры, мыши, ПО, гарантии.',
  },
  fields: [
    {
      name: 'name',
      label: 'Название товара',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      label: 'Цена',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'image',
      label: 'Изображение товара',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

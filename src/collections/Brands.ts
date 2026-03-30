import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  slug: 'brands',

  labels: {
    singular: 'Бренд',
    plural: 'Бренды',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
  },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

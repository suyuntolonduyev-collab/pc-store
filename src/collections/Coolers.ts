import type { CollectionConfig } from 'payload'

/**
 * Коллекция Систем Охлаждения (Coolers).
 * Содержит данные о сокетах, высоте радиатора и максимальном отводимом тепле (TDP).
 */
export const Coolers: CollectionConfig = {
  slug: 'coolers',
  labels: {
    singular: 'Кулер',
    plural: 'Кулеры',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'max_tdp', 'price', 'stock_quantity'],
  },
  access: {
    read: () => true,
  },
  fields: [
    // --- Общие поля ---
    {
      name: 'name',
      type: 'text',
      label: 'Название',
      required: true,
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      hasMany: false,
      label: 'Бренд',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      label: 'Цена',
      required: true,
      min: 0,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Изображение',
      required: false,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
    },
    {
      name: 'stock_quantity',
      type: 'number',
      label: 'Количество на складе',
      defaultValue: 0,
      required: true,
      min: 0,
    },

    // --- Совместимость с сокетами ---
    {
      type: 'row',
      fields: [
        {
          name: 'supports_lga1700',
          type: 'checkbox',
          label: 'Поддержка LGA1700',
          defaultValue: false,
        },
        {
          name: 'supports_am4',
          type: 'checkbox',
          label: 'Поддержка AM4',
          defaultValue: false,
        },
        {
          name: 'supports_am5',
          type: 'checkbox',
          label: 'Поддержка AM5',
          defaultValue: false,
        },
      ],
    },

    // --- Технические характеристики ---
    {
      type: 'row',
      fields: [
        {
          name: 'max_tdp',
          type: 'number',
          label: 'Макс. TDP (Вт)',
          required: true,
          min: 1,
          admin: {
            description: 'Должно быть выше TDP процессора',
          },
        },
        {
          name: 'height_mm',
          type: 'number',
          label: 'Высота кулера (мм)',
          required: true,
          min: 1,
          admin: {
            description: 'Проверяется на совместимость с шириной корпуса',
          },
        },
      ],
    },
  ],
}

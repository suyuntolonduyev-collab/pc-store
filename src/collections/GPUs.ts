import { CollectionConfig } from 'payload'

export const GPUs: CollectionConfig = {
  // Изменен экспорт на именованный
  slug: 'gpus',
  labels: {
    singular: 'Видеокарта',
    plural: 'Видеокарты',
  },
  admin: {
    useAsTitle: 'name',
    description: 'Видеокарты', // Добавлено описание для админ-панели
  },
  access: {
    read: () => true,
  },
  fields: [
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
      label: 'Изображение',
      relationTo: 'media',
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
      required: true,
      min: 0,
    },
    {
      name: 'length_mm',
      type: 'number',
      label: 'Длина (мм)',
      required: true,
      min: 0,
      max: 400, // Максимальная длина видеокарты, например, 400 мм
    },
    {
      name: 'recommended_psu_w',
      type: 'number',
      label: 'Рекомендуемая мощность БП (Вт)',
      required: true,
      min: 0,
      max: 1500, // Максимальная рекомендуемая мощность БП
    },
    {
      name: 'connector_8pin',
      type: 'number',
      label: 'Количество 8-pin разъемов питания',
      required: true,
      min: 0,
      max: 4, // Максимальное количество 8-pin разъемов
    },
    {
      name: 'connector_16pin',
      type: 'checkbox',
      label: 'Наличие 16-pin разъема питания',
      defaultValue: false,
    },
  ],
}

import { CollectionConfig } from 'payload'

export const RAM: CollectionConfig = {
  slug: 'ram',
  labels: {
    singular: 'Оперативка',
    plural: 'Оперативки',
  },
  admin: {
    useAsTitle: 'name',
    description: 'Оперативная память',
  },
  // Вынесли fields из labels
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
      name: 'type',
      type: 'select',
      label: 'Тип памяти',
      options: [
        { label: 'DDR4', value: 'DDR4' },
        { label: 'DDR5', value: 'DDR5' },
      ],
      required: true,
    },
    {
      name: 'modules_count',
      type: 'number',
      label: 'Количество модулей',
      required: true,
      min: 1,
      max: 4,
    },
    {
      name: 'total_capacity_gb',
      type: 'number',
      label: 'Общий объем (ГБ)',
      required: true,
      min: 1,
      max: 256,
    },
    {
      name: 'speed_mhz',
      type: 'number',
      label: 'Частота (МГц)',
      required: true,
      min: 2133,
      max: 8000,
    },
  ],
}

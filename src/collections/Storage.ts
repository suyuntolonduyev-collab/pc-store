import type { CollectionConfig } from 'payload'

/**
 * Коллекция Накопителей (Storage).
 * Описывает HDD, SATA SSD и NVMe накопители.
 * Интерфейс (M.2/SATA) важен для проверки лимитов материнской платы.
 */
export const Storage: CollectionConfig = {
  slug: 'storage',
  labels: {
    singular: 'Накопитель',
    plural: 'Накопители',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'type', 'capacity_gb', 'price'],
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
      type: 'text',
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

    // --- Технические характеристики накопителя ---
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Тип накопителя',
          required: true,
          options: [
            { label: 'NVMe SSD', value: 'NVMe' },
            { label: 'SATA SSD', value: 'SATA SSD' },
            { label: 'HDD', value: 'HDD' },
          ],
        },
        {
          name: 'interface',
          type: 'select',
          label: 'Интерфейс',
          required: true,
          options: [
            { label: 'M.2', value: 'M.2' },
            { label: 'SATA', value: 'SATA' },
          ],
        },
      ],
    },
    {
      name: 'capacity_gb',
      type: 'number',
      label: 'Емкость (ГБ)',
      required: true,
      min: 1,
      admin: {
        description: 'Укажите объем в гигабайтах (например, 1024 для 1ТБ)',
      },
    },
  ],
}

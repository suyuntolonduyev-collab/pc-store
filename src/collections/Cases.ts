import type { CollectionConfig } from 'payload'

/**
 * Коллекция Корпусов (Cases).
 * Исправленная версия: значения поддержки форм-факторов по умолчанию отключены
 * для предотвращения ошибок при наполнении каталога.
 */
export const Cases: CollectionConfig = {
  slug: 'cases',
  labels: {
    singular: 'Корпус',
    plural: 'Корпуса',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'price', 'stock_quantity'],
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

    // --- Совместимость с материнскими платами ---
    {
      type: 'row',
      fields: [
        {
          name: 'supports_atx',
          type: 'checkbox',
          label: 'Поддержка ATX',
          defaultValue: false, // Изменено на false для точности данных
        },
        {
          name: 'supports_matx',
          type: 'checkbox',
          label: 'Поддержка Micro-ATX',
          defaultValue: false, // Изменено на false
        },
        {
          name: 'supports_itx',
          type: 'checkbox',
          label: 'Поддержка Mini-ITX',
          defaultValue: false, // Изменено на false
        },
      ],
    },

    // --- Ограничения по габаритам ---
    {
      name: 'max_gpu_length_mm',
      type: 'number',
      label: 'Макс. длина видеокарты (мм)',
      required: true,
      min: 1,
    },
    {
      name: 'max_cooler_height_mm',
      type: 'number',
      label: 'Макс. высота кулера (мм)',
      required: true,
      min: 1,
    },
  ],
}

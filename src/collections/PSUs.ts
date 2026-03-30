import type { CollectionConfig } from 'payload'

/**
 * Коллекция Блоков Питания (PSUs).
 * Исправленная версия: изображение теперь опционально, добавлена валидация остатков.
 */
export const PSUs: CollectionConfig = {
  slug: 'psus',
  labels: {
    singular: 'Блок питания',
    plural: 'Блоки питания',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'wattage', 'price', 'stock_quantity'],
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
      relationTo: 'media',
      label: 'Изображение',
      required: false, // Исправлено: теперь не обязательно
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
      min: 0, // Исправлено: защита от отрицательных значений
    },

    // --- Технические характеристики ---
    {
      name: 'wattage',
      type: 'number',
      label: 'Мощность (Вт)',
      required: true,
      min: 1,
    },
    {
      name: 'form_factor',
      type: 'select',
      label: 'Форм-фактор',
      required: true,
      options: [
        { label: 'ATX', value: 'ATX' },
        { label: 'SFX', value: 'SFX' },
        { label: 'SFX-L', value: 'SFX-L' },
      ],
      defaultValue: 'ATX',
    },
    {
      name: 'pcie_connectors',
      type: 'number',
      label: 'Кол-во разъемов 8-pin PCIe',
      required: true,
      defaultValue: 2,
      min: 0,
    },
    {
      name: 'has_16pin_connector',
      type: 'checkbox',
      label: 'Наличие 16-pin (12VHPWR)',
      defaultValue: false,
    },
  ],
}

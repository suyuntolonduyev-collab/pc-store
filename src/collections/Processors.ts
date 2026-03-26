/**
 * src/collections/Processors.ts
 * Коллекция процессоров с жесткой валидацией данных.
 * Исправлены типы полей (brand, socket), добавлены лимиты (min/max) и индексы.
 */

import type { CollectionConfig } from 'payload'

export const Processors: CollectionConfig = {
  slug: 'processors',
  labels: {
    singular: 'Процессор',
    plural: 'Процессоры',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'price', 'socket', 'stock_quantity'],
    group: 'Компоненты',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Название модели',
      required: true,
      index: true, // Индекс для быстрого поиска по названию
    },
    {
      name: 'brand',
      type: 'select',
      label: 'Бренд',
      required: true,
      index: true,
      options: [
        { label: 'Intel', value: 'intel' },
        { label: 'AMD', value: 'amd' },
      ],
    },
    {
      name: 'price',
      type: 'number',
      label: 'Цена (С)',
      required: true,
      index: true,
      min: 0,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Изображение',
      required: true,
    },
    {
      name: 'description',
      type: 'richText', // Улучшаем описание до RichText для красивого вывода в портфолио
      label: 'Описание',
    },
    {
      name: 'stock_quantity',
      type: 'number',
      label: 'Количество на складе',
      required: true,
      min: 0, // Нельзя уйти в минус
      defaultValue: 0,
    },

    // Технические характеристики
    {
      type: 'row',
      fields: [
        {
          name: 'socket',
          type: 'select', // Заменяем текст на выбор, чтобы избежать ошибок "am4/AM4"
          label: 'Сокет',
          required: true,
          options: [
            { label: 'LGA 1700', value: 'LGA1700' },
            { label: 'LGA 1200', value: 'LGA1200' },
            { label: 'AM4', value: 'AM4' },
            { label: 'AM5', value: 'AM5' },
            { label: 'TR4', value: 'TR4' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'tdp',
          type: 'number',
          label: 'TDP (Вт)',
          required: true,
          min: 1,
          max: 500, // Защита от нереалистичных данных
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'supports_ddr4',
          type: 'checkbox',
          label: 'Поддержка DDR4',
          defaultValue: true,
        },
        {
          name: 'supports_ddr5',
          type: 'checkbox',
          label: 'Поддержка DDR5',
          defaultValue: false,
        },
        {
          name: 'has_graphics',
          type: 'checkbox',
          label: 'Встроенное видеоядро',
          defaultValue: true,
        },
      ],
    },
  ],
}

export default Processors

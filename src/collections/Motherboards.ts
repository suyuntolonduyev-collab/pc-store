import { CollectionConfig } from 'payload' // Исправлен путь импорта

const Motherboards: CollectionConfig = {
  slug: 'motherboards',
  labels: {
    singular: 'Материнтская плата',
    plural: 'Материнские платы',
  },
  admin: {
    useAsTitle: 'name', // Используем название модели в качестве заголовка
    defaultColumns: ['name', 'brand', 'price', 'socket', 'stock_quantity'], // Добавляем сокет и количество на складе в отображаемые столбцы
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
      type: 'text',
      label: 'Бренд',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      label: 'Цена (С)',
      required: true,
      min: 0,
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Изображение',
      relationTo: 'media', // Связь с коллекцией Media для загрузки изображений
      required: false, // Добавлено явно для читаемости
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
      name: 'socket',
      type: 'text',
      label: 'Сокет CPU',
      required: true,
    },
    {
      name: 'form_factor',
      type: 'select',
      label: 'Форм-фактор',
      options: [
        { label: 'ATX', value: 'ATX' },
        { label: 'Micro-ATX', value: 'Micro-ATX' },
        { label: 'Mini-ITX', value: 'Mini-ITX' },
      ],
      required: true,
    },
    {
      name: 'supports_ddr4',
      type: 'checkbox',
      label: 'Поддержка DDR4',
      defaultValue: false,
    },
    {
      name: 'supports_ddr5',
      type: 'checkbox',
      label: 'Поддержка DDR5',
      defaultValue: false,
    },
    {
      name: 'ram_slots',
      type: 'number',
      label: 'Количество слотов RAM',
      required: true,
      min: 0,
      max: 8, // Добавлена максимальная валидация
    },
    {
      name: 'm2_slots',
      type: 'number',
      label: 'Количество слотов M.2',
      required: true,
      min: 0,
      max: 5, // Добавлена максимальная валидация (типично 1-4, но 5 для запаса)
    },
    {
      name: 'sata_ports',
      type: 'number',
      label: 'Количество портов SATA',
      required: true,
      min: 0,
      max: 12, // Добавлена максимальная валидация
    },
  ],
}

export default Motherboards

import type { GlobalConfig } from 'payload'

export const Contacts: GlobalConfig = {
  slug: 'contacts',
  label: 'Контакты',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'phone',
      type: 'text',
      label: 'Телефон',
    },
    {
      name: 'email',
      type: 'text',
      label: 'Email поддержки',
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Адрес',
    },
    {
      name: 'working_hours',
      type: 'text',
      label: 'Часы работы',
    },
    {
      name: 'telegram',
      type: 'text',
      label: 'Telegram ссылка',
    },
    {
      name: 'whatsapp',
      type: 'text',
      label: 'WhatsApp',
    },
  ],
}

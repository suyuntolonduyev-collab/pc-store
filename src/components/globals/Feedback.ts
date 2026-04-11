import type { GlobalConfig } from 'payload'

export const Feedback: GlobalConfig = {
  slug: 'feedback',
  label: 'Форма обратной связи',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'is_enabled',
      type: 'checkbox',
      label: 'Форма включена',
    },
    {
      name: 'recipient_email',
      type: 'text',
      label: 'Email получателя',
    },
    {
      name: 'success_message',
      type: 'textarea',
      label: 'Сообщение об успешной отправке',
    },
    {
      name: 'fields',
      type: 'array',
      label: 'Поля формы',
      minRows: 3,
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Название поля',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          label: 'Тип поля',
          required: true,
          options: [
            { label: 'Имя', value: 'name' },
            { label: 'Email', value: 'email' },
            { label: 'Сообщение', value: 'message' },
          ],
        },
        {
          name: 'required',
          type: 'checkbox',
          label: 'Обязательное',
          defaultValue: true,
        },
      ],
      defaultValue: [
        { name: 'Имя', type: 'name', required: true },
        { name: 'Email', type: 'email', required: true },
        { name: 'Сообщение', type: 'message', required: true },
      ],
    },
  ],
}

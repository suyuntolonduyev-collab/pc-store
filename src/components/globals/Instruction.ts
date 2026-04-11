import type { GlobalConfig } from 'payload'

export const Instruction: GlobalConfig = {
  slug: 'instruction',
  label: 'Инструкция',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок',
      required: true,
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'Вводный текст',
    },
    {
      name: 'steps',
      type: 'array',
      label: 'Шаги инструкции',
      fields: [
        {
          name: 'step_number',
          type: 'number',
          label: 'Номер шага',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Заголовок шага',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание шага',
          required: true,
        },
        {
          name: 'tip',
          type: 'text',
          label: 'Подсказка',
        },
      ],
    },
  ],
}

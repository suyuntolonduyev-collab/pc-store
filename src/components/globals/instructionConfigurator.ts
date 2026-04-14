import type { GlobalConfig } from 'payload'

export const InstructionConfigurator: GlobalConfig = {
  slug: 'instruction-configurator',
  label: 'Инструкция для конфигуратора',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок страницы',
      required: true,
      defaultValue: 'Как пользоваться конфигуратором',
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'Вводный текст',
      required: false,
    },
    {
      name: 'banner',
      type: 'upload',
      label: 'Баннер',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'steps',
      type: 'array',
      label: 'Шаги инструкции',
      labels: {
        singular: 'Шаг',
        plural: 'Шаги',
      },
      fields: [
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
          label: 'Совет эксперта',
          required: false,
        },
      ],
      admin: {
        initCollapsed: false,
      },
    },
  ],
}

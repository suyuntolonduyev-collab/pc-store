import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'О компании',
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
      name: 'description',
      type: 'textarea',
      label: 'Описание',
    },
    {
      name: 'mission',
      type: 'textarea',
      label: 'Миссия компании',
    },
    {
      name: 'founded_year',
      type: 'number',
      label: 'Год основания',
    },
    {
      name: 'team_size',
      type: 'number',
      label: 'Размер команды',
    },
  ],
}

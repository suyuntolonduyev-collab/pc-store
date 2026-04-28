import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: { useAsTitle: 'title' },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    // 🚀 Добавляем slug
    {
      name: 'slug',
      type: 'text',
      required: true,
      label: 'URL-адрес (Slug)',
      unique: true,
      admin: { position: 'sidebar' },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value)
              return value
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '')
            return data?.title
              ?.toLowerCase()
              .replace(/ /g, '-')
              .replace(/[^\w-]+/g, '')
          },
        ],
      },
    },
    { name: 'excerpt', type: 'textarea', label: 'Краткое описание' },
    { name: 'content', type: 'richText', label: 'Текст статьи' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Обложка' },
    {
      name: 'category',
      type: 'select',
      label: 'Категория',
      options: [
        { label: 'Новости', value: 'news' },
        { label: 'Обзоры', value: 'reviews' },
        { label: 'Гайды', value: 'guides' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Теги',
      fields: [{ name: 'tag', type: 'text', label: 'Тег' }],
    },
  ],
}

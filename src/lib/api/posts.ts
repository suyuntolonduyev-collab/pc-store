import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import type { Where } from 'payload'

// 1. Схема Zod под наше новое поле `category`
export const PostSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  // Сделаем .catch() или .default(), чтобы пост не отсеивался при ошибке
  slug: z.string().default('no-slug'),
  excerpt: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  // Обработка тегов как массива объектов (согласно твоей коллекции)
  tags: z
    .array(z.object({ tag: z.string() }))
    .nullable()
    .optional(),
  content: z.any().optional(),
  image: z.any().optional(),
  createdAt: z.string(),
})

export type BlogPost = z.infer<typeof PostSchema>

export const getImageUrl = (image: BlogPost['image']): string => {
  if (typeof image === 'object' && image?.url) return image.url
  return '/placeholder-blog.jpg'
}

// 2. Исправленный запрос постов (Решает ошибку TS 2322)
export const getPosts = cache(async (rawCategory?: string, page: number = 1) => {
  const category = rawCategory && rawCategory !== 'all' ? rawCategory : null
  const payload = await getPayload({ config })

  // Правильная типизация для Payload: если фильтра нет, отдаем undefined (а не {})
  const whereQuery: Where | undefined = category ? { category: { equals: category } } : undefined

  try {
    const { docs, totalPages, hasNextPage, hasPrevPage } = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 13,
      page,
      sort: '-createdAt',
      where: whereQuery,
    })

    const validPosts = docs.reduce((acc: BlogPost[], doc) => {
      const parsed = PostSchema.safeParse(doc)
      if (parsed.success) acc.push(parsed.data)
      else
        console.warn(`[БЛОГ] Пропущен пост ID: ${doc.id}. Ошибка:`, parsed.error.issues[0].message)
      return acc
    }, [])

    return { posts: validPosts, totalPages, hasNextPage, hasPrevPage }
  } catch (error) {
    console.error('[БЛОГ] Ошибка БД в getPosts:', error)
    return { posts: [], totalPages: 1, hasNextPage: false, hasPrevPage: false }
  }
})

export const getPostBySlug = cache(async (slug: string) => {
  if (!slug || typeof slug !== 'string') return null

  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      depth: 2,
    })

    if (!docs[0]) return null
    const parsed = PostSchema.safeParse(docs[0])
    return parsed.success ? parsed.data : null
  } catch (error) {
    console.error(`[БЛОГ] Ошибка получения поста ${slug}:`, error)
    return null
  }
})

// 3. Исправленный запрос похожих постов
export const getRelatedPosts = cache(
  async (category: string | null | undefined, currentId: string | number) => {
    if (!category) return []

    try {
      const payload = await getPayload({ config })
      const whereQuery: Where = {
        and: [{ category: { equals: category } }, { id: { not_equals: currentId } }],
      }

      const { docs } = await payload.find({
        collection: 'posts',
        limit: 3,
        where: whereQuery,
      })

      return docs.reduce((acc: BlogPost[], doc) => {
        const parsed = PostSchema.safeParse(doc)
        if (parsed.success) acc.push(parsed.data)
        return acc
      }, [])
    } catch (error) {
      console.error('[БЛОГ] Ошибка получения похожих постов:', error)
      return []
    }
  },
)

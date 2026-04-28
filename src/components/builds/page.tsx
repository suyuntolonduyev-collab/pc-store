import { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import BuildsTabs from '@/components/builds/BuildsTabs'
import type { Build } from '@/payload-types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Готовые сборки ПК | PC-STORE',
  description: 'Коллекция сбалансированных компьютеров для игр, работы и дома.',
}

export default async function BuildsPage() {
  let builds: Build[] = []

  // 1. Надежный try/catch на случай падения БД
  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'builds',
      depth: 2,
      limit: 100,
      where: {
        is_complete: { equals: true },
      },
      sort: '-createdAt',
    })
    builds = res.docs as Build[]
  } catch (error) {
    console.error('Ошибка загрузки сборок:', error)
    // Массив builds останется пустым [], и клиентский компонент покажет красивый Fallback (Edge-case 8)
  }

  return (
    <main className="bg-gray-50 min-h-screen pt-12 pb-24 relative z-0">
      {/* Декоративный фон шапки */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-50 to-gray-50 -z-10" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Заголовок переехал внутрь табов, поэтому страница стала очень тонкой и чистой */}
        <BuildsTabs initialBuilds={builds} />
      </div>
    </main>
  )
}

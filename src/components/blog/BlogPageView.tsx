import Link from 'next/link'
import Image from 'next/image'
import { BlogPost, getImageUrl } from '@/lib/api/posts'

const BLOG_TAGS = [
  { id: 'all', label: 'Все' },
  { id: 'news', label: 'Новости' },
  { id: 'reviews', label: 'Обзоры' },
  { id: 'guides', label: 'Гайды' },
]

export default function BlogPageView({
  posts,
  currentTag,
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
}: {
  posts: BlogPost[]
  currentTag: string
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}) {
  const [featuredPost, ...regularPosts] = posts

  // Определение базового URL для пагинации
  const baseUrl = `/blog${currentTag !== 'all' ? `?tag=${currentTag}&` : '?'}`

  return (
    <main className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-6">
        {/* 🧭 8. Breadcrumbs */}
        <div className="text-sm font-medium text-gray-400 mb-8 flex gap-2 items-center">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Главная
          </Link>
          <span>/</span>
          <span className="text-gray-900">Блог</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight">Блог</h1>

        <div className="flex gap-3 mb-12 overflow-x-auto pb-2 scrollbar-hide">
          {BLOG_TAGS.map((t) => (
            <Link
              key={t.id}
              href={`/blog${t.id === 'all' ? '' : `?tag=${t.id}`}`}
              className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                currentTag === t.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {currentPage === 1 && featuredPost ? (
          <Link
            href={`/blog/${featuredPost.slug}`}
            prefetch={false}
            className="group relative block mb-16 overflow-hidden rounded-[40px] bg-gray-900 shadow-2xl"
          >
            <div className="relative h-[400px] md:h-[600px] w-full">
              <Image
                src={getImageUrl(featuredPost.image)}
                alt={featuredPost.title}
                fill
                sizes="100vw"
                className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-4xl">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                  {featuredPost.title}
                </h2>
                <div className="flex items-center gap-4 text-gray-300 font-bold text-sm uppercase tracking-widest">
                  {/* 📅 8. Форматирование даты */}
                  <span>
                    {new Date(featuredPost.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="w-1 h-1 bg-gray-500 rounded-full" />
                  <span className="text-blue-400">Читать статью →</span>
                </div>
              </div>
            </div>
          </Link>
        ) : null}

        {/* СЕТКА */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              prefetch={false}
              className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-6">{post.excerpt}</p>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 🚀 7. ПАГИНАЦИЯ */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            {hasPrevPage && (
              <Link
                href={`${baseUrl}page=${currentPage - 1}`}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                ← Назад
              </Link>
            )}
            <span className="font-medium text-gray-500">
              Страница {currentPage} из {totalPages}
            </span>
            {hasNextPage && (
              <Link
                href={`${baseUrl}page=${currentPage + 1}`}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
              >
                Вперед →
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

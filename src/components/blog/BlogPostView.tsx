import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BlogPost, getImageUrl } from '@/lib/api/posts'
import { renderRichText } from '@/lib/renderers/richText'

export default function BlogPostView({
  post,
  relatedPosts,
}: {
  post: BlogPost
  relatedPosts: BlogPost[]
}) {
  const contentString = String(post.content || post.excerpt || '')
  const words = contentString.trim().split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(words / 200))
  const mainImageUrl = getImageUrl(post.image) || '/placeholder-blog.jpg'

  return (
    <main className="bg-white min-h-screen pb-24">
      {/* HEADER */}
      <div className="relative h-[70vh] w-full bg-gray-900 flex items-end">
        <Image
          src={mainImageUrl}
          alt={post.title}
          fill
          priority
          className="object-cover opacity-70"
        />

        {/* Градиентный слой для мягкости */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="container mx-auto max-w-5xl px-6 mb-12 md:mb-20 relative z-10">
          {/* 🚀 Тот самый фон для текста (Glassmorphism) */}
          <div className="inline-block bg-black/40 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border border-white/10 shadow-2xl max-w-4xl">
            {/* Breadcrumbs внутри блока */}
            <div className="text-xs md:text-sm font-bold text-blue-400 mb-6 flex gap-2 items-center uppercase tracking-[0.2em]">
              <Link href="/blog" className="hover:text-blue-300 transition-colors">
                Блог
              </Link>
              <span className="text-white/30">/</span>
              <span title={post.title} className="text-white/80 truncate max-w-[200px]">
                {post.category || 'Статья'}
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-black text-white mb-8 tracking-tight leading-[1.1]">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/60 font-bold text-xs md:text-sm uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <span className="text-blue-500">📅</span>
                {new Date(post.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="flex items-center gap-2">
                <span className="text-blue-500">⏱</span>
                {readingTime} мин. чтения
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* КОНТЕНТ СТАТЬИ */}
      <div className="container mx-auto max-w-4xl px-6 pt-16">
        <article className="prose prose-lg max-w-none prose-indigo prose-img:rounded-3xl prose-a:text-blue-600 prose-strong:text-gray-900">
          {post.excerpt && (
            <p className="text-xl md:text-2xl font-medium text-gray-400 leading-relaxed mb-16 italic border-l-4 border-blue-600 pl-8">
              {post.excerpt}
            </p>
          )}

          <div className="text-lg md:text-xl leading-[1.8] text-gray-800">
            {post.content ? (
              renderRichText(post.content)
            ) : (
              <p className="text-gray-400 italic">Контент подготавливается...</p>
            )}
          </div>
        </article>

        {/* ПОХОЖИЕ СТАТЬИ */}
        {relatedPosts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-gray-100">
            <h4 className="text-2xl font-black mb-8 text-gray-900">Похожие материалы</h4>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => {
                const relImageUrl = getImageUrl(rel.image) || '/placeholder-blog.jpg'
                return (
                  <Link key={rel.id} href={`/blog/${rel.slug}`} className="group block">
                    <div className="relative h-40 rounded-2xl overflow-hidden mb-4 bg-gray-100">
                      {/* ⚡ 8. Явная Lazy-оптимизация */}
                      <Image
                        src={relImageUrl}
                        alt={rel.title}
                        fill
                        loading="lazy"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h5 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {rel.title}
                    </h5>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

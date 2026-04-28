'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'

interface BlogPost {
  id: number
  title: string
  excerpt?: string | null
  image?: number | Media | null
}

export default function InteractiveBlogGrid({ posts = [] }: { posts: BlogPost[] }) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  if (!posts || !Array.isArray(posts)) return null

  return (
    <>
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post) => {
          const imgUrl =
            post.image && typeof post.image === 'object' ? (post.image as Media).url : null

          return (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group flex flex-col h-full cursor-pointer"
            >
              <div className="h-56 relative bg-gray-100 overflow-hidden">
                {imgUrl && (
                  <Image
                    src={imgUrl}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-700"
                    alt={post.title}
                  />
                )}
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="font-bold text-xl group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm mt-auto line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-64 w-full bg-gray-100">
              {selectedPost.image && typeof selectedPost.image === 'object' && (
                <Image
                  src={(selectedPost.image as Media).url!}
                  fill
                  className="object-cover"
                  alt={selectedPost.title}
                />
              )}
            </div>
            <div className="p-8 md:p-12">
              <h2 className="text-3xl font-black text-gray-900 mb-6">{selectedPost.title}</h2>
              <div className="prose prose-blue max-w-none text-gray-600">
                <p className="whitespace-pre-wrap leading-relaxed text-lg">
                  {selectedPost.excerpt}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

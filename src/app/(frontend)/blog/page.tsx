import { Metadata } from 'next'
import { getPosts } from '@/lib/api/posts'
import BlogPageView from '@/components/blog/BlogPageView'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Блог | PC-STORE',
  description: 'Новости мира IT и гайды по сборке ПК.',
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>
}) {
  const { tag = 'all', page = '1' } = await searchParams
  const currentPage = parseInt(page, 10) || 1

  const { posts, totalPages, hasNextPage, hasPrevPage } = await getPosts(tag, currentPage)

  return (
    <BlogPageView
      posts={posts}
      currentTag={tag}
      currentPage={currentPage}
      totalPages={totalPages}
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
    />
  )
}

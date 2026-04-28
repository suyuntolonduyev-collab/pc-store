import { notFound } from 'next/navigation'
import { getPostBySlug, getRelatedPosts, getImageUrl } from '@/lib/api/posts'
import BlogPostView from '@/components/blog/BlogPostView'
import type { Metadata } from 'next'

export const revalidate = 3600

// ⚡ 5. Полноценное SEO (OpenGraph)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) return { title: 'Статья не найдена | PC-STORE' }

  const imageUrl = getImageUrl(post.image)
  const description = post.excerpt || 'Читайте новую статью в блоге PC-STORE'

  return {
    title: `${post.title} | PC-STORE`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: imageUrl !== '/placeholder-blog.jpg' ? [imageUrl] : [],
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(post.category, post.id)

  return <BlogPostView post={post} relatedPosts={relatedPosts} />
}

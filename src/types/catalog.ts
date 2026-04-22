import type { Media } from '@/payload-types'

export interface CatalogItem {
  id: number
  name: string
  price: number
  image?: number | Media | null
  description?: string | null
}

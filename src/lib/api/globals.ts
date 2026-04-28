import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Config } from '@/payload-types'

// Типизируем доступные глобалки из твоего Payload
type GlobalSlug = keyof Config['globals']

export const getGlobalData = cache(async (slug: GlobalSlug) => {
  try {
    const payload = await getPayload({ config })
    const data = await payload.findGlobal({ slug })
    return data
  } catch (error) {
    console.error(`[API] Ошибка получения глобалки ${slug}:`, error)
    return null
  }
})

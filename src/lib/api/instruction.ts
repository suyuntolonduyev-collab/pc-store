import { cache } from 'react'
import { z } from 'zod'
import type { Config } from '@/payload-types'

type GlobalSlug = keyof Config['globals']

const StepSchema = z.object({
  id: z.string().optional(), // На случай если в Payload не включены ID для массивов
  title: z.string(),
  description: z.string(),
  tip: z.string().nullable().optional(),
})

const PageSchema = z.object({
  title: z.string(),
  intro: z.string().nullable().optional(),
  banner: z
    .object({
      id: z.string(),
      url: z.string(),
      alt: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .nullable()
    .optional(),
  steps: z.array(StepSchema),
})

export type PageData = z.infer<typeof PageSchema>

export const getInstructionData = cache(async (slug: GlobalSlug): Promise<PageData> => {
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  const data = await payload.findGlobal({ slug })

  // 🧠 Строгая Runtime-валидация через Zod
  return PageSchema.parse(data)
})

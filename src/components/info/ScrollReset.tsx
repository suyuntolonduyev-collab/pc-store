'use client'

import { useEffect } from 'react'

// 🧠 7. Изолированный микро-компонент для сброса скролла
export function ScrollReset({ activeSlug }: { activeSlug: string }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSlug])

  return null
}

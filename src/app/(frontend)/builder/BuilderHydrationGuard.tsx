'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useBuilderStore } from '@/store/useBuilderStore'

interface BuilderHydrationGuardProps {
  children: ReactNode
}

export function BuilderHydrationGuard({ children }: BuilderHydrationGuardProps) {
  const [isMounted, setIsMounted] = useState(false)
  const _hasHydrated = useBuilderStore((state) => state._hasHydrated)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Ждем, пока компонент смонтируется на клиенте И стор восстановит данные
  if (!isMounted || !_hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Загрузка конфигуратора...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

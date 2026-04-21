import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { BuilderHydrationGuard } from './BuilderHydrationGuard'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Конфигуратор ПК | Собери свой идеальный компьютер',
  description: 'Удобный онлайн-конструктор для подбора совместимых комплектующих ПК.',
}

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <BuilderHydrationGuard>
      {children}
      <Toaster />
    </BuilderHydrationGuard>
  )
}

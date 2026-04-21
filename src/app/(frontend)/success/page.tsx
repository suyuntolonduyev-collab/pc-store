'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { useCartStore } from '@/store/useCartStore'
import Link from 'next/link'

// Выносим логику в отдельный компонент для поддержки Suspense (требование Next.js 13+ для useSearchParams)
function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    if (sessionId) {
      clearCart()
      console.log('SESSION ID:', sessionId)
    }
  }, [sessionId, clearCart])

  return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Оплата прошла успешно! 🎉</h1>
      <p className="text-gray-500 mb-8">
        Сессия: <span className="text-xs bg-gray-100 p-1 rounded">{sessionId}</span>
      </p>

      <Link
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Загрузка...</div>}>
      <SuccessContent />
    </Suspense>
  )
}

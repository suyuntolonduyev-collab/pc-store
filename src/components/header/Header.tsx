'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'

export default function Header() {
  const pathname = usePathname()

  // Состояние для защиты от Hydration Mismatch
  const [isMounted, setIsMounted] = useState(false)

  // Селекторы Zustand
  const items = useCartStore((state) => state.items)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Считаем общее количество товаров (с учетом quantity)
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-0 h-16 flex items-center justify-between">
        {/* Левый блок: Логотип и Навигация */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter text-blue-600 hover:text-blue-700 transition-colors"
          >
            PC-STORE
          </Link>

          {/* Основная навигация */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/builder"
              className={`text-sm font-medium transition-colors ${
                pathname === '/builder' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Конфигуратор
            </Link>

            <Link
              href="/instruction"
              className={`text-sm font-medium transition-colors ${
                pathname === '/instruction' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Инструкции
            </Link>
          </nav>
        </div>

        {/* Правый блок: Авторизация и Корзина */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Блок авторизации */}
          <div className="hidden sm:flex items-center gap-4 text-sm">
            {!isMounted ? (
              // Скелетон на время гидратации, чтобы верстка не прыгала
              <div className="w-24 h-5 bg-gray-100 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  Привет, <span className="font-semibold text-gray-900">{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-600 transition-colors font-medium"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          {/* Разделитель */}
          <div className="hidden sm:block h-6 w-px bg-gray-200"></div>

          {/* Корзина */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group p-2 -m-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>

            {/* Счетчик товаров */}
            {isMounted && cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm transform translate-x-1 -translate-y-1">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

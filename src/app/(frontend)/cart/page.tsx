'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useCartStore } from '@/store/useCartStore'
import { useBuilderStore } from '@/store/useBuilderStore'
import formatPrice from '@/utils/formatPrice'
import { getSingleBuildPrice } from '@/utils/getBuildPrice'
import { checkCompatibility } from '@/utils/compatibilityChecker'
import type { Build, Accessory, Media } from '@/payload-types'

export default function CartPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Accessory[]>([])

  // --- Hooks ---
  const items = useCartStore((state) => state.items)
  const cartAddItem = useCartStore((state) => state.addItem)
  const decreaseItem = useCartStore((state) => state.decreaseItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const setBuilderBuild = useBuilderStore((state) => state.setBuild)

  const totalItemsCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  )

  useEffect(() => {
    setIsMounted(true)
    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/accessories?limit=3&depth=1')
        if (res.ok) setRecommendations((await res.json()).docs)
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
      }
    }
    fetchRecommendations()
  }, [])

  // --- Handlers ---
  const handleEditBuild = (id: string, build: Build) => {
    removeItem(id)
    setBuilderBuild({
      cpu: typeof build.cpu === 'object' ? build.cpu : null,
      mobo: typeof build.mobo === 'object' ? build.mobo : null,
      gpu: typeof build.gpu === 'object' ? build.gpu : null,
      ram: typeof build.ram === 'object' ? build.ram : null,
      psu: typeof build.psu === 'object' ? build.psu : null,
      case: typeof build.case === 'object' ? build.case : null,
      cooler: typeof build.cooler === 'object' ? build.cooler : null,
      storage: typeof build.storage === 'object' ? build.storage : null,
    })
    router.push('/builder')
  }

  const handleAddRecommendation = (rec: Accessory) => {
    cartAddItem({ type: 'accessory', product: rec })
    toast.success(`${rec.name} добавлен в корзину`)
  }

  // --- Renders ---
  if (!isMounted) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Ваша корзина пуста</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Соберите свой идеальный ПК или выберите готовые комплектующие в каталоге.
        </p>
        <div className="flex gap-4">
          <Link
            href="/catalog"
            className="bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-xl"
          >
            В каталог
          </Link>
          <Link href="/builder" className="bg-blue-600 text-white font-medium py-3 px-6 rounded-xl">
            Собрать ПК
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-0">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold">Корзина</h1>
        <button onClick={clearCart} className="text-sm text-red-500">
          Очистить
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map((cartItem) => {
            // 1. Защита: если элемент битый или старого формата — пропускаем
            if (!cartItem || !cartItem.item) return null

            // 2. Правильный синтаксис деструктуризации (БЕЗ круглых скобок внутри)
            const { id, item, quantity } = cartItem
            const isExpanded = expandedItemId === id

            // --- РЕНДЕР СБОРКИ ---
            if (item.type === 'build') {
              const build = item.product
              const singlePrice = getSingleBuildPrice(build)
              const caseData =
                build['case'] && typeof build['case'] === 'object' ? build['case'] : null
              const imageUrl =
                caseData?.image && typeof caseData.image === 'object'
                  ? (caseData.image as Media).url
                  : null

              const buildForChecker = {
                cpu: typeof build.cpu === 'object' ? build.cpu : null,
                mobo: typeof build.mobo === 'object' ? build.mobo : null,
                gpu: typeof build.gpu === 'object' ? build.gpu : null,
                ram: typeof build.ram === 'object' ? build.ram : null,
                psu: typeof build.psu === 'object' ? build.psu : null,
                case: caseData,
                cooler: typeof build.cooler === 'object' ? build.cooler : null,
                storage: typeof build.storage === 'object' ? build.storage : null,
              }
              const compatibilityErrors = checkCompatibility(buildForChecker)
              const hasErrors = compatibilityErrors.some((e) => e.type === 'error')

              return (
                <div
                  key={id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm"
                >
                  {/* Здесь ваш JSX для сборки (иконка, название, цена) */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div
                        className={`text-xs font-bold px-2 py-1 rounded-full inline-block mb-2 ${hasErrors ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                      >
                        {hasErrors ? '⚠️ Конфликт' : '✅ Совместимо'}
                      </div>
                      <h3 className="font-bold text-lg">{build.name || 'Сборка ПК'}</h3>
                      <p className="text-xl font-black text-blue-600">{formatPrice(singlePrice)}</p>
                    </div>
                    {/* Кнопки +/- и Удалить */}
                  </div>
                </div>
              )
            }

            // --- РЕНДЕР АКСЕССУАРА ---
            if (item.type === 'accessory') {
              const accessory = item.product
              const imageUrl =
                accessory.image && typeof accessory.image === 'object'
                  ? (accessory.image as Media).url
                  : null

              return (
                <div
                  key={id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 flex items-center gap-6 shadow-sm"
                >
                  <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={accessory.name}
                        fill
                        className="object-contain p-2"
                      />
                    )}
                  </div>
                  <div className="flex-grow">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Аксессуар</span>
                    <h3 className="font-bold text-gray-900">{accessory.name}</h3>
                    <p className="font-bold text-lg">{formatPrice(accessory.price ?? 0)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => decreaseItem(id)} className="w-8 h-8 border rounded-md">
                      -
                    </button>
                    <span className="font-bold w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => cartAddItem({ type: 'accessory', product: accessory })}
                      className="w-8 h-8 border rounded-md"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            }

            return null
          })}
        </div>

        {/* Сайдбар */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
          <h2 className="text-xl font-bold mb-6">Ваш заказ</h2>
          <div className="space-y-3 mb-6 pb-6 border-b">
            <div className="flex justify-between">
              <span>Товары ({totalItemsCount})</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between">
              <span>Сервис</span>
              <span className="text-green-600 font-semibold">Бесплатно</span>
            </div>
          </div>
          <div className="flex justify-between items-end mb-8">
            <span className="text-lg">Итого:</span>
            <span className="text-3xl font-black">{formatPrice(getTotalPrice())}</span>
          </div>
          <Link
            href="/checkout"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl flex justify-center items-center shadow-md"
          >
            Перейти к оформлению
          </Link>

          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Добавить к заказу</h3>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{rec.name}</p>
                    <p className="text-sm text-gray-500">{formatPrice(rec.price ?? 0)}</p>
                  </div>
                  <button
                    onClick={() => handleAddRecommendation(rec)}
                    className="text-xs font-medium bg-gray-100 hover:bg-blue-100 px-3 py-1.5 rounded-md"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

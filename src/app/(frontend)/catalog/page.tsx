'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { useCartStore } from '@/store/useCartStore'
import type { BuildSlots } from '@/store/useBuilderStore'
import formatPrice from '@/utils/formatPrice'
import type { Build, Media } from '@/payload-types'

// Базовый интерфейс для отображения любого товара из каталога
interface CatalogItem {
  id: number
  name: string
  price: number
  image?: number | Media | null
}

// Конфигурация категорий, как и раньше
const CATEGORIES: { id: string; label: string; collection: string; slotKey: keyof BuildSlots }[] = [
  { id: 'cpu', label: 'Процессоры', collection: 'processors', slotKey: 'cpu' },
  { id: 'gpu', label: 'Видеокарты', collection: 'gpus', slotKey: 'gpu' },
  { id: 'mobo', label: 'Материнские платы', collection: 'motherboards', slotKey: 'mobo' },
  { id: 'ram', label: 'Оперативная память', collection: 'ram', slotKey: 'ram' },
  { id: 'storage', label: 'Накопители', collection: 'storage', slotKey: 'storage' },
  { id: 'psu', label: 'Блоки питания', collection: 'psus', slotKey: 'psu' },
  { id: 'cooler', label: 'Охлаждение', collection: 'coolers', slotKey: 'cooler' },
  { id: 'case', label: 'Корпуса', collection: 'cases', slotKey: 'case' },
]

const SKELETON_KEYS = [
  'skel-1',
  'skel-2',
  'skel-3',
  'skel-4',
  'skel-5',
  'skel-6',
  'skel-7',
  'skel-8',
]

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
  const [items, setItems] = useState<CatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const addItemToCart = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/${activeCategory.collection}?limit=50&depth=1`)
        if (!res.ok) throw new Error('Ошибка загрузки каталога')

        const data = await res.json()
        setItems(data.docs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [activeCategory.id, activeCategory.collection])

  // 🟢 Логика добавления в корзину, адаптированная под новый useCartStore
  const handleAddToCart = (item: CatalogItem) => {
    // Создаем "микро-сборку" из одного компонента
    const singleItemBuild = {
      id: Date.now(),
      name: item.name,
      is_complete: false,
      tags: ['component'],
      // Динамически помещаем товар в правильный слот (cpu, gpu, и т.д.)
      [activeCategory.slotKey]: item,
    } as unknown as Build

    // Оборачиваем в `{ type: 'build', ... }` в соответствии с новым интерфейсом стора
    addItemToCart({ type: 'build', product: singleItemBuild })
    toast.success('Товар добавлен в корзину!')
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Каталог комплектующих</h1>
        <p className="text-gray-500">
          Выбирайте отдельные детали или перейдите в конфигуратор для сборки ПК целиком.
        </p>
      </div>

      <div className="flex overflow-x-auto custom-scrollbar pb-2 mb-8 gap-2 border-b border-gray-100">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-t-lg font-medium transition-colors text-sm ${
              activeCategory.id === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="bg-white border border-gray-100 rounded-2xl p-4 h-72 animate-pulse"
            >
              <div className="w-full h-32 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-full mt-auto"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-100">
          <p className="font-semibold mb-2">Не удалось загрузить товары</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium">В этой категории пока нет товаров.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const imageUrl =
              item.image && typeof item.image === 'object'
                ? ((item.image as Media).url ?? null)
                : null

            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col hover:shadow-lg transition-shadow group"
              >
                <div className="relative w-full h-40 bg-gray-50 rounded-xl mb-4 p-4 flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Нет фото</span>
                  )}
                </div>

                <div className="flex-grow flex flex-col">
                  <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>
                  <div className="mt-auto pt-4 flex items-end justify-between">
                    <span className="text-2xl font-black text-gray-900">
                      {formatPrice(item.price ?? 0)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="mt-4 w-full bg-gray-100 hover:bg-blue-600 text-gray-800 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2 group-hover:shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                  В корзину
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useInView } from 'react-intersection-observer'
import { useCartStore } from '@/store/useCartStore'
import type { BuildSlots } from '@/store/useBuilderStore'
import formatPrice from '@/utils/formatPrice'
import { useDebounce } from '@/hooks/useDebounce'
import QuickViewModal from './QuickViewModal'
import type { Build, Media, Accessory } from '@/payload-types'
import type { CatalogItem } from '@/types/catalog'

interface Brand {
  id: number
  name: string
}

type CategoryConfig = {
  id: string
  label: string
  collection: string
  type: 'component' | 'accessory'
  slotKey?: keyof BuildSlots
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'cpu', label: 'Процессоры', collection: 'processors', type: 'component', slotKey: 'cpu' },
  { id: 'gpu', label: 'Видеокарты', collection: 'gpus', type: 'component', slotKey: 'gpu' },
  {
    id: 'mobo',
    label: 'Материнские платы',
    collection: 'motherboards',
    type: 'component',
    slotKey: 'mobo',
  },
  { id: 'ram', label: 'Оперативная память', collection: 'ram', type: 'component', slotKey: 'ram' },
  {
    id: 'storage',
    label: 'Накопители',
    collection: 'storage',
    type: 'component',
    slotKey: 'storage',
  },
  { id: 'psu', label: 'Блоки питания', collection: 'psus', type: 'component', slotKey: 'psu' },
  {
    id: 'cooler',
    label: 'Охлаждение',
    collection: 'coolers',
    type: 'component',
    slotKey: 'cooler',
  },
  { id: 'case', label: 'Корпуса', collection: 'cases', type: 'component', slotKey: 'case' },
  {
    id: 'accessories',
    label: 'Периферия и аксессуары',
    collection: 'accessories',
    type: 'accessory',
  },
]

const SKELETON_KEYS = Array.from({ length: 8 }, (_, i) => `skel-${i + 1}`)
const PAGE_SIZE = 12

// Выносим основную логику в отдельный компонент для обертки Suspense
function CatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 1. Читаем параметр ?category из URL при первой загрузке
  const categoryParam = searchParams.get('category')
  const initialCategory = CATEGORIES.find((c) => c.id === categoryParam) || CATEGORIES[0]

  const [activeCategory, setActiveCategory] = useState<CategoryConfig>(initialCategory)
  const [items, setItems] = useState<CatalogItem[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [sort, setSort] = useState('-createdAt')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const debouncedPriceRange = useDebounce(priceRange, 600)

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addItemToCart = useCartStore((state) => state.addItem)
  const { ref, inView } = useInView({ threshold: 0 })

  // Синхронизация с URL при нажатии кнопки "Назад" в браузере
  useEffect(() => {
    const catId = searchParams.get('category')
    if (catId) {
      const cat = CATEGORIES.find((c) => c.id === catId)
      if (cat && cat.id !== activeCategory.id) {
        setActiveCategory(cat)
      }
    }
  }, [searchParams])

  // 2. Функция смены категории (обновляет и стейт, и URL без перезагрузки)
  const handleCategoryChange = (category: CategoryConfig) => {
    setActiveCategory(category)
    setSelectedBrandId('all')
    setSearchTerm('')
    setPriceRange({ min: '', max: '' })

    // Обновляем URL
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', category.id)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/brands?limit=100&sort=name')
        if (res.ok) {
          const data = await res.json()
          setBrands(data.docs)
        }
      } catch (e) {
        // Ошибка обрабатывается молча
      }
    }
    fetchBrands()
  }, [])

  const fetchItems = useCallback(
    async (pageToLoad: number, reset: boolean = false) => {
      if (reset) setIsLoading(true)
      else setIsLoadingMore(true)
      setError(null)

      try {
        let url = `/api/${activeCategory.collection}?limit=${PAGE_SIZE}&page=${pageToLoad}&sort=${sort}&depth=1`

        let andIndex = 0

        if (debouncedSearchTerm) {
          url += `&where[and][${andIndex}][name][like]=${encodeURIComponent(debouncedSearchTerm)}`
          andIndex++
        }
        if (debouncedPriceRange.min) {
          url += `&where[and][${andIndex}][price][greater_than_equal]=${Number(debouncedPriceRange.min)}`
          andIndex++
        }
        if (debouncedPriceRange.max) {
          url += `&where[and][${andIndex}][price][less_than_equal]=${Number(debouncedPriceRange.max)}`
          andIndex++
        }
        if (selectedBrandId !== 'all' && activeCategory.type === 'component') {
          url += `&where[and][${andIndex}][brand][equals]=${Number(selectedBrandId)}`
          andIndex++
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error('Ошибка загрузки каталога (проверьте параметры фильтра)')

        const data = await res.json()
        setItems((prev) => (reset ? data.docs : [...prev, ...data.docs]))
        setHasNextPage(data.hasNextPage)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [
      activeCategory.collection,
      activeCategory.type,
      sort,
      debouncedSearchTerm,
      debouncedPriceRange,
      selectedBrandId,
    ],
  )

  useEffect(() => {
    setPage(1)
    setItems([])
    fetchItems(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory.id, sort, debouncedSearchTerm, debouncedPriceRange, selectedBrandId])

  useEffect(() => {
    if (inView && hasNextPage && !isLoading && !isLoadingMore) setPage((prev) => prev + 1)
  }, [inView, hasNextPage, isLoading, isLoadingMore])

  useEffect(() => {
    if (page > 1) fetchItems(page, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleAddToCart = async (item: CatalogItem) => {
    if (activeCategory.type === 'accessory') {
      addItemToCart({ type: 'accessory', product: item as unknown as Accessory })
      toast.success('Аксессуар добавлен в корзину!')
      return
    }

    if (!activeCategory.slotKey) return

    const localBuild = {
      id: Date.now(),
      name: `Товар: ${item.name}`,
      is_complete: false,
      tags: ['component'],
      [activeCategory.slotKey]: item,
    } as unknown as Build

    addItemToCart({ type: 'build', product: localBuild })
    toast.success('Товар добавлен в корзину!')
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (/^\d*$/.test(value)) {
      setPriceRange((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Каталог комплектующих</h1>
        <p className="text-gray-500">
          Настройте фильтры, чтобы найти идеальную деталь или аксессуар.
        </p>
      </div>

      <div className="flex overflow-x-auto custom-scrollbar pb-2 gap-2 mb-6 border-b border-gray-100">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category)} // 3. Используем новую функцию
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-colors text-sm ${activeCategory.id === category.id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-3 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>

        {activeCategory.type === 'component' ? (
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все производители</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="hidden lg:block"></div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            name="min"
            value={priceRange.min}
            onChange={handlePriceChange}
            placeholder="От"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
          />
          <span className="text-gray-300">-</span>
          <input
            type="text"
            name="max"
            value={priceRange.max}
            onChange={handlePriceChange}
            placeholder="До"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
        >
          <option value="-createdAt">Новинки</option>
          <option value="price">Сначала дешевле</option>
          <option value="-price">Сначала дороже</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="bg-white border border-gray-100 rounded-2xl p-4 h-80 animate-pulse"
            >
              <div className="w-full h-40 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-full mt-auto"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl text-gray-500 border border-dashed border-gray-200">
          Ничего не найдено. Попробуйте изменить фильтры.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => {
              const imageUrl =
                item.image && typeof item.image === 'object'
                  ? ((item.image as Media).url ?? null)
                  : null
              const isLastItem = index === items.length - 1

              return (
                <div
                  key={item.id}
                  ref={isLastItem ? ref : null}
                  className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col hover:shadow-xl transition-all group relative"
                >
                  <div className="relative w-full h-44 bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-4">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        sizes="250px"
                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Нет фото</span>
                    )}
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="absolute inset-x-4 bottom-4 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold py-2 rounded-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-lg"
                    >
                      БЫСТРЫЙ ПРОСМОТР
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 h-10 mb-2">
                    {item.name}
                  </h3>
                  <div className="mt-auto pt-4 flex flex-col gap-4">
                    <span className="text-2xl font-black text-gray-900">
                      {formatPrice(item.price ?? 0)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
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
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        ></path>
                      </svg>
                      В КОРЗИНУ
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="py-12 flex justify-center">
            {isLoadingMore && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            )}
          </div>
        </>
      )}

      {selectedItem && (
        <QuickViewModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  )
}

// Обертка Suspense обязательна для компонентов, использующих useSearchParams
export default function CatalogPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-0">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <CatalogContent />
      </Suspense>
    </div>
  )
}

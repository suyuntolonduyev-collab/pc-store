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
import { MAX_CART_ITEM_QUANTITY } from '@/utils/cartConstants'
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

  const totalItemsCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items])

  useEffect(() => {
    setIsMounted(true)
    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/accessories?limit=3&depth=1')
        if (res.ok) {
          const data = await res.json()
          setRecommendations(data.docs)
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error)
      }
    }
    fetchRecommendations()
  }, [])

  // --- Handlers ---
  const handleEditBuild = (cartItemId: string, build: Build) => {
    removeItem(cartItemId)
    setBuilderBuild({
      cpu: typeof build.cpu === 'object' ? build.cpu : null,
      mobo: typeof build.mobo === 'object' ? build.mobo : null,
      gpu: typeof build.gpu === 'object' ? build.gpu : null,
      ram: typeof build.ram === 'object' ? build.ram : null,
      psu: typeof build.psu === 'object' ? build.psu : null,
      case: typeof build['case'] === 'object' ? build['case'] : null,
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
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Ваша корзина пуста</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">Соберите свой идеальный ПК или выберите готовые комплектующие в каталоге.</p>
        <div className="flex gap-4">
          <Link href="/catalog" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-xl transition-colors">В каталог</Link>
          <Link href="/builder" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors">Собрать ПК</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-0">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Корзина</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">Очистить корзину</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map((cartItem) => {
            // Safety check against malformed data in localStorage
            if (!cartItem || !cartItem.item) return null;

            const { id, item, quantity } = cartItem;
            const isExpanded = expandedItemId === id;

            // ==========================================
            // RENDER BUILD
            // ==========================================
            if (item.type === 'build') {
              const build = item.product;
              const singlePrice = getSingleBuildPrice(build);
              const caseData = build['case'] && typeof build['case'] === 'object' ? build['case'] : null;
              const imageUrl = caseData?.image && typeof caseData.image === 'object' ? (caseData.image as Media).url : null;
              
              const buildForChecker = {
                cpu: typeof build.cpu === 'object' ? build.cpu : null,
                mobo: typeof build.mobo === 'object' ? build.mobo : null,
                gpu: typeof build.gpu === 'object' ? build.gpu : null,
                ram: typeof build.ram === 'object' ? build.ram : null,
                psu: typeof build.psu === 'object' ? build.psu : null,
                case: caseData,
                cooler: typeof build.cooler === 'object' ? build.cooler : null,
                storage: typeof build.storage === 'object' ? build.storage : null,
              };
              const compatibilityErrors = checkCompatibility(buildForChecker);
              const hasErrors = compatibilityErrors.some(e => e.type === 'error');

              return (
                <div key={id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 border border-gray-100 rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={build.name || 'Сборка'} fill sizes="128px" className="object-contain p-2" />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          <span className="text-[10px] uppercase font-medium">Сборка</span>
                        </div>
                      )}
                    </div>

                    <div className="grow">
                      <div className={`text-xs font-semibold inline-flex items-center px-2 py-1 rounded-full mb-2 ${hasErrors ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {hasErrors ? '⚠️ Есть несовместимости' : '✅ Совместимость в порядке'}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-1">
                        {build.name || `Сборка #${build.id}`}
                      </h3>
                      <div className="text-xl font-black text-gray-900 mt-2">
                        {formatPrice(singlePrice)}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 mb-0 sm:mb-3">
                        <button onClick={() => decreaseItem(id)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-l-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg></button>
                        <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                        <button onClick={() => cartAddItem({ type: 'build', product: build })} disabled={quantity >= MAX_CART_ITEM_QUANTITY} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></button>
                      </div>
                      <button onClick={() => removeItem(id)} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors p-2 sm:p-0">Удалить</button>
                    </div>

                  </div>
                  
                  <div className="w-full flex flex-wrap gap-x-6 gap-y-3 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => handleEditBuild(id, build)} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Редактировать сборку</button>
                    <button onClick={() => setExpandedItemId(isExpanded ? null : id)} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">{isExpanded ? 'Скрыть детали' : 'Показать детали'}</button>
                  </div>

                  {isExpanded && (
                    <div className="w-full mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                      <h4 className="font-semibold mb-2 text-gray-800">Компоненты сборки:</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                        {Object.entries(build).map(([key, value]) => {
                          if (value && typeof value === 'object' && 'name' in value) {
                            return <li key={key} className="truncate"><strong className="font-medium text-gray-900">{key.toUpperCase()}:</strong> {value.name}</li>
                          }
                          return null;
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            }

            // ==========================================
            // RENDER ACCESSORY (FROM CATALOG / RECOMMENDATIONS)
            // ==========================================
            if (item.type === 'accessory') {
              const accessory = item.product;
              const imageUrl = accessory.image && typeof accessory.image === 'object' ? (accessory.image as Media).url : null;
              
              return (
                <div key={id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 flex items-center gap-6 shadow-sm">
                  <div className="relative w-20 h-20 bg-gray-50 border border-gray-100 rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={accessory.name} fill sizes="80px" className="object-contain p-2" />
                    ) : (
                      <span className="text-[10px] text-gray-400">Нет фото</span>
                    )}
                  </div>
                  <div className="grow">
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">Аксессуар / Комплектующее</span>
                    <h3 className="font-bold text-gray-900 leading-tight mt-2">{accessory.name}</h3>
                    <p className="font-black text-lg text-gray-900 mt-1">{formatPrice(accessory.price ?? 0)}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                      <button onClick={() => decreaseItem(id)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-l-lg transition-colors">-</button>
                      <span className="w-8 text-center font-medium text-gray-900 text-sm">{quantity}</span>
                      <button onClick={() => cartAddItem({ type: 'accessory', product: accessory })} disabled={quantity >= MAX_CART_ITEM_QUANTITY} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50">+</button>
                    </div>
                    <button onClick={() => removeItem(id)} className="text-red-500 hover:text-red-700 p-1 rounded-md transition-colors" title="Удалить">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
        
        {/* Sidebar */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Ваш заказ</h2>
          
          <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Товары ({totalItemsCount} шт.)</span>
              <span className="font-medium text-gray-900">{formatPrice(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Сборка и стресс-тест</span>
              <span className="text-green-600 font-semibold text-sm bg-green-50 px-2 py-0.5 rounded">Бесплатно</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end mb-8">
            <span className="text-lg font-semibold text-gray-900">Итого:</span>
            <span className="text-3xl font-black text-blue-600">{formatPrice(getTotalPrice())}</span>
          </div>
          
          <Link 
            href="/checkout"
            className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-4 px-4 rounded-xl transition-all flex justify-center items-center shadow-md hover:shadow-lg"
          >
            Перейти к оформлению
          </Link>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Сопутствующие товары</h3>
            <div className="space-y-4">
              {recommendations.length > 0 ? recommendations.map(rec => (
                <div key={rec.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm text-gray-800 line-clamp-1">{rec.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{formatPrice(rec.price ?? 0)}</p>
                  </div>
                  <button 
                    onClick={() => handleAddRecommendation(rec)}
                    className="text-xs font-medium bg-gray-100 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-md transition-colors shrink-0"
                  >
                    Добавить
                  </button>
                </div>
              )) : (
               <p className="text-sm text-gray-400">Загрузка рекомендаций...</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

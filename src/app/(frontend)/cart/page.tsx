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
import {
  Trash2,
  Plus,
  Minus,
  Settings2,
  PackageOpen,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Truck,
  ShoppingCart,
} from 'lucide-react'

// Словарь для красивого вывода комплектующих
const SLOT_TITLES: Record<string, string> = {
  cpu: 'Процессор',
  mobo: 'Мат. плата',
  gpu: 'Видеокарта',
  ram: 'Оперативная память',
  psu: 'Блок питания',
  case: 'Корпус',
  cooler: 'Охлаждение',
  storage: 'Накопитель',
}

export default function CartPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Accessory[]>([])

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
        if (res.ok) {
          const data = await res.json()
          setRecommendations(data.docs)
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
      }
    }
    fetchRecommendations()
  }, [])

  // Перенос сборки обратно в конфигуратор
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
    toast('Сборка перенесена обратно в конфигуратор', { icon: '🔧' })
    router.push('/builder')
  }

  const handleAddRecommendation = (rec: Accessory) => {
    cartAddItem({ type: 'accessory', product: rec })
    toast.success(`${rec.name} добавлен`)
  }

  if (!isMounted)
    return (
      <div className="container mx-auto py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )

  if (items.length === 0)
    return (
      <div className="container mx-auto py-20 px-4 flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-[3rem] mt-8 shadow-sm border border-gray-100">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
          <ShoppingCart className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
          Ваша корзина пуста
        </h1>
        <p className="text-gray-500 mb-8 text-center max-w-md font-medium">
          Самое время собрать ПК мечты или заглянуть в каталог готовых решений.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/catalog"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 px-8 rounded-2xl transition-colors text-center"
          >
            Каталог товаров
          </Link>
          <Link
            href="/builder"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-colors text-center shadow-lg shadow-blue-600/20"
          >
            Собрать ПК
          </Link>
        </div>
      </div>
    )

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Корзина</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 font-bold transition-colors flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg"
        >
          <Trash2 className="w-4 h-4" /> Очистить
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* ЛЕВАЯ КОЛОНКА: ТОВАРЫ */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((cartItem) => {
            if (!cartItem || !cartItem.item) return null
            const { id, item, quantity } = cartItem
            const isExpanded = expandedItemId === id

            // --- КАРТОЧКА СБОРКИ ---
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
                  className={`bg-white border-2 rounded-[2rem] p-6 shadow-sm transition-all ${hasErrors ? 'border-red-100' : 'border-gray-100'}`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="relative w-full sm:w-36 h-36 bg-gray-50 border border-gray-100 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={build.name || 'Сборка'}
                          fill
                          sizes="144px"
                          className="object-contain p-2 hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <PackageOpen className="w-12 h-12 text-gray-300" />
                      )}
                    </div>

                    <div className="grow w-full">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <div
                            className={`text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md mb-2 ${hasErrors ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                          >
                            {hasErrors ? (
                              <>
                                <AlertTriangle className="w-3 h-3" /> Требует внимания
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Идеальная совместимость
                              </>
                            )}
                          </div>
                          <h3 className="text-xl font-black text-gray-900 leading-tight">
                            {build.name || `Сборка Custom PC`}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-blue-600">
                            {formatPrice(singlePrice)}
                          </div>
                          {quantity > 1 && (
                            <div className="text-xs text-gray-400 font-medium mt-1">за 1 шт.</div>
                          )}
                        </div>
                      </div>

                      {/* Ошибки сборки выведены явно! */}
                      {hasErrors && (
                        <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
                          <p className="text-xs font-bold text-red-600 mb-1">
                            Обнаружены конфликты:
                          </p>
                          <ul className="text-[10px] font-medium text-red-700 space-y-1">
                            {compatibilityErrors.slice(0, 2).map((e, i) => (
                              <li key={i}>• {e.message}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1">
                          <button
                            onClick={() => decreaseItem(id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-bold text-gray-900">
                            {quantity}
                          </span>
                          <button
                            onClick={() => cartAddItem({ type: 'build', product: build })}
                            disabled={quantity >= MAX_CART_ITEM_QUANTITY}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBuild(id, build)}
                            className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <Settings2 className="w-3.5 h-3.5" /> В конфигуратор
                          </button>
                          <button
                            onClick={() => removeItem(id)}
                            className="text-xs font-bold bg-gray-50 text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Детали сборки */}
                  <div className="w-full mt-4">
                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : id)}
                      className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors w-full text-center py-2 bg-gray-50 rounded-xl"
                    >
                      {isExpanded ? 'Скрыть список деталей' : 'Показать список деталей'}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {Object.entries(build).map(([key, value]) => {
                            if (
                              value &&
                              typeof value === 'object' &&
                              'name' in value &&
                              SLOT_TITLES[key]
                            ) {
                              return (
                                <li
                                  key={key}
                                  className="flex flex-col bg-gray-50 p-2.5 rounded-lg border border-gray-100"
                                >
                                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-0.5">
                                    {SLOT_TITLES[key]}
                                  </span>
                                  <span className="font-bold text-gray-800 truncate">
                                    {value.name}
                                  </span>
                                </li>
                              )
                            }
                            return null
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            // --- КАРТОЧКА АКСЕССУАРА ---
            if (item.type === 'accessory') {
              const accessory = item.product
              const imageUrl =
                accessory.image && typeof accessory.image === 'object'
                  ? (accessory.image as Media).url
                  : null

              return (
                <div
                  key={id}
                  className="bg-white border border-gray-100 rounded-[1.5rem] p-4 flex items-center gap-5 shadow-sm"
                >
                  <div className="relative w-16 h-16 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={accessory.name}
                        fill
                        sizes="64px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <PackageOpen className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="grow">
                    <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">
                      Товар из каталога
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight mt-1 line-clamp-1">
                      {accessory.name}
                    </h3>
                    <p className="font-black text-lg text-gray-900 mt-1">
                      {formatPrice(accessory.price ?? 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1 hidden sm:flex">
                      <button
                        onClick={() => decreaseItem(id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-blue-600 rounded-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900 text-sm">
                        {quantity}
                      </span>
                      <button
                        onClick={() => cartAddItem({ type: 'accessory', product: accessory })}
                        disabled={quantity >= MAX_CART_ITEM_QUANTITY}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-blue-600 rounded-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(id)}
                      className="text-gray-400 hover:text-red-500 p-2 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>

        {/* ПРАВАЯ КОЛОНКА: ОФОРМЛЕНИЕ И АПСЕЙЛ */}
        <div className="space-y-6 sticky top-24">
          {/* ЧЕКАУТ */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col">
            <h2 className="text-xl font-black mb-6 text-gray-900">Сумма заказа</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 text-sm font-medium text-gray-500">
              <div className="flex justify-between">
                <span>Товары ({totalItemsCount} шт.)</span>
                <span className="text-gray-900">{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span>Профессиональная сборка</span>
                <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md">
                  Бесплатно
                </span>
              </div>
              <div className="flex justify-between">
                <span>Стресс-тестирование (24ч)</span>
                <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md">
                  В подарок
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-sm font-black uppercase text-gray-400 tracking-widest">
                К оплате:
              </span>
              <span className="text-4xl font-black text-blue-600 tracking-tight">
                {formatPrice(getTotalPrice())}
              </span>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-gray-900 hover:bg-blue-600 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 flex justify-center items-center gap-2 shadow-xl shadow-gray-900/10 hover:shadow-blue-600/20 active:scale-[0.98]"
            >
              ПЕРЕЙТИ К ОФОРМЛЕНИЮ <span className="text-lg">→</span>
            </Link>

            {/* TRUST BADGES */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-xs font-medium text-gray-500 bg-gray-50 p-3 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" /> Официальная гарантия 3
                года на сборки
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-gray-500 bg-gray-50 p-3 rounded-xl">
                <Truck className="w-5 h-5 text-blue-500 shrink-0" /> Надежная и застрахованная
                доставка
              </div>
            </div>
          </div>

          {/* РЕКОМЕНДАЦИИ */}
          {recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                Добавьте к заказу
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 w-full min-w-0">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg shrink-0 flex items-center justify-center p-1 relative">
                        {rec.image && typeof rec.image === 'object' && (
                          <Image src={rec.image.url!} alt="" fill className="object-contain p-1" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {rec.name}
                        </p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">
                          {formatPrice(rec.price ?? 0)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddRecommendation(rec)}
                      className="bg-gray-100 hover:bg-blue-600 text-gray-600 hover:text-white w-8 h-8 rounded-lg transition-colors shrink-0 flex items-center justify-center shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, Suspense, ComponentType } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import { useBuilderStore } from '@/store/useBuilderStore'
import { getSingleBuildPrice } from '@/utils/getBuildPrice'
import formatPrice from '@/utils/formatPrice'
import {
  Monitor,
  Package,
  Heart,
  Settings,
  LogOut,
  Trash2,
  Edit2,
  Copy,
  ShoppingCart,
  ExternalLink,
  Shield,
  CheckCircle2,
  Clock,
  PackageOpen,
  HeartOff,
  AlertTriangle,
} from 'lucide-react'
import type {
  Build,
  Media,
  User,
  Accessory,
  Processor,
  Motherboard,
  Gpus,
  Ram,
  Psus,
  Case,
  Cooler,
  Storage,
} from '@/payload-types'

// 🟢 1. Строгая типизация для всех компонентов вкладок
type TabComponentProps = { user: User }
type TabComponent = ComponentType<TabComponentProps>

// --- Интерфейсы ---
interface OrderItem {
  id: number
  type: 'build' | 'accessory'
  build?: Build | null
  accessory?: Accessory | null
  quantity: number
}

interface Order {
  id: number
  status: string
  total_price: number
  createdAt: string
  items: OrderItem[]
}

interface WishlistDoc {
  id: number
  user: User | number
  build?: Build | null
  accessory?: Accessory | null
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

type AnyComponent = Processor | Motherboard | Gpus | Ram | Psus | Case | Cooler | Storage

// --- Вспомогательный компонент: Модальное окно деталей сборки ---
const BuildDetailsModal = ({ build, onClose }: { build: Build; onClose: () => void }) => {
  const ComponentRow = ({
    label,
    component,
  }: {
    label: string
    component: AnyComponent | null | undefined | number
  }) => {
    if (!component || typeof component === 'number') return null
    return (
      <div className="flex justify-between py-3 border-b border-gray-100 last:border-0 items-center">
        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest w-1/3">
          {label}
        </span>
        <div className="text-right w-2/3 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-1 sm:gap-4">
          <span className="font-bold text-gray-900 text-sm truncate" title={component.name}>
            {component.name}
          </span>
          <span className="text-blue-600 font-black text-sm whitespace-nowrap">
            {formatPrice(component.price)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h2 className="text-xl font-black text-gray-900">
            {build.name || `Сборка #${build.id}`}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white transition-all"
          >
            &times;
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <ComponentRow label="Процессор" component={build.cpu as Processor} />
          <ComponentRow label="Материнская плата" component={build.mobo as Motherboard} />
          <ComponentRow label="Видеокарта" component={build.gpu as Gpus} />
          <ComponentRow label="Оперативная память" component={build.ram as Ram} />
          <ComponentRow label="Блок питания" component={build.psu as Psus} />
          <ComponentRow label="Корпус" component={build['case'] as Case} />
          <ComponentRow label="Охлаждение" component={build.cooler as Cooler} />
          <ComponentRow label="Накопитель" component={build.storage as Storage} />
        </div>
        <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
          <span className="font-black uppercase tracking-widest text-[10px] text-gray-400">
            Итоговая стоимость:
          </span>
          <span className="text-3xl font-black text-blue-400">
            {formatPrice(getSingleBuildPrice(build))}
          </span>
        </div>
      </div>
    </div>
  )
}

// --- Компонент "Мои сборки" ---
const UserBuilds = ({ user }: TabComponentProps) => {
  const router = useRouter()
  const [builds, setBuilds] = useState<Build[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)

  // Стейты для инлайн-редактирования
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [isSavingName, setIsSavingName] = useState(false)

  const addItemToCart = useCartStore((state) => state.addItem)
  const removeItemFromCart = useCartStore((state) => state.removeItem)
  const setBuild = useBuilderStore((state) => state.setBuild)

  useEffect(() => {
    const fetchUserBuilds = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `/api/builds?where[user][equals]=${user.id}&depth=1&sort=-createdAt`,
          { credentials: 'include' },
        )
        if (res.ok) setBuilds((await res.json()).docs)
      } catch (error) {
        toast.error('Не удалось загрузить список сборок')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserBuilds()
  }, [user.id])

  const handleSaveName = async (id: number) => {
    const trimmedName = editValue.trim()
    const currentBuild = builds.find((b) => b.id === id)

    if (!trimmedName || currentBuild?.name === trimmedName) {
      setEditingId(null)
      return
    }

    setIsSavingName(true)
    try {
      const res = await fetch(`/api/builds/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Ошибка переименования')

      setBuilds((prev) => prev.map((b) => (b.id === id ? { ...b, name: trimmedName } : b)))
      toast.success('Название обновлено')
      setEditingId(null)
    } catch (error) {
      toast.error('Не удалось изменить название')
    } finally {
      setIsSavingName(false)
    }
  }

  const handleRestoreBuildToCart = (build: Build) => {
    addItemToCart({ type: 'build', product: build })
    toast.success('Сборка добавлена в корзину!')
  }

  const handleEdit = (build: Build) => {
    try {
      removeItemFromCart(`build-${build.id}`)
      setBuild({
        cpu: build.cpu as Processor | null,
        mobo: build.mobo as Motherboard | null,
        gpu: build.gpu as Gpus | null,
        ram: build.ram as Ram | null,
        psu: build.psu as Psus | null,
        case: build['case'] as Case | null,
        cooler: build.cooler as Cooler | null,
        storage: build.storage as Storage | null,
      })
      router.push('/builder')
    } catch (error) {
      toast.error('Не удалось загрузить сборку в конфигуратор')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту сборку?')) return
    try {
      const res = await fetch(`/api/builds/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Ошибка удаления')

      setBuilds((prev) => prev.filter((b) => b.id !== id))
      toast.success('Сборка успешно удалена')
    } catch (error) {
      toast.error('Не удалось удалить сборку')
    }
  }

  const handleCopyLink = async (id: number) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/builder?load=${id}`)
      toast.success('Ссылка скопирована в буфер обмена')
    } catch (error) {
      toast.error('Не удалось скопировать ссылку')
    }
  }

  const handleFavorite = async (id: number) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ build: id }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Ошибка')
      toast.success('Сборка добавлена в избранное')
    } catch (error) {
      toast.error('Не удалось добавить в избранное')
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {['sk-1', 'sk-2'].map((key) => (
          <div
            key={key}
            className="bg-white border border-gray-100 rounded-[2rem] p-6 h-48 animate-pulse flex"
          >
            <div className="w-32 h-32 bg-gray-200 rounded-2xl mr-6"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-32 mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (builds.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <Monitor className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-black text-gray-900 mb-2">У вас пока нет сборок</h3>
        <p className="text-gray-500 mb-6">Соберите свой первый ПК в нашем конфигураторе.</p>
        <Link
          href="/builder"
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          Собрать ПК
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {builds.map((build) => {
        const price = getSingleBuildPrice(build)
        const caseData = build['case'] && typeof build['case'] === 'object' ? build['case'] : null
        const imageUrl =
          caseData?.image && typeof caseData.image === 'object'
            ? (caseData.image as Media).url
            : null

        return (
          <div
            key={build.id}
            className="bg-white border border-gray-100 rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-xl transition-all group"
          >
            <div
              className="relative w-full sm:w-36 h-40 sm:h-auto bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => setSelectedBuild(build)}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={build.name || 'Сборка'}
                  fill
                  sizes="(max-width: 640px) 100vw, 128px"
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Monitor className="w-8 h-8 mb-1" />
                  <span className="text-[10px] uppercase font-bold">Нет фото</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-md">
                  Детали
                </span>
              </div>
            </div>

            <div className="flex-grow flex flex-col">
              <div className="flex justify-between items-start gap-4">
                {editingId === build.id ? (
                  <div className="flex items-center gap-2 mb-2 w-full max-w-sm">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      disabled={isSavingName}
                      autoFocus
                      maxLength={50}
                      className="flex-1 bg-gray-50 border border-blue-500 rounded-lg px-3 py-1.5 text-sm font-bold outline-none disabled:bg-gray-100"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName(build.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                    <button
                      onClick={() => handleSaveName(build.id)}
                      disabled={isSavingName}
                      className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      disabled={isSavingName}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2 group/title">
                    <h3 className="text-lg font-black text-gray-900 leading-tight truncate max-w-[200px] sm:max-w-xs">
                      {build.name || `Сборка #${build.id}`}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingId(build.id)
                        setEditValue(build.name || '')
                      }}
                      className="text-gray-300 hover:text-blue-600 p-1 transition-colors opacity-0 group-hover/title:opacity-100 focus:opacity-100 sm:opacity-100"
                      title="Редактировать название"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
                {build.is_complete && (
                  <span className="bg-green-50 text-green-600 text-[10px] uppercase font-black px-2 py-1 rounded-md shrink-0 mt-0.5">
                    Собрана
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-gray-500 line-clamp-2">
                {typeof build.cpu === 'object' && build.cpu ? (
                  <>
                    {build.cpu.name}{' '}
                    {typeof build.gpu === 'object' && build.gpu ? ` • ${build.gpu.name}` : ''}
                  </>
                ) : (
                  'Детали скрыты'
                )}
              </p>

              <div className="mt-auto pt-4 flex flex-col gap-4">
                <span className="text-2xl font-black text-gray-900">{formatPrice(price)}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestoreBuildToCart(build)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-black py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2"
                  >
                    <ShoppingCart size={16} /> В КОРЗИНУ
                  </button>
                  <button
                    onClick={() => handleEdit(build)}
                    title="В конфигуратор"
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-colors shrink-0"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={() => handleCopyLink(build.id)}
                    title="Скопировать ссылку"
                    className="hidden sm:flex w-10 h-10 items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors shrink-0"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleFavorite(build.id)}
                    title="В избранное"
                    className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors shrink-0"
                  >
                    <Heart size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(build.id)}
                    title="Удалить"
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {selectedBuild && (
        <BuildDetailsModal build={selectedBuild} onClose={() => setSelectedBuild(null)} />
      )}
    </div>
  )
}

// --- Компонент "Мои заказы" ---
const UserOrders = ({ user }: TabComponentProps) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
  const cartAddItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchUserOrders = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `/api/orders?where[user][equals]=${user.id}&depth=2&sort=-createdAt`,
          { credentials: 'include' },
        )
        if (res.ok) setOrders((await res.json()).docs)
      } catch (error) {
        // Ошибка обрабатывается молча
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserOrders()
  }, [user.id])

  const handleReorder = (order: Order) => {
    if (!order.items) return
    order.items.forEach((orderItem) => {
      if (orderItem.type === 'build' && orderItem.build) {
        cartAddItem({ type: 'build', product: orderItem.build })
      } else if (orderItem.type === 'accessory' && orderItem.accessory) {
        cartAddItem({ type: 'accessory', product: orderItem.accessory })
      }
    })
    toast.success('Все товары из заказа добавлены в корзину!')
  }

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-600'
      case 'paid':
        return 'bg-blue-50 text-blue-600'
      case 'shipped':
        return 'bg-indigo-50 text-indigo-600'
      case 'delivered':
        return 'bg-green-50 text-green-600'
      case 'cancelled':
        return 'bg-red-50 text-red-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {['sk-ord-1', 'sk-ord-2'].map((key) => (
          <div
            key={key}
            className="bg-white border border-gray-100 rounded-[2rem] p-8 h-40 animate-pulse"
          ></div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-black text-gray-900 mb-2">У вас пока нет заказов</h3>
        <p className="text-gray-500">История ваших покупок появится здесь.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id
        const statusSteps = ['pending', 'paid', 'shipped', 'delivered']
        const currentStepIndex = statusSteps.indexOf(order.status)
        const isCancelled = order.status === 'cancelled'

        return (
          <div
            key={order.id}
            className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8 hover:border-blue-200 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-black text-xl text-gray-900">
                    Заказ #{String(order.id).slice(-6).toUpperCase()}
                  </h3>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${getStatusChip(order.status)}`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                  <Clock size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Сумма заказа
                </span>
                <span className="text-3xl font-black text-gray-900 tracking-tight">
                  {formatPrice(order.total_price)}
                </span>
              </div>
            </div>

            {/* Таймлайн */}
            {!isCancelled && (
              <div className="flex items-center gap-2 mb-8 bg-gray-50 p-4 rounded-2xl">
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex
                  return (
                    <div key={step} className="flex-1 flex flex-col gap-2 relative">
                      <div
                        className={`h-2 rounded-full transition-colors ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
                      />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}
                      >
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl transition-colors"
              >
                {isExpanded ? 'СКРЫТЬ СОСТАВ' : 'ЧТО ВНУТРИ?'}
              </button>
              <button
                onClick={() => handleReorder(order)}
                className="text-xs font-bold bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
              >
                <ShoppingCart size={14} /> Повторить заказ
              </button>
            </div>

            {isExpanded && (
              <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4">
                <h4 className="font-bold mb-4 text-gray-900 text-[10px] uppercase tracking-widest">
                  Состав заказа:
                </h4>
                <div className="space-y-3">
                  {order.items.map((item) => {
                    const product = item.type === 'build' ? item.build : item.accessory
                    if (!product) return null
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                            {item.type === 'build' ? (
                              <Monitor size={18} className="text-blue-500" />
                            ) : (
                              <Package size={18} className="text-purple-500" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-gray-900 block">
                              {product.name || `Товар #${product.id}`}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {item.type === 'build' ? 'Сборка ПК' : 'Аксессуар'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-900 font-black block">
                            {formatPrice(
                              item.type === 'build'
                                ? getSingleBuildPrice(product as Build)
                                : (product as Accessory).price || 0,
                            )}
                          </span>
                          <span className="text-gray-500 font-bold text-[10px]">
                            {item.quantity} ШТ.
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// --- Компонент "Избранное" ---
const UserWishlist = ({ user }: TabComponentProps) => {
  const router = useRouter()
  const [wishlist, setWishlist] = useState<WishlistDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)

  const cartAddItem = useCartStore((state) => state.addItem)
  const cartRemoveItem = useCartStore((state) => state.removeItem)
  const setBuild = useBuilderStore((state) => state.setBuild)

  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `/api/wishlist?where[user][equals]=${user.id}&depth=2&sort=-createdAt`,
          { credentials: 'include' },
        )
        if (res.ok) setWishlist((await res.json()).docs)
      } catch (error) {
        toast.error('Не удалось загрузить избранное')
      } finally {
        setIsLoading(false)
      }
    }
    fetchWishlist()
  }, [user.id])

  const handleRemove = async (id: number) => {
    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Ошибка удаления')
      setWishlist((prev) => prev.filter((item) => item.id !== id))
      toast.success('Удалено из избранного')
    } catch (error) {
      toast.error('Не удалось удалить товар')
    }
  }

  const handleAddToCart = (item: WishlistDoc) => {
    if (item.build) {
      cartAddItem({ type: 'build', product: item.build })
      toast.success('Сборка добавлена в корзину')
    } else if (item.accessory) {
      cartAddItem({ type: 'accessory', product: item.accessory })
      toast.success('Аксессуар добавлен в корзину')
    }
  }

  const handleEdit = (build: Build) => {
    try {
      cartRemoveItem(`build-${build.id}`)
      setBuild({
        cpu: build.cpu as Processor | null,
        mobo: build.mobo as Motherboard | null,
        gpu: build.gpu as Gpus | null,
        ram: build.ram as Ram | null,
        psu: build.psu as Psus | null,
        case: build['case'] as Case | null,
        cooler: build.cooler as Cooler | null,
        storage: build.storage as Storage | null,
      })
      router.push('/builder')
    } catch (error) {
      toast.error('Не удалось загрузить сборку в конфигуратор')
    }
  }

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['sk-w-1', 'sk-w-2', 'sk-w-3'].map((key) => (
          <div
            key={key}
            className="bg-white border border-gray-100 rounded-[2rem] p-4 h-64 animate-pulse"
          ></div>
        ))}
      </div>
    )

  if (wishlist.length === 0)
    return (
      <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
        <HeartOff className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-black text-gray-900 mb-2">В избранном пока пусто</h3>
        <p className="text-gray-500 mb-6">Добавляйте товары или сборки, чтобы не потерять их.</p>
        <Link href="/catalog" className="bg-gray-900 text-white font-black py-3 px-8 rounded-xl">
          В КАТАЛОГ
        </Link>
      </div>
    )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map((item) => {
        const isBuild = !!item.build
        const product = isBuild ? item.build : item.accessory
        if (!product) return null

        let price = 0
        if (isBuild) {
          const build = product as Build
          price = getSingleBuildPrice(build)
          // Фолбэк на случай если getSingleBuildPrice вернет 0
          if (price === 0) {
            const slots: (keyof Build)[] = [
              'cpu',
              'mobo',
              'gpu',
              'ram',
              'psu',
              'case',
              'cooler',
              'storage',
            ]
            for (const slot of slots) {
              const comp = build[slot]
              if (comp && typeof comp === 'object' && 'price' in comp)
                price += Number(comp.price) || 0
            }
          }
        } else {
          price = (product as Accessory).price || 0
        }

        let imageUrl: string | null = null
        if (isBuild) {
          const build = product as Build
          const slots: (keyof Build)[] = [
            'case',
            'cpu',
            'gpu',
            'mobo',
            'ram',
            'cooler',
            'psu',
            'storage',
          ]
          for (const slot of slots) {
            const comp = build[slot]
            if (
              comp &&
              typeof comp === 'object' &&
              'image' in comp &&
              comp.image &&
              typeof comp.image === 'object'
            ) {
              imageUrl = (comp.image as Media).url || null
              if (imageUrl) break
            }
          }
        } else {
          const accessory = product as Accessory
          if (accessory.image && typeof accessory.image === 'object')
            imageUrl = (accessory.image as Media).url || null
        }

        return (
          <div
            key={item.id}
            className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl transition-all flex flex-col group"
          >
            <div className="relative h-48 bg-gray-50 border border-gray-100 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.name || 'Товар'}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-4 group-hover:scale-105 transition-transform"
                />
              ) : (
                <PackageOpen size={40} className="text-gray-200" />
              )}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 border border-gray-100">
                {isBuild ? 'Сборка ПК' : 'Комплектующее'}
              </div>
            </div>

            <h3
              className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2"
              title={product.name || ''}
            >
              {product.name || (isBuild ? `Сборка #${product.id}` : `Товар #${product.id}`)}
            </h3>

            <p className="text-xl font-black text-blue-600 mt-auto pt-4 mb-3">
              {formatPrice(price)}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handleAddToCart(item)}
                className="flex-1 bg-gray-900 hover:bg-blue-600 text-white text-[11px] font-black py-2.5 rounded-xl transition-all"
              >
                В КОРЗИНУ
              </button>
              {isBuild && (
                <button
                  onClick={() => setSelectedBuild(product as Build)}
                  title="Спецификация"
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
                >
                  <ExternalLink size={16} />
                </button>
              )}
              {isBuild && (
                <button
                  onClick={() => handleEdit(product as Build)}
                  title="В конфигуратор"
                  className="w-10 h-10 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all"
                >
                  <Settings size={16} />
                </button>
              )}
              <button
                onClick={() => handleRemove(item.id)}
                title="Удалить"
                className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )
      })}
      {selectedBuild && (
        <BuildDetailsModal build={selectedBuild} onClose={() => setSelectedBuild(null)} />
      )}
    </div>
  )
}

// --- Компонент "Настройки" ---
const UserSettings = ({ user }: TabComponentProps) => {
  const { fetchMe, logout } = useAuthStore()
  const router = useRouter()

  const [name, setName] = useState(user.name || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (!pass) return 0
    if (pass.length > 5) score += 1
    if (pass.length > 7) score += 1
    if (/[A-Z]/.test(pass) || /[А-ЯЁ]/.test(pass)) score += 1
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9А-ЯЁа-яё]/.test(pass)) score += 1
    return Math.min(score, 4)
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthLabels = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Надёжный']
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-400',
    'bg-blue-500',
    'bg-green-500',
  ]

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || trimmedName === user.name) return

    setIsSavingProfile(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Ошибка обновления профиля')
      toast.success('Данные профиля обновлены')
      await fetchMe()
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 2500)
    } catch (error) {
      toast.error('Не удалось обновить профиль')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Новые пароли не совпадают')
      return
    }
    if (password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов')
      return
    }
    if (!window.confirm('Вы уверены, что хотите изменить пароль?')) return

    setIsSavingPassword(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, oldPassword: currentPassword }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Ошибка смены пароля')
      toast.success('Пароль успешно изменен')
      setCurrentPassword('')
      setPassword('')
      setConfirmPassword('')
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 2500)
    } catch (error) {
      toast.error('Не удалось изменить пароль. Проверьте текущий пароль.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Это действие необратимо. Чтобы подтвердить удаление аккаунта, введите слово "УДАЛИТЬ":',
    )
    if (confirmation !== 'УДАЛИТЬ') {
      if (confirmation !== null) toast.error('Введено неверное слово. Удаление отменено.')
      return
    }
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Ошибка удаления аккаунта')
      toast.success('Аккаунт успешно удален')
      logout()
      router.push('/')
    } catch (error) {
      toast.error('Не удалось удалить аккаунт')
      setIsDeleting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Форма личных данных */}
      <div
        className={`bg-white border transition-colors duration-500 rounded-[2.5rem] p-8 sm:p-10 shadow-sm ${profileSuccess ? 'border-green-500 ring-4 ring-green-50' : 'border-gray-100'}`}
      >
        <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <Shield className="text-blue-500" /> Личные данные
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">
              Email (Логин)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-500 font-bold outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">
              Ваше имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-black text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSavingProfile || name.trim() === user.name}
            className="w-full bg-gray-900 hover:bg-blue-600 disabled:bg-gray-300 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98]"
          >
            {isSavingProfile ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ ИЗМЕНЕНИЯ'}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-8">
        {/* Форма смены пароля */}
        <div
          className={`bg-white border transition-colors duration-500 rounded-[2.5rem] p-8 sm:p-10 shadow-sm ${passwordSuccess ? 'border-green-500 ring-4 ring-green-50' : 'border-gray-100'}`}
        >
          <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <Settings className="text-gray-400" /> Смена пароля
          </h3>
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">
                Текущий пароль
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">
                Новый пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:border-blue-500 outline-none"
                required
                minLength={6}
              />
              {password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 transition-all duration-300 ${i < passwordStrength ? strengthColors[passwordStrength] : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${passwordStrength < 2 ? 'text-red-500' : passwordStrength < 3 ? 'text-yellow-600' : 'text-green-600'}`}
                  >
                    Сложность: {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">
                Подтвердите пароль
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:border-blue-500 outline-none"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isSavingPassword || !currentPassword || !password || !confirmPassword}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-black py-4 rounded-2xl transition-all"
            >
              {isSavingPassword ? 'ОБНОВЛЕНИЕ...' : 'ОБНОВИТЬ ПАРОЛЬ'}
            </button>
          </form>
        </div>

        {/* Удаление аккаунта */}
        <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-8 sm:p-10 shadow-sm">
          <h3 className="text-xl font-black text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Опасная зона
          </h3>
          <p className="text-sm font-medium text-red-600/80 mb-6">
            Удаление аккаунта приведет к безвозвратной потере всех ваших сохраненных сборок, истории
            заказов и списка избранного.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-black py-4 rounded-2xl transition-all"
          >
            {isDeleting ? 'УДАЛЕНИЕ...' : 'УДАЛИТЬ АККАУНТ НАВСЕГДА'}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Главный рендер вкладок ---
const TABS: { id: string; label: string; icon: any; component: TabComponent }[] = [
  { id: 'builds', label: 'Мои сборки', icon: Monitor, component: UserBuilds },
  { id: 'orders', label: 'Мои заказы', icon: Package, component: UserOrders },
  { id: 'wishlist', label: 'Избранное', icon: Heart, component: UserWishlist },
  { id: 'settings', label: 'Настройки', icon: Settings, component: UserSettings },
]

function ProfileContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, logout } = useAuthStore()

  const activeTabId = params.get('tab') || 'builds'
  const ActiveComponent = TABS.find((tab) => tab.id === activeTabId)?.component || UserBuilds

  const handleLogout = () => {
    logout()
    toast.success('Вы успешно вышли из аккаунта')
    router.push('/')
  }

  if (!user)
    return (
      <div className="container mx-auto py-32 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-black mb-4">Доступ закрыт</h1>
        <p className="text-gray-500 mb-8 font-medium">
          Пожалуйста, войдите в аккаунт, чтобы просмотреть профиль.
        </p>
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl shadow-lg shadow-blue-600/20"
        >
          ВОЙТИ В АККАУНТ
        </Link>
      </div>
    )

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* 🚀 ПРЕМИАЛЬНАЯ ШАПКА ПРОФИЛЯ */}
      <div className="relative bg-gray-900 rounded-[3rem] p-8 sm:p-12 mb-10 overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-6 text-center sm:text-left w-full">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-4xl sm:text-5xl font-black uppercase shadow-inner border-4 border-gray-800 rotate-3">
            {user.name ? user.name.charAt(0) : user.email?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg inline-block mb-3">
              Личный кабинет
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
              {user.name || 'Пользователь'}
            </h1>
            <p className="text-gray-400 font-medium flex items-center justify-center sm:justify-start gap-2">
              {user.email} <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Онлайн" />
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="relative z-10 bg-gray-800 hover:bg-red-500/10 hover:text-red-400 text-gray-300 font-bold px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2 border border-gray-700 hover:border-red-500/30 shrink-0"
        >
          <LogOut size={18} /> Выйти
        </button>
      </div>

      {/* 🚀 СОВРЕМЕННЫЕ ВКЛАДКИ (Pills) */}
      <div className="flex flex-wrap gap-3 mb-10 border-b border-gray-100 pb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTabId === tab.id
          return (
            <Link
              key={tab.id}
              href={`/profile?tab=${tab.id}`}
              scroll={false}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                isActive
                  ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10 translate-y-[-2px]'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 hover:border-gray-200'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ActiveComponent user={user} />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  if (!isMounted)
    return (
      <div className="container py-32 flex justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  return (
    <Suspense
      fallback={<div className="container py-32 text-center font-bold">Загрузка профиля...</div>}
    >
      <ProfileContent />
    </Suspense>
  )
}

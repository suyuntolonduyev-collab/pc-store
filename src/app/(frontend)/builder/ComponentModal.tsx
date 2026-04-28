'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import {
  Search,
  X,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Star,
  Zap,
  Wrench,
  Package,
  Cpu,
  Gamepad2,
  Info,
  Wand2,
} from 'lucide-react'
import { useBuilderStore, type BuildSlots, type ComponentValue } from '@/store/useBuilderStore'
import { useDebounce } from '@/hooks/useDebounce'
import type { Media } from '@/payload-types'
import formatPrice from '@/utils/formatPrice'

// 🟢 1. Четкое определение интерфейса пропсов для устранения ошибок TS
interface ComponentModalProps {
  slotKey: keyof BuildSlots
  onClose: () => void
  onSelect: (component: ComponentValue) => void
}

type ReasonType = 'critical' | 'warning' | 'info'
interface Reason {
  type: ReasonType
  message: string
}
type CompScore = 0 | 1 | 2

const apiCache = new Map<string, any>()

const collectionMap: Record<keyof BuildSlots, string> = {
  cpu: 'processors',
  mobo: 'motherboards',
  gpu: 'gpus',
  ram: 'ram',
  psu: 'psus',
  case: 'cases',
  cooler: 'coolers',
  storage: 'storage',
}

const COOLER_SOCKET_FIELD: Record<string, string> = {
  LGA1700: 'supports_lga1700',
  LGA1200: 'supports_lga1200',
  AM4: 'supports_am4',
  AM5: 'supports_am5',
}

// Вспомогательные функции для Tier-системы
const getCpuTier = (cpu: any) => {
  if (!cpu) return 0
  const m = cpu.fps_multiplier || 1
  if (m >= 1.2) return 4
  if (m >= 1.0) return 3
  if (m >= 0.8) return 2
  return 1
}

const getGpuTier = (gpu: any) => {
  if (!gpu) return 0
  const fps = gpu.fps_presets?.aaa || 0
  if (fps >= 120) return 4
  if (fps >= 80) return 3
  if (fps >= 60) return 2
  return 1
}

export default function ComponentModal({ slotKey, onClose, onSelect }: ComponentModalProps) {
  const [rawComponents, setRawComponents] = useState<ComponentValue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [onlyCompatible, setOnlyCompatible] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 300)
  const build = useBuilderStore((state) => state.build)
  const selectComponent = useBuilderStore((state) => state.selectComponent)
  const getTotalWattage = useBuilderStore((state) => state.getTotalWattage)

  // ⚙️ Слой 1: Загрузка данных (с кэшированием)
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setIsLoading(true)
        const collection = collectionMap[slotKey]
        const url = `/api/${collection}?limit=150&depth=1`

        if (apiCache.has(url)) {
          setRawComponents(apiCache.get(url))
          return
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error('API Error')
        const data = await res.json()
        apiCache.set(url, data.docs)
        setRawComponents(data.docs)
      } catch (err) {
        toast.error('Ошибка загрузки данных')
      } finally {
        setIsLoading(false)
      }
    }
    fetchComponents()
  }, [slotKey])

  // ⚙️ Слой 2: Индексация для быстрого поиска
  const indexedComponents = useMemo(() => {
    return rawComponents.map((item) => ({
      item: item as any,
      searchString:
        `${(item as any).name} ${typeof (item as any).brand === 'object' ? (item as any).brand.name : ''} ${(item as any).socket || ''}`.toLowerCase(),
    }))
  }, [rawComponents])

  // ⚙️ Слой 3: Контекстный анализ (Score & Bottleneck)
  const processedComponents = useMemo(() => {
    const q = debouncedSearch.toLowerCase()

    return indexedComponents
      .filter(({ searchString, item }) => {
        if (q && !searchString.includes(q)) return false
        if (inStockOnly && (item.stock_quantity ?? 0) <= 0) return false
        return true
      })
      .map(({ item }) => {
        const reasons: Reason[] = []
        let compScore = 100
        let balanceScore = 100

        // Проверки совместимости на основе твоих коллекций (mm, sockets, types)
        if (item.stock_quantity !== undefined && item.stock_quantity <= 0) {
          compScore = 0
          reasons.push({ type: 'critical', message: 'Нет в наличии' })
        }

        if (slotKey === 'cpu' && build.mobo?.socket && item.socket !== build.mobo.socket) {
          compScore = 0
          reasons.push({ type: 'critical', message: `Нужен сокет ${build.mobo.socket}` })
        }

        if (slotKey === 'mobo' && build.cpu?.socket && item.socket !== build.cpu.socket) {
          compScore = 0
          reasons.push({ type: 'critical', message: `Не подходит к CPU (${build.cpu.socket})` })
        }

        if (
          slotKey === 'gpu' &&
          build.case?.max_gpu_length_mm &&
          item.length_mm > build.case.max_gpu_length_mm
        ) {
          compScore = 0
          reasons.push({ type: 'critical', message: 'Не влезет по длине в корпус' })
        }

        if (slotKey === 'cooler') {
          if (
            build.case?.max_cooler_height_mm &&
            item.height_mm > build.case.max_cooler_height_mm
          ) {
            compScore = 0
            reasons.push({ type: 'critical', message: 'Слишком высокий для корпуса' })
          }
          if (build.cpu?.socket) {
            const norm = build.cpu.socket.replace(/[^a-z0-9]/gi, '').toUpperCase()
            const field = COOLER_SOCKET_FIELD[norm]
            if (field && !item[field]) {
              compScore = 0
              reasons.push({ type: 'critical', message: `Нет креплений для ${build.cpu.socket}` })
            }
          }
        }

        // Bottleneck Engine
        if (slotKey === 'gpu' && build.cpu) {
          const cpuTier = getCpuTier(build.cpu)
          const gpuTier = getGpuTier(item)
          if (gpuTier > cpuTier + 1) {
            balanceScore -= 40
            reasons.push({
              type: 'warning',
              message: 'Процессор может ограничивать эту видеокарту',
            })
          }
        }

        const isCritical = compScore === 0
        const finalScore = isCritical ? 0 : balanceScore > 70 ? 2 : 1

        return { item, reasons, isCritical, finalScore, balanceScore }
      })
      .filter((c) => !onlyCompatible || !c.isCritical)
      .sort((a, b) => b.finalScore - a.finalScore || b.item.price - a.item.price)
  }, [indexedComponents, build, debouncedSearch, onlyCompatible, inStockOnly, slotKey])

  const recommendedId = processedComponents.find((c) => !c.isCritical)?.item.id

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] max-w-6xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Хедер и поиск */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">ВЫБОР КОМПОНЕНТА</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Начните вводить название..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setOnlyCompatible(!onlyCompatible)}
                className={`px-4 py-2 rounded-xl font-bold text-xs border transition-all ${onlyCompatible ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}
              >
                Совместимые
              </button>
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-4 py-2 rounded-xl font-bold text-xs border transition-all ${inStockOnly ? 'bg-green-600 text-white' : 'bg-white text-gray-500'}`}
              >
                В наличии
              </button>
            </div>
          </div>
        </div>

        {/* Список */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {processedComponents.map(
                ({ item, reasons, isCritical, finalScore, balanceScore }) => {
                  const imageUrl =
                    typeof item.image === 'object' && item.image !== null ? item.image.url : null
                  const isRecommended = item.id === recommendedId

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelect(item)}
                      className={`group relative bg-white border-2 rounded-[1.5rem] p-5 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col ${
                        isCritical
                          ? 'border-red-100 opacity-60'
                          : 'border-transparent hover:border-blue-400 shadow-sm'
                      }`}
                    >
                      {isRecommended && (
                        <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-[10px] font-black uppercase py-1.5 text-center z-10 flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 fill-white" /> РЕКОМЕНДУЕМ
                        </div>
                      )}

                      <div
                        className={`relative h-32 mb-4 flex items-center justify-center rounded-xl bg-gray-50/50 overflow-hidden ${isRecommended ? 'mt-4' : ''}`}
                      >
                        {/* 🔴 Исправлена ошибка с пустым src */}
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            fill
                            sizes="200px"
                            className={`object-contain p-3 transition-transform group-hover:scale-110 ${isCritical ? 'grayscale' : ''}`}
                          />
                        ) : (
                          <Package className="w-10 h-10 text-gray-200" />
                        )}
                      </div>

                      <h3 className="font-bold text-xs text-gray-900 line-clamp-2 mb-3 grow">
                        {item.name}
                      </h3>

                      {/* Визуальный баланс */}
                      {!isCritical && (
                        <div className="h-1 w-full bg-gray-100 rounded-full mb-4 overflow-hidden">
                          <div
                            className={`h-full transition-all ${balanceScore < 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
                            style={{ width: `${balanceScore}%` }}
                          />
                        </div>
                      )}

                      {reasons.length > 0 && (
                        <div className="space-y-1 mb-4">
                          {reasons.map((r, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-1.5 text-[10px] font-bold ${r.type === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}
                            >
                              <AlertTriangle className="w-3 h-3 shrink-0" /> {r.message}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                        <span className="font-black text-gray-900 text-lg">
                          {formatPrice(item.price)}
                        </span>
                        <button className="p-2 bg-gray-100 text-gray-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

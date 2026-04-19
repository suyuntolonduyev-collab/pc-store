'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useBuilderStore, type BuildSlots, type ComponentValue } from '@/store/useBuilderStore'
import type { Media } from '@/payload-types'
import formatPrice from '@/utils/formatPrice'

interface ComponentModalProps {
  slotKey: keyof BuildSlots
  onClose: () => void
  onSelect: (component: ComponentValue) => void
}

// Минимальный интерфейс, общий для всех типов ComponentValue.
// Все коллекции содержат эти поля — подтверждено схемами.
interface ComponentBase {
  id: number
  name: string
  price: number
  image?: number | Media | null
}

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

// Маппинг сокета CPU на поле фильтра кулера.
// Типизирован через Processor['socket'] — только реальные значения select-поля.
const COOLER_SOCKET_FIELD: Partial<Record<'LGA1700' | 'LGA1200' | 'AM4' | 'AM5' | 'TR4', string>> =
  {
    LGA1700: 'supports_lga1700',
    AM4: 'supports_am4',
    AM5: 'supports_am5',
  }

export default function ComponentModal({ slotKey, onClose, onSelect }: ComponentModalProps) {
  const [components, setComponents] = useState<ComponentValue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const build = useBuilderStore((state) => state.build)

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const collection = collectionMap[slotKey]
        // depth=1 обязателен — без него image приходит как number, не объект
        let queryString = `?limit=50&depth=1`

        // Фильтр материнской платы по сокету CPU
        // socket — select-поле, прямая строка, никакого typeof === 'object'
        if (slotKey === 'mobo' && build.cpu) {
          queryString += `&where[socket][equals]=${build.cpu.socket}`
        }

        // Фильтр RAM по типу памяти (пересечение CPU и материнской платы)
        if (slotKey === 'ram') {
          const cpuDdr4 = build.cpu?.supports_ddr4 ?? true
          const cpuDdr5 = build.cpu?.supports_ddr5 ?? false
          const moboDdr4 = build.mobo?.supports_ddr4 ?? true
          const moboDdr5 = build.mobo?.supports_ddr5 ?? false

          // Только DDR5 — если оба компонента поддерживают и не поддерживают DDR4
          if (cpuDdr5 && moboDdr5 && !cpuDdr4 && !moboDdr4) {
            queryString += `&where[type][equals]=DDR5`
          } else if (cpuDdr4 && moboDdr4 && !cpuDdr5 && !moboDdr5) {
            queryString += `&where[type][equals]=DDR4`
          }
          // Если оба поддерживают оба типа — не фильтруем, показываем всё
        }

        // Фильтр кулера по сокету CPU
        // Используем реальные булевы поля: supports_lga1700 / supports_am4 / supports_am5
        if (slotKey === 'cooler' && build.cpu) {
          const field = COOLER_SOCKET_FIELD[build.cpu.socket]
          if (field) {
            queryString += `&where[${field}][equals]=true`
          }
        }

        // Фильтр PSU по мощности
        // Поле: wattage (не power), оператор: greater_than_or_equal (не greater_than_equal)
        if (slotKey === 'psu') {
          const requiredWattage = useBuilderStore.getState().getTotalWattage()
          if (requiredWattage > 0) {
            const whereClause = JSON.stringify({ wattage: { greater_than_or_equal: Math.ceil(requiredWattage) } })
queryString += `&where=${encodeURIComponent(whereClause)}`
          }
        }

        const res = await fetch(`/api/${collection}${queryString}`)
        if (!res.ok) throw new Error('Ошибка загрузки компонентов')

        const data = (await res.json()) as { docs: ComponentValue[] }
        setComponents(data.docs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      } finally {
        setIsLoading(false)
      }
    }

    fetchComponents()
  }, [slotKey, build.cpu, build.mobo])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-50 rounded-xl max-w-4xl w-full p-6 max-h-[90vh] flex flex-col relative shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Выберите компонент</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : components.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Ничего не найдено (проверьте совместимость)
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {components.map((comp) => {
                // Приведение к ComponentBase — безопасно, все коллекции содержат эти поля
                const item = comp as unknown as ComponentBase
                // image: number | Media | null — после depth=1 это объект Media
                const imageUrl =
                  typeof item.image === 'object' && item.image !== null ? item.image.url : null

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelect(comp)}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group bg-white flex flex-col"
                  >
                    {imageUrl ? (
                      <div className="relative w-full h-32 mb-4 bg-gray-50 rounded overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 mb-4 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">
                        Нет фото
                      </div>
                    )}

                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 grow">
                      {item.name}
                    </h3>

                    <div className="flex justify-end items-end mt-4 pt-2 border-t border-gray-100">
                      <span className="font-bold text-gray-900 text-lg">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

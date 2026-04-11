'use client'

import { useEffect, useState } from 'react'
import { type BuildSlots } from '@/store/useBuilderStore'
import formatPrice from '@/utils/formatPrice'
import type {
  Processor,
  Motherboard,
  Gpus,
  Ram,
  Psus,
  Case,
  Cooler,
  Storage,
} from '@/payload-types'

type BuildComponent = Processor | Motherboard | Gpus | Ram | Psus | Case | Cooler | Storage

interface ComponentModalProps {
  slotKey: keyof BuildSlots
  onClose: () => void
  onSelect: (component: any) => void // Используем any временно для onSelect, так как TS сложно вывести конкретный тип из дженерика в рантайме
}

// Маппинг ключей слотов на эндпоинты Payload CMS
const ENDPOINTS: Record<keyof BuildSlots, string> = {
  cpu: 'processors',
  mobo: 'motherboards',
  gpu: 'gpus',
  ram: 'ram',
  psu: 'psus',
  case: 'cases',
  cooler: 'coolers',
  storage: 'storage',
}

const TITLES: Record<keyof BuildSlots, string> = {
  cpu: 'Выберите процессор',
  mobo: 'Выберите материнскую плату',
  gpu: 'Выберите видеокарту',
  ram: 'Выберите оперативную память',
  psu: 'Выберите блок питания',
  case: 'Выберите корпус',
  cooler: 'Выберите охлаждение',
  storage: 'Выберите накопитель',
}

export default function ComponentModal({ slotKey, onClose, onSelect }: ComponentModalProps) {
  const [items, setItems] = useState<BuildComponent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Пагинация Payload
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchComponents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Запрос к REST API Payload
        const res = await fetch(`/api/${ENDPOINTS[slotKey]}?page=${page}&limit=10`)

        if (!res.ok) {
          throw new Error('Ошибка при загрузке компонентов')
        }

        const data = await res.json()
        setItems(data.docs)
        setTotalPages(data.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      } finally {
        setIsLoading(false)
      }
    }

    fetchComponents()
  }, [slotKey, page])

  // Закрытие по клику на фон
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">{TITLES[slotKey]}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-center">{error}</div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg w-full"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Компоненты не найдены.</div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-300 transition-colors shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-lg leading-tight mb-1">
                      {item.name}
                    </span>
                    {/* Базовое описание, если оно есть в коллекции */}
                    {'description' in item && item.description && (
                      <span className="text-sm text-gray-500 line-clamp-1">{item.description}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    <span className="font-bold text-gray-900 whitespace-nowrap text-lg">
                      {formatPrice(item.price)}
                    </span>
                    <button
                      onClick={() => onSelect(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors whitespace-nowrap"
                    >
                      Выбрать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center gap-4 bg-white rounded-b-xl">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 font-medium"
            >
              Назад
            </button>
            <span className="py-2 text-gray-600 font-medium">
              Страница {page} из {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 font-medium"
            >
              Вперед
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

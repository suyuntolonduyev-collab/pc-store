'use client'

import { memo } from 'react'
import Image from 'next/image'
import type { BuildSlots, ComponentValue } from '@/store/useBuilderStore'
import formatPrice from '@/utils/formatPrice'
import type { Media } from '@/payload-types'

interface ComponentBase {
  // 1. Строгий тип id: number (согласно стандартной коллекции Payload)
  id: number
  name: string
  price: number
  image?: number | Media | null
}

interface ComponentSlotProps {
  title: string
  // 2. Оставим slotKey для потенциального использования в aria-атрибутах
  // или test-id, чтобы он не висел "мертвым грузом"
  slotKey: keyof BuildSlots
  item: ComponentValue | null
  hasError?: boolean
  onOpenModal: () => void
  onRemove: () => void
}

const ComponentSlot = memo(
  ({ title, slotKey, item, hasError, onOpenModal, onRemove }: ComponentSlotProps) => {
    const base = item as unknown as ComponentBase | null

    const imageUrl =
      typeof base?.image === 'object' && base?.image !== null ? (base.image.url ?? null) : null

    return (
      <div
        // 3. Используем slotKey для data-атрибута (полезно для e2e тестов)
        data-slot={slotKey}
        className={`border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white gap-4 transition-all duration-200 ${
          hasError ? 'border-red-500 bg-red-50 shadow-sm' : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 bg-gray-50 border border-gray-100 rounded shrink-0 flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={base?.name || title}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            ) : (
              <span className="text-xs text-gray-400 text-center px-1">Нет фото</span>
            )}
          </div>

          <div className="flex flex-col">
            <span className={`text-sm font-medium ${hasError ? 'text-red-600' : 'text-gray-500'}`}>
              {title}
            </span>
            {base ? (
              <span className="text-lg font-semibold text-gray-900 leading-tight">{base.name}</span>
            ) : (
              <span className="text-gray-400 italic">Не выбрано</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
          {base && (
            <span className="font-bold text-gray-900 whitespace-nowrap text-lg">
              {formatPrice(base.price)}
            </span>
          )}
          {base ? (
            <div className="flex gap-3">
              <button
                onClick={onOpenModal}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                aria-label={`Заменить ${title}`}
              >
                Заменить
              </button>
              <button
                onClick={onRemove}
                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                aria-label={`Удалить ${title}`}
              >
                Удалить
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenModal}
              className="bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-800 font-medium py-2 px-6 rounded-md transition-all text-sm"
              aria-label={`Выбрать ${title}`}
            >
              Выбрать
            </button>
          )}
        </div>
      </div>
    )
  },
)

ComponentSlot.displayName = 'ComponentSlot'
export default ComponentSlot

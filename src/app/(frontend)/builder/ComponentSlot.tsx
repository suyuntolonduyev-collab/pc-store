'use client'

import { memo } from 'react'
import type { BuildSlots } from '@/store/useBuilderStore'
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

// Union тип для всех возможных комплектующих
type BuildComponent = Processor | Motherboard | Gpus | Ram | Psus | Case | Cooler | Storage

interface ComponentSlotProps {
  title: string
  slotKey: keyof BuildSlots
  item: BuildComponent | null
  hasError?: boolean
  // Функции передаются сверху (из BuilderPage)
  onOpenModal: () => void
  onRemove: () => void
}

const ComponentSlot = memo(
  ({ title, slotKey, item, hasError, onOpenModal, onRemove }: ComponentSlotProps) => {
    return (
      <div
        className={`border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white gap-4 transition-all duration-200 ${
          hasError ? 'border-red-500 bg-red-50 shadow-sm' : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        {/* Левая часть: Название и выбранный компонент */}
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${hasError ? 'text-red-600' : 'text-gray-500'}`}>
            {title}
          </span>
          {item ? (
            <span className="text-lg font-semibold text-gray-900 leading-tight">{item.name}</span>
          ) : (
            <span className="text-gray-400 italic">Не выбрано</span>
          )}
        </div>

        {/* Правая часть: Цена и кнопки управления */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
          {item && (
            <span className="font-bold text-gray-900 whitespace-nowrap">
              {formatPrice(item.price)}
            </span>
          )}

          {item ? (
            <div className="flex gap-3">
              <button
                onClick={onOpenModal}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Заменить
              </button>
              <button
                onClick={onRemove}
                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Удалить
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenModal}
              className="bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-800 font-medium py-2 px-6 rounded-md transition-all text-sm"
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

'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  ShoppingCart,
  Cpu,
  Gamepad2,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Power,
  Fan,
  Server,
} from 'lucide-react'
import formatPrice from '@/utils/formatPrice'
import type { Media } from '@/payload-types'
import type { CatalogItem } from '@/types/catalog'

interface QuickViewModalProps {
  item: CatalogItem
  onClose: () => void
  onAddToCart: (item: CatalogItem) => void
}

// Вспомогательная функция, чтобы вытащить имя детали, даже если структура нестандартная
const getComponentName = (val: any): string => {
  if (!val) return ''
  if (typeof val === 'string' || typeof val === 'number')
    return `Деталь ID: ${val} (нужен depth > 0 в API)`
  return val.name || val.title || val.model || 'Безымянная деталь'
}

export default function QuickViewModal({ item, onClose, onAddToCart }: QuickViewModalProps) {
  const imageUrl =
    item.image && typeof item.image === 'object' ? ((item.image as Media).url ?? null) : null

  // 🚀 Бронебойный поиск комплектующих
  // Ищем как напрямую в item.cpu, так и внутри item.components.cpu
  const i = item as any
  const components = i.components || {}

  const buildComponents = [
    { label: 'Процессор', value: i.cpu || components.cpu, icon: Cpu },
    { label: 'Видеокарта', value: i.gpu || components.gpu, icon: Gamepad2 },
    {
      label: 'Материнская плата',
      value: i.mobo || i.motherboard || components.mobo || components.motherboard,
      icon: CircuitBoard,
    },
    { label: 'Оперативная память', value: i.ram || components.ram, icon: MemoryStick },
    { label: 'Накопитель', value: i.storage || components.storage, icon: HardDrive },
    { label: 'Блок питания', value: i.psu || components.psu, icon: Power },
    { label: 'Охлаждение', value: i.cooler || components.cooler, icon: Fan },
    { label: 'Корпус', value: i.case || components.case, icon: Server },
  ].filter((slot) => slot.value) // Оставляем всё, где есть хоть какое-то значение (даже просто ID)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 flex flex-col md:flex-row gap-8 shadow-2xl animate-in zoom-in-95 duration-300"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full z-10"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Блок с картинкой */}
        <div className="relative w-full md:w-1/2 h-64 md:h-[500px] bg-gray-50 rounded-2xl flex items-center justify-center p-4 border border-gray-100 overflow-hidden group shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name || 'Товар'}
              fill
              className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 90vw, 40vw"
              priority
            />
          ) : (
            <span className="text-gray-400 font-medium">Нет фото</span>
          )}
        </div>

        {/* Информационный блок */}
        <div className="w-full md:w-1/2 flex flex-col h-full max-h-[500px]">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4 pr-8">
            {item.name || 'Сборка ПК'}
          </h2>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 space-y-6">
            {/* Описание */}
            <div className="text-gray-600 text-sm leading-relaxed border-l-4 border-blue-500 pl-4 bg-gray-50/50 rounded-r-xl py-2">
              {item.description ? (
                <p>{item.description}</p>
              ) : (
                <p className="italic text-gray-400">Описание пока не добавлено.</p>
              )}
            </div>

            {/* 🚀 Комплектация сборки */}
            {buildComponents.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3 flex items-center justify-between">
                  <span>Комплектация</span>
                  <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">
                    {buildComponents.length} шт.
                  </span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {buildComponents.map((comp, idx) => {
                    const Icon = comp.icon
                    const compName = getComponentName(comp.value)
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
                      >
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 shrink-0">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold leading-none mb-1">
                            {comp.label}
                          </span>
                          <span
                            className="text-xs font-bold text-gray-900 truncate"
                            title={compName}
                          >
                            {compName}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 shrink-0">
            <div className="flex flex-col mb-4">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">
                Стоимость
              </span>
              <span className="text-4xl font-black text-blue-600 tracking-tight">
                {formatPrice(item.price ?? 0)}
              </span>
            </div>

            <button
              onClick={() => {
                onAddToCart(item)
                onClose()
              }}
              className="w-full bg-gray-900 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all flex justify-center items-center gap-3 shadow-lg shadow-gray-900/10 hover:shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
              <span>В КОРЗИНУ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

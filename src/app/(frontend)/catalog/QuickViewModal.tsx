'use client'

import Image from 'next/image'
import formatPrice from '@/utils/formatPrice'
import type { Media } from '@/payload-types'
// 🟢 1. Импортируем из правильного места
import type { CatalogItem } from '@/types/catalog' 

interface QuickViewModalProps {
  item: CatalogItem
  onClose: () => void
  onAddToCart: (item: CatalogItem) => void
}

export default function QuickViewModal({ item, onClose, onAddToCart }: QuickViewModalProps) {
  const imageUrl = item.image && typeof item.image === 'object' 
    ? (item.image as Media).url ?? null 
    : null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 flex flex-col md:flex-row gap-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors z-10"
          aria-label="Закрыть"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="relative w-full md:w-1/2 h-64 md:h-96 bg-gray-50 rounded-xl flex items-center justify-center p-4 border border-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 90vw, 40vw"
              priority
            />
          ) : (
            <span className="text-gray-400 font-medium">Нет фото</span>
          )}
        </div>

        <div className="w-full md:w-1/2 flex flex-col">
          {/* 🟢 2. Убран хардкод статуса "В наличии". Название сдвинуто немного вниз для баланса. */}
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-6 mt-2">
            {item.name}
          </h2>

          {item.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-8 border-l-4 border-gray-100 pl-4">
              {item.description}
            </p>
          )}

          <div className="mt-auto">
            <div className="flex flex-col mb-6">
              <span className="text-sm text-gray-400 font-medium mb-1">Стоимость:</span>
              <span className="text-4xl font-black text-blue-600 tracking-tight">
                {formatPrice(item.price ?? 0)}
              </span>
            </div>

            <button
              onClick={() => {
                onAddToCart(item);
                onClose();
              }}
              className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl transition-all flex justify-center items-center gap-3 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              В КОРЗИНУ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

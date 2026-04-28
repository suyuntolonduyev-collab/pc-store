'use client'

import { useState } from 'react'
import Image from 'next/image'
import ProductCard from '@/components/ProductCard'
import { useCartStore } from '@/store/useCartStore'
import type { Gpus, Media } from '@/payload-types'

const extractFPS = (item: any) => {
  if (!item) return null

  const esports = item.fps_presets?.esports || item.fps_esports || item.esports_fps
  const aaa = item.fps_presets?.aaa || item.fps_aaa || item.aaa_fps
  const casual = item.fps_presets?.casual || item.fps_casual || item.casual_fps

  if (!esports && !aaa && !casual) return null

  return {
    esports: esports || '—',
    aaa: aaa || '—',
    casual: casual || '—',
  }
}

// УЛУЧШЕННАЯ ФУНКЦИЯ: Теперь она умеет распаковывать объекты из Payload CMS
const extractSpecs = (item: any) => {
  if (!item) return []

  const LABELS: Record<string, string> = {
    brand: 'Производитель',
    vendor: 'Вендор',
    chipset: 'Графический чип',
    vram: 'Объем памяти',
    memory: 'Память',
    memory_type: 'Тип памяти',
    memory_bus: 'Шина',
    bus_width: 'Шина данных',
    interface: 'Интерфейс',
    tdp: 'TDP',
    power: 'Энергопотребление',
    power_draw: 'Потребление (Вт)',
    core_clock: 'Частота ядра',
    boost_clock: 'Boost частота',
    length: 'Длина (мм)',
    cooling: 'Охлаждение',
    ports: 'Порты',
  }

  const specs: { label: string; value: string | number }[] = []

  for (const [key, label] of Object.entries(LABELS)) {
    let val = item[key]

    if (val !== undefined && val !== null && val !== '') {
      // ИСПРАВЛЕНИЕ ОШИБКИ: Если значение — это объект (relation из Payload)
      if (typeof val === 'object' && !Array.isArray(val)) {
        // Пытаемся достать имя, заголовок или слаг. Если не выйдет — приводим к строке
        val = val.name || val.title || val.slug || 'Неизвестно'
      }
      // Если это массив связей (например, список портов)
      else if (Array.isArray(val)) {
        val = val
          .map((v: any) => (typeof v === 'object' ? v.name || v.title || String(v) : v))
          .join(', ')
      }

      // Гарантированно пушим только строку или число
      specs.push({ label, value: String(val) })
    }
  }

  return specs
}

export default function InteractiveComponentGrid({ items = [] }: { items: Gpus[] }) {
  const [previewItem, setPreviewItem] = useState<Gpus | null>(null)
  const addItem = useCartStore((state: any) => state.addItem)

  if (!items || !Array.isArray(items)) return null

  const fps = extractFPS(previewItem)
  const specs = extractSpecs(previewItem)

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative group hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300"
          >
            <ProductCard item={item} type="component" />

            <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px] flex items-center justify-center backdrop-blur-sm z-10">
              <button
                onClick={() => setPreviewItem(item)}
                className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors cursor-pointer pointer-events-auto shadow-lg"
              >
                Быстрый просмотр
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 flex flex-col md:flex-row gap-8 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors z-10"
              aria-label="Закрыть"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>

            <div className="relative w-full md:w-1/2 flex flex-col gap-4">
              <div className="relative h-64 md:h-80 bg-gray-50 rounded-xl flex items-center justify-center p-4 border border-gray-100 shrink-0">
                {previewItem.image && typeof previewItem.image === 'object' ? (
                  <Image
                    src={(previewItem.image as Media).url!}
                    alt={(previewItem as any).name || 'Комплектующее'}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 90vw, 40vw"
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 opacity-20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                    <span className="font-medium text-sm">Нет фото</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex-grow">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Характеристики
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {specs.length > 0 ? (
                    specs.map((spec, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-end text-sm border-b border-gray-100/50 pb-1"
                      >
                        <span className="text-gray-500 text-xs shrink-0">{spec.label}</span>
                        <span
                          className="font-medium text-gray-900 text-right ml-2 truncate"
                          title={String(spec.value)}
                        >
                          {spec.value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-xs italic">
                      Подробные характеристики указаны на странице товара
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4 mt-2">
                {(previewItem as any).name || 'Комплектующее'}
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed mb-6 border-l-4 border-blue-500 pl-4">
                {(previewItem as any).description ||
                  'Превосходное решение для увеличения производительности вашей системы.'}
              </p>

              {fps && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Производительность (FPS)
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white py-2 px-1 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-[10px] sm:text-xs text-gray-500 mb-1 font-medium">
                        Esports
                      </div>
                      <div className="font-black text-blue-600 text-sm sm:text-base">
                        {fps.esports}
                      </div>
                    </div>
                    <div className="bg-white py-2 px-1 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-[10px] sm:text-xs text-gray-500 mb-1 font-medium">
                        AAA
                      </div>
                      <div className="font-black text-blue-600 text-sm sm:text-base">{fps.aaa}</div>
                    </div>
                    <div className="bg-white py-2 px-1 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-[10px] sm:text-xs text-gray-500 mb-1 font-medium">
                        Casual
                      </div>
                      <div className="font-black text-blue-600 text-sm sm:text-base">
                        {fps.casual}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto">
                <div className="flex flex-col mb-6">
                  <span className="text-sm text-gray-400 font-medium mb-1">Стоимость:</span>
                  <span className="text-4xl font-black text-blue-600 tracking-tight">
                    {((previewItem as any).price || 0).toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (addItem) addItem({ ...previewItem, quantity: 1 })
                    setPreviewItem(null)
                  }}
                  className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl transition-all flex justify-center items-center gap-3 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                  В КОРЗИНУ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

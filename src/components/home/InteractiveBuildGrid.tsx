'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import type { Build, Media } from '@/payload-types'

const COMPONENT_LABELS: Record<string, string> = {
  cpu: 'Процессор',
  gpu: 'Видеокарта',
  motherboard: 'Мат. плата',
  ram: 'ОЗУ',
  storage: 'Накопитель',
  psu: 'Блок питания',
  case: 'Корпус',
  cooler: 'Охлаждение',
}

const getBuildPrice = (build: any): number => {
  if (!build || typeof build !== 'object') return 0
  if (build.totalPrice) return Number(build.totalPrice)
  if (build.total_price) return Number(build.total_price)
  if (build.price) return Number(build.price)

  let sum = 0
  let hasComponents = false
  for (const key of Object.keys(COMPONENT_LABELS)) {
    if (build[key] && typeof build[key] === 'object' && build[key].price) {
      sum += Number(build[key].price)
      hasComponents = true
    }
  }
  if (hasComponents) return sum

  if (Array.isArray(build.items))
    return build.items.reduce((s: number, item: any) => s + (Number(item?.price) || 0), 0)
  if (Array.isArray(build.components))
    return build.components.reduce((s: number, item: any) => s + (Number(item?.price) || 0), 0)
  return 0
}

// Извлекаем пресеты из видеокарты
const extractFPS = (gpu: any) => {
  if (!gpu) return { esports: '—', aaa: '—', casual: '—' }
  return {
    esports: gpu.fps_presets?.esports || gpu.fps_esports || '240+',
    aaa: gpu.fps_presets?.aaa || gpu.fps_aaa || '80+',
    casual: gpu.fps_presets?.casual || gpu.fps_casual || '144+',
  }
}

export default function InteractiveBuildGrid({ builds = [] }: { builds: Build[] }) {
  const [previewBuild, setPreviewBuild] = useState<Build | null>(null)
  const [favorites, setFavorites] = useState<Record<number, boolean>>({})

  if (!builds || !Array.isArray(builds)) return null

  const toggleFavorite = (id: number) => setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))

  // Получаем FPS для выбранной сборки
  const fps = previewBuild
    ? extractFPS((previewBuild as any).gpu)
    : { esports: '-', aaa: '-', casual: '-' }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {builds.map((b) => (
          <div
            key={b.id}
            className="relative group hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300"
          >
            <ProductCard item={b} type="build" />

            <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px] flex items-center justify-center gap-3 backdrop-blur-sm z-10">
              <button
                onClick={() => setPreviewBuild(b)}
                className="bg-white text-gray-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors cursor-pointer pointer-events-auto"
              >
                Быстрый просмотр
              </button>
              <button
                onClick={() => toggleFavorite(b.id)}
                className={`p-2 rounded-xl transition-colors cursor-pointer pointer-events-auto ${favorites[b.id] ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill={favorites[b.id] ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewBuild && (
        <div
          onClick={() => setPreviewBuild(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 flex flex-col md:flex-row gap-8 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setPreviewBuild(null)}
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
                {previewBuild.image && typeof previewBuild.image === 'object' ? (
                  <Image
                    src={(previewBuild.image as Media).url!}
                    alt={(previewBuild as any).name || 'Сборка'}
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
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium text-sm">Изображение формируется</span>
                  </div>
                )}
              </div>

              {/* БЛОК СОСТАВА СБОРКИ */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex-grow">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Состав конфигурации
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {Object.entries(COMPONENT_LABELS).map(([key, label]) => {
                    const comp = (previewBuild as any)[key]
                    if (!comp) return null
                    return (
                      <div
                        key={key}
                        className="flex justify-between items-end text-sm border-b border-gray-100/50 pb-1"
                      >
                        <span className="text-gray-500 text-xs shrink-0">{label}</span>
                        <span className="font-medium text-gray-900 text-right truncate ml-2">
                          {comp.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {previewBuild.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4">
                {(previewBuild as any).name || 'Кастомная сборка'}
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed mb-6 border-l-4 border-blue-500 pl-4">
                {(previewBuild as any).description ||
                  'Сбалансированная конфигурация, автоматически проверенная нашим интеллектуальным алгоритмом на 100% совместимость компонентов.'}
              </p>

              {/* ДИНАМИЧЕСКИЙ БЛОК FPS */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Ожидаемый FPS
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
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-1 font-medium">AAA</div>
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

              <div className="mt-auto">
                <div className="flex flex-col mb-6">
                  <span className="text-sm text-gray-400 font-medium mb-1">
                    Итоговая стоимость:
                  </span>
                  <span className="text-4xl font-black text-gray-900 tracking-tight">
                    {getBuildPrice(previewBuild).toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/builder?buildId=${previewBuild.id}`}
                    className="flex-1 bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl transition-all flex justify-center items-center gap-2 shadow-lg"
                  >
                    В КОНФИГУРАТОР
                  </Link>
                  <button
                    onClick={() => toggleFavorite(previewBuild.id)}
                    className={`w-14 flex items-center justify-center rounded-2xl transition-colors border-2 ${favorites[previewBuild.id] ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill={favorites[previewBuild.id] ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

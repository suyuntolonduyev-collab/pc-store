'use client'

import { useState } from 'react'
import { useBuilderStore } from '@/store/useBuilderStore'

type Genre = 'esports' | 'aaa' | 'casual'

const GENRE_LABELS: Record<Genre, string> = {
  esports: 'Киберспорт (CS2)',

  casual: 'Популярные (GTA V)',
  aaa: 'AAA-игры (Cyberpunk)',
}

// Коэффициент влияния процессора на итоговый FPS
// 1.0 - FPS масштабируется 1 к 1 с множителем CPU
// 0.3 - Видеокарта почти всё берет на себя, слабое влияние CPU
const CPU_INFLUENCE: Record<Genre, number> = {
  esports: 1.0,
  casual: 0.6,
  aaa: 0.3,
}

export default function FpsCounter() {
  const build = useBuilderStore((state) => state.build)
  const [genre, setGenre] = useState<Genre>('aaa')

  if (!build.gpu) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-500 shadow-sm">
        <svg
          className="w-8 h-8 mx-auto mb-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Выберите видеокарту, чтобы оценить производительность
      </div>
    )
  }

  // Безопасное извлечение данных
  const gpuData = build.gpu as any
  const presets = gpuData.fps_presets || { esports: 120, casual: 80, aaa: 60 }
  const baseFps = presets[genre]

  // Динамическое влияние CPU на основе жанра
  const cpuData = build.cpu as any
  const rawCpuMultiplier = cpuData?.fps_multiplier || 0.8 // Базовый штраф 20%, если CPU нет

  const influence = CPU_INFLUENCE[genre]
  const finalCpuMultiplier = 1 - (1 - rawCpuMultiplier) * influence

  const calculatedFps = Math.round(baseFps * finalCpuMultiplier)

  // Визуальная индикация
  const getFpsColor = (fps: number) => {
    if (fps >= 144) return 'text-purple-600'
    if (fps >= 60) return 'text-green-500'
    if (fps >= 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getBarColor = (fps: number) => {
    if (fps >= 144) return 'bg-purple-500'
    if (fps >= 60) return 'bg-green-500'
    if (fps >= 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Максимум для шкалы прогресс-бара (чтобы 240 FPS заполняли шкалу полностью)
  const MAX_FPS_SCALE = 240

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Игровая производительность</h3>
          <p className="text-xs text-gray-500 mt-1">Ориентировочные значения для 1080p</p>
        </div>

        {/* Переключатель жанров */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(GENRE_LABELS) as Genre[]).map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 text-center border ${
                genre === g
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {GENRE_LABELS[g]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-4 pb-6 bg-gray-50 rounded-lg border border-gray-100 relative overflow-hidden">
        <div className="flex items-baseline gap-2 z-10">
          <span
            className={`text-6xl font-black tracking-tighter transition-colors duration-500 ${getFpsColor(calculatedFps)}`}
          >
            {calculatedFps}
          </span>
          <span className="text-xl font-bold text-gray-400">FPS</span>
        </div>

        {/* Индикатор узкого места (Боттлнека) */}
        {!build.cpu && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-orange-500 mt-2 z-10">
            ⚠️ Добавьте процессор
          </span>
        )}

        {/* Прогресс-бар внизу блока (абсолютное позиционирование) */}
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gray-200">
          <div
            className={`h-full transition-all duration-700 ease-out ${getBarColor(calculatedFps)}`}
            style={{ width: `${Math.min((calculatedFps / MAX_FPS_SCALE) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Честный дисклеймер */}
      <p className="text-[10px] leading-relaxed text-gray-400 mt-4 text-center">
        *Указанные значения являются приблизительными (±30%). Реальный FPS сильно зависит от
        включения апскейлеров (DLSS/FSR), трассировки лучей и версии патча игры.
      </p>
    </div>
  )
}

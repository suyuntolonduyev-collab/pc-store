'use client'

import { useState, useMemo } from 'react'
import { useBuilderStore } from '@/store/useBuilderStore'

type Genre = 'esports' | 'aaa' | 'casual'

const GENRE_LABELS: Record<Genre, string> = {
  esports: 'Киберспорт',
  aaa: 'AAA Игры',
  casual: 'Казуальные',
}

// Насколько CPU влияет на FPS в каждом жанре (0 = не влияет, 1 = полное влияние)
const CPU_INFLUENCE: Record<Genre, number> = {
  esports: 1.0, // Киберспорт сильно зависит от CPU
  casual: 0.6,
  aaa: 0.3, // AAA упирается в GPU
}

export default function FpsCounterWidget() {
  const gpu = useBuilderStore((state) => state.build.gpu)
  const cpu = useBuilderStore((state) => state.build.cpu)

  const [genre, setGenre] = useState<Genre>('esports')

  const estimatedFps = useMemo<number | null>(() => {
    if (!gpu || !cpu) return null

    // Оба поля реальные — из Gpus.fps_presets и Processor.fps_multiplier
    const baseFps = gpu.fps_presets?.[genre] ?? 0
    const cpuMultiplier = cpu.fps_multiplier ?? 1.0

    if (!baseFps) return 0

    const influence = CPU_INFLUENCE[genre]
    const fps = baseFps * (1 - (1 - cpuMultiplier) * influence)
    return Math.round(fps)
  }, [cpu, gpu, genre])

  if (estimatedFps === null) return null

  const fpsColor =
    estimatedFps >= 144
      ? 'text-emerald-600'
      : estimatedFps >= 60
        ? 'text-blue-600'
        : 'text-amber-500'

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
        Ожидаемый FPS (1080p)
      </h3>

      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
        {(Object.keys(GENRE_LABELS) as Genre[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGenre(g)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              genre === g ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {GENRE_LABELS[g]}
          </button>
        ))}
      </div>

      <div className="text-center bg-gray-50 rounded-xl py-4 border border-gray-100">
        <div className={`text-4xl font-black ${fpsColor}`}>
          {estimatedFps > 0 ? estimatedFps : '???'}
          <span className="text-xl text-gray-400 font-semibold ml-1">fps</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">~оценка · погрешность ±30%</p>
      </div>
    </div>
  )
}

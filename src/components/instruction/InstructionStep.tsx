import React from 'react'
import type { PageData } from '@/lib/api/instruction'

interface InstructionStepProps {
  step: PageData['steps'][0]
  index: number
  totalSteps: number
  isLast?: boolean
  variant?: 'default' | 'highlight'
}

export function InstructionStep({
  step,
  index,
  totalSteps,
  isLast,
  variant = 'default',
}: InstructionStepProps) {
  const isHighlight = variant === 'highlight'
  // 🚀 9. Вычисляем процент завершения для этого шага
  const progressPercent = ((index + 1) / totalSteps) * 100

  return (
    <>
      <div
        className={`relative rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${isHighlight ? 'bg-indigo-50/30 border-indigo-200' : 'bg-white border-gray-200'}`}
      >
        {/* 🚀 9. UX: Индикатор прогресса внутри карточки */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
          <div
            className="h-full bg-indigo-500 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div
          className={`flex items-center px-6 py-4 border-b mt-1 ${isHighlight ? 'border-indigo-100 bg-indigo-50/50' : 'border-gray-100 bg-gray-50/50'}`}
        >
          <div
            className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${isHighlight ? 'bg-indigo-600' : 'bg-gray-800'}`}
          >
            {index + 1}
          </div>
          <div className="ml-4 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
              Шаг {index + 1} из {totalSteps}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
              {step.title}
            </h3>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
            {step.description}
          </p>
          {step.tip && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3 items-start">
              <span className="text-xl shrink-0 leading-none mt-0.5">💡</span>
              <div className="text-sm md:text-base text-indigo-950 leading-relaxed">
                <span className="font-bold block mb-1 uppercase tracking-wider text-xs text-indigo-800">
                  Совет эксперта
                </span>
                {step.tip}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🧼 8. Использование isLast: Визуальный коннектор между шагами */}
      {!isLast && <div className="w-1 h-6 bg-gray-200 mx-auto rounded-full my-2 opacity-50" />}
    </>
  )
}

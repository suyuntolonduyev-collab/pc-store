// src/components/instruction/InstructionPage.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { Metadata } from 'next'

// Получаем данные один раз
async function getInstruction() {
  const payload = await getPayload({ config })

  const instruction = await payload.findGlobal({
    slug: 'instruction',
  })

  return instruction
}

// Генерация метаданных
export async function generateMetadata(): Promise<Metadata> {
  const instruction = await getInstruction()

  return {
    title: instruction?.title ? `${instruction.title} | PC-STORE` : 'Инструкция | PC-STORE',
    description: instruction?.intro?.slice(0, 160) ?? 'Пошаговая инструкция по сборке компьютера',
  }
}

// Компонент шага
function InstructionStep({ step, index }: { step: any; index: number }) {
  return (
    <div className="group relative pl-16 pb-12 last:pb-0">
      <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl group-hover:scale-110 transition-transform">
        {step.step_number ?? index + 1}
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{step.description}</p>

        {step.tip && (
          <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">💡 Совет:</span> {step.tip}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Основная страница
export default async function InstructionPage() {
  const instruction = await getInstruction()

  // Защита от отсутствия данных
  if (!instruction || !instruction.steps?.length) {
    return (
      <div className="bg-gray-50 min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Инструкция</h1>
          <p className="text-gray-600">
            Инструкция временно недоступна. Пожалуйста, зайдите позже.
          </p>
        </div>
      </div>
    )
  }

  const steps = instruction.steps

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Герой-секция */}
      <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{instruction.title}</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">{instruction.intro}</p>
        </div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <InstructionStep key={step.id ?? index} step={step} index={index} />
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Готово! 🎉</h3>
            <p className="text-gray-600">
              Ваш компьютер собран. Если возникли проблемы — обратитесь в нашу{' '}
              <a href="/feedback" className="text-blue-600 hover:underline">
                службу поддержки
              </a>
              .
            </p>
          </div>
        </div>

        {/* Чеклист */}
        <div className="max-w-3xl mx-auto mt-8">
          <details className="bg-white rounded-lg shadow-sm p-4">
            <summary className="cursor-pointer font-semibold text-gray-900">
              📋 Чек-лист для самопроверки
            </summary>
            <div className="mt-4 space-y-2 text-gray-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" /> Все компоненты распакованы
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" /> Термопаста нанесена
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" /> Все кабели подключены
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" /> Блок питания включён
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" /> Монитор подключен к видеокарте
              </label>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

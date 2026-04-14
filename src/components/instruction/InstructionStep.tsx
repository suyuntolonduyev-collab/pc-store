interface Step {
  id?: string | null // добавляем null
  title: string
  description: string
  tip?: string | null
}

interface InstructionStepProps {
  step: Step
  index: number
}

export function InstructionStep({ step, index }: InstructionStepProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="flex items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
          {index + 1}
        </div>
        <h3 className="ml-4 text-lg md:text-xl font-bold text-gray-900 tracking-tight">
          {step.title}
        </h3>
      </div>
      <div className="px-6 py-5">
        <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
          {step.description}
        </p>
        {step.tip && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3 items-start">
            <span className="text-xl shrink-0 leading-none">💡</span>
            <div className="text-sm md:text-base text-blue-900 leading-relaxed">
              <span className="font-semibold block mb-1 text-blue-950">Совет эксперта</span>
              {step.tip}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

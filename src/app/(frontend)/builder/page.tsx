'use client'

import { useState, useCallback, useMemo } from 'react'
import { useBuilderStore, type BuildSlots, type ComponentValue } from '@/store/useBuilderStore'
import formatPrice from '@/utils/formatPrice'
import ComponentSlot from './ComponentSlot'
import ComponentModal from './ComponentModal'
import FpsCounterWidget from './FpsCounterWidget'
import AddToCartBtn from './AddToCartBtn'
import { Gamepad2, AlertTriangle, Zap, LayoutList, CheckCircle2 } from 'lucide-react'

const SLOT_TITLES: Record<keyof BuildSlots, string> = {
  cpu: 'Процессор',
  mobo: 'Материнская плата',
  gpu: 'Видеокарта',
  ram: 'Оперативная память',
  cooler: 'Охлаждение',
  storage: 'Накопитель',
  psu: 'Блок питания',
  case: 'Корпус',
}

// ⚙️ Фиксированный порядок компонентов
const SLOT_ORDER: (keyof BuildSlots)[] = [
  'cpu',
  'mobo',
  'gpu',
  'ram',
  'cooler',
  'storage',
  'psu',
  'case',
]

export default function BuilderPage() {
  const build = useBuilderStore((state) => state.build)
  const getCompatibilityErrors = useBuilderStore((state) => state.getCompatibilityErrors)
  const calculateTotalPrice = useBuilderStore((state) => state.calculateTotalPrice)
  const selectComponent = useBuilderStore((state) => state.selectComponent)
  const removeComponent = useBuilderStore((state) => state.removeComponent)
  const getTotalWattage = useBuilderStore((state) => state.getTotalWattage)

  const [activeSlot, setActiveSlot] = useState<keyof BuildSlots | null>(null)

  const errors = getCompatibilityErrors()
  const totalPrice = calculateTotalPrice()
  const filledSlots = Object.values(build).filter(Boolean).length
  const totalSlots = SLOT_ORDER.length
  const isComplete = filledSlots === totalSlots

  // 🧠 Confidence Score (Итоговая надежность системы)
  const confidence = useMemo(() => {
    if (filledSlots === 0) return 0
    if (!isComplete) return Math.round((filledSlots / totalSlots) * 60)
    if (errors.some((e) => e.type === 'error')) return 40
    if (errors.length > 0) return 75
    return 100
  }, [filledSlots, isComplete, errors, totalSlots])

  // 🎮 Build Summary (Анализ предназначения)
  const buildAnalysis = useMemo(() => {
    if (!build.cpu || !build.gpu) return null
    const gpuData = build.gpu as any
    const isEnthusiast = gpuData.fps_presets?.aaa > 90 || totalPrice > 180000
    return {
      badge: isEnthusiast ? 'Enthusiast PC' : 'Optimal Gaming',
      desc: isEnthusiast
        ? 'Экстремальная мощь для 4K гейминга и тяжелого рендеринга.'
        : 'Сбалансированная сборка для комфортной игры в Full HD / 2K.',
    }
  }, [build.cpu, build.gpu, totalPrice])

  const handleOpenModal = useCallback((slot: keyof BuildSlots) => {
    setActiveSlot(slot)
  }, [])

  const handleRemove = useCallback(
    (slot: keyof BuildSlots) => {
      removeComponent(slot)
    },
    [removeComponent],
  )

  // 🧠 Логика авто-открытия следующего слота
  const handleSelect = useCallback(
    (component: ComponentValue) => {
      if (activeSlot) {
        selectComponent(activeSlot, component)

        const currentIndex = SLOT_ORDER.indexOf(activeSlot)
        const nextSlot = SLOT_ORDER[currentIndex + 1]

        // Если следующий слот пуст — открываем его через небольшую паузу
        if (nextSlot && !build[nextSlot]) {
          setTimeout(() => setActiveSlot(nextSlot), 150)
        } else {
          setActiveSlot(null)
        }
      }
    },
    [activeSlot, selectComponent, build],
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* ХЕДЕР С ПРОГРЕССОМ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">КОНФИГУРАТОР</h1>
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>Проверка совместимости активна</span>
            </div>
          </div>

          {/* 🎯 Прогресс сборки (Visual) */}
          <div className="bg-white border border-gray-200 p-4 rounded-3xl flex items-center gap-6 shadow-sm">
            <div className="flex gap-1.5">
              {SLOT_ORDER.map((slot) => (
                <div
                  key={slot}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${build[slot] ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <div className="h-8 w-px bg-gray-100" />
            <span className="text-xs font-black text-gray-800 uppercase tracking-widest">
              {filledSlots} / {totalSlots} ГОТОВО
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* ЛЕВАЯ КОЛОНКА (СЛОТЫ) */}
          <div className="lg:col-span-2 space-y-4">
            {SLOT_ORDER.map((slotKey) => {
              // 🧩 Фильтруем ошибки конкретно для этого слота
              const slotErrors = errors
                .filter((e) => e.message.toLowerCase().includes(SLOT_TITLES[slotKey].toLowerCase()))
                .map((e) => e.message)

              return (
                <ComponentSlot
                  key={slotKey}
                  slotKey={slotKey}
                  title={SLOT_TITLES[slotKey]}
                  item={build[slotKey]}
                  errorMessages={slotErrors}
                  onOpenModal={() => handleOpenModal(slotKey)}
                  onRemove={() => handleRemove(slotKey)}
                />
              )
            })}
          </div>

          {/* ПРАВАЯ КОЛОНКА (РЕЗЮМЕ) */}
          <div className="space-y-6 sticky top-24">
            {/* ✅ Build Summary Card */}
            {buildAnalysis && (
              <div className="p-6 bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2.5rem] shadow-xl text-white overflow-hidden relative group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-blue-400 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" /> Build Summary
                </h3>
                <p className="font-black text-2xl mb-2">{buildAnalysis.badge}</p>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  {buildAnalysis.desc}
                </p>
              </div>
            )}

            <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-8">
              {/* 🧠 Confidence Score UI */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Надежность
                  </span>
                  <span
                    className={`text-xl font-black ${confidence < 50 ? 'text-red-500' : confidence < 80 ? 'text-yellow-500' : 'text-green-600'}`}
                  >
                    {confidence}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.max(4, confidence)}%` }}
                    className={`h-full transition-all duration-1000 ease-out ${
                      confidence < 50
                        ? 'bg-red-500'
                        : confidence < 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                  />
                </div>
              </div>

              {/* ⚡ Видимый блок ошибок */}
              {errors.length > 0 && (
                <div className="p-5 bg-red-50/50 border border-red-100 rounded-[2rem]">
                  <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase mb-3">
                    <AlertTriangle className="w-4 h-4" /> Конфликты сборки
                  </div>
                  <ul className="space-y-2">
                    {errors.slice(0, 3).map((e, i) => (
                      <li key={i} className="text-xs text-red-700 font-bold flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 bg-red-400 rounded-full shrink-0" />
                        <span className="leading-tight">{e.message}</span>
                      </li>
                    ))}
                    {errors.length > 3 && (
                      <li className="text-[10px] text-red-400 font-black pl-3 pt-1">
                        И ЕЩЕ {errors.length - 3} ПРОБЛЕМЫ...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* 📊 Детализация (Итого) */}
              <div className="space-y-4 pt-2 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <LayoutList className="w-4 h-4" /> Компонентов
                  </div>
                  <span className="text-gray-900 font-black">
                    {filledSlots} / {totalSlots}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <Zap className="w-4 h-4" /> Мощность (TDP)
                  </div>
                  <span className="text-gray-900 font-black">{Math.ceil(getTotalWattage())}W</span>
                </div>
              </div>

              {/* КНОПКА И FPS */}
              <div className="space-y-6">
                <AddToCartBtn />
                <FpsCounterWidget />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* МОДАЛКА (UX: ESC и клик вне) */}
      {activeSlot && (
        <ComponentModal
          slotKey={activeSlot}
          onClose={() => setActiveSlot(null)}
          onSelect={handleSelect}
        />
      )}
    </div>
  )
}

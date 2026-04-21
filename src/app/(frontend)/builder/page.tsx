'use client'

import { useState, useCallback } from 'react'
import { useBuilderStore, type BuildSlots, type ComponentValue } from '@/store/useBuilderStore'
import formatPrice from '@/utils/formatPrice'
import ComponentSlot from './ComponentSlot'
import ComponentModal from './ComponentModal'
import FpsCounterWidget from './FpsCounterWidget'
import AddToCartBtn from './AddToCartBtn'

const SLOT_TITLES: Record<keyof BuildSlots, string> = {
  cpu: 'Процессор',
  mobo: 'Материнская плата',
  gpu: 'Видеокарта',
  ram: 'Оперативная память',
  psu: 'Блок питания',
  case: 'Корпус',
  cooler: 'Охлаждение',
  storage: 'Накопитель',
}

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

  const isComplete = (
    ['cpu', 'mobo', 'gpu', 'ram', 'psu', 'case', 'cooler', 'storage'] as const
  ).every((slot) => build[slot] != null)

  const handleOpenModal = useCallback((slot: keyof BuildSlots) => {
    setActiveSlot(slot)
  }, [])

  const handleRemove = useCallback(
    (slot: keyof BuildSlots) => {
      removeComponent(slot)
    },
    [removeComponent],
  )

  const handleSelect = useCallback(
    (component: ComponentValue) => {
      if (activeSlot) {
        selectComponent(activeSlot, component)
        setActiveSlot(null)
      }
    },
    [activeSlot, selectComponent],
  )

  return (
    <div className="container mx-auto py-8 px-4 sm:px-0">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Конфигуратор ПК</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {(Object.keys(build) as Array<keyof BuildSlots>).map((slotKey) => (
            <ComponentSlot
              key={slotKey}
              slotKey={slotKey}
              title={SLOT_TITLES[slotKey]}
              item={build[slotKey]}
              hasError={errors.some((e) =>
                e.message.toLowerCase().includes(SLOT_TITLES[slotKey].toLowerCase()),
              )}
              onOpenModal={() => handleOpenModal(slotKey)}
              onRemove={() => handleRemove(slotKey)}
            />
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Итого</h2>
          <div className="text-4xl font-black text-gray-900 mb-6">{formatPrice(totalPrice)}</div>

          {/* 🟢 Используем наш новый изолированный компонент */}
          <AddToCartBtn disabled={!isComplete || errors.some((e) => e.type === 'error')} />

          <FpsCounterWidget />

          <div className="mt-4 text-xs text-gray-400 text-center">
            Расчетное потребление (с запасом):{' '}
            <span className="font-semibold text-gray-500">{Math.ceil(getTotalWattage())}W</span>
          </div>
        </div>
      </div>

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

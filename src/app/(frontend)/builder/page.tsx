'use client'

import { useState, useCallback } from 'react'
import { useBuilderStore, type BuildSlots, type ComponentValue } from '@/store/useBuilderStore'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import formatPrice from '@/utils/formatPrice'
import ComponentSlot from './ComponentSlot'
import ComponentModal from './ComponentModal'
import FpsCounterWidget from './FpsCounterWidget'
import type { Build } from '@/payload-types'

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
  const resetBuild = useBuilderStore((state) => state.resetBuild)
  const selectComponent = useBuilderStore((state) => state.selectComponent)
  const removeComponent = useBuilderStore((state) => state.removeComponent)
  const getTotalWattage = useBuilderStore((state) => state.getTotalWattage)

  const addItemToCart = useCartStore((state) => state.addItem)
  const user = useAuthStore((state) => state.user)

  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
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

  const handleAddToCart = async (): Promise<void> => {
    if (!user) {
      setErrorMessage('Пожалуйста, авторизуйтесь для сохранения сборки.')
      return
    }
    setIsSaving(true)
    setErrorMessage(null)

    try {
      const userName = user.name || user.email || 'Пользователь'

      const buildPayload = {
        name: `Сборка ${userName} — ${new Date().toLocaleDateString()}`,
        is_complete: true,
        cpu: build.cpu?.id,
        mobo: build.mobo?.id,
        gpu: build.gpu?.id,
        ram: build.ram?.id,
        psu: build.psu?.id,
        case: build['case']?.id,
        cooler: build.cooler?.id,
        storage: build.storage?.id,
        tags: ['gaming'],
      }

      const response = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload),
      })

      if (!response.ok) throw new Error('Ошибка сохранения')
      const { doc }: { doc: Build } = await response.json()

      addItemToCart(doc)
      resetBuild()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ошибка API')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-0">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Конфигуратор ПК</h1>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {(Object.keys(build) as Array<keyof BuildSlots>).map((slotKey) => (
            <ComponentSlot
              key={slotKey}
              slotKey={slotKey}
              title={SLOT_TITLES[slotKey]}
              item={build[slotKey]}
              // Tech Debt: Хрупкая эвристика ошибки, завязана на локализованные строки
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

          <button
            onClick={handleAddToCart}
            disabled={!isComplete || errors.some((e) => e.type === 'error') || isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm disabled:shadow-none"
          >
            {isSaving ? 'Сохранение...' : 'Добавить в корзину'}
          </button>

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

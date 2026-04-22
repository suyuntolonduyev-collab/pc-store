'use client'

import { toast } from 'react-hot-toast'
import { useBuilderStore } from '@/store/useBuilderStore'
import { useCartStore } from '@/store/useCartStore'
import type { Build } from '@/payload-types'

export default function AddToCartBtn({ disabled }: { disabled: boolean }) {
  const build = useBuilderStore((s) => s.build)
  const resetBuild = useBuilderStore((s) => s.resetBuild)
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = () => {
    // Создаем локальный объект сборки с временным ID
    const localBuild = {
      id: Date.now(),
      name: `Сборка ПК — ${new Date().toLocaleDateString()}`,
      is_complete: true,
      cpu: build.cpu,
      mobo: build.mobo,
      gpu: build.gpu,
      ram: build.ram,
      psu: build.psu,
      case: build['case'],
      cooler: build.cooler,
      storage: build.storage,
      tags: ['gaming'],
    } as unknown as Build

    // Мгновенно добавляем в Zustand корзину
    addItem({ type: 'build', product: localBuild })

    toast.success('Сборка добавлена в корзину!')
    resetBuild()
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled} // ⚠️ Кнопка будет серой, пока вы не выберете ВСЕ детали!
      className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors duration-300 rounded-xl text-white font-semibold cursor-pointer shadow-sm disabled:shadow-none flex justify-center items-center"
    >
      Добавить в корзину
    </button>
  )
}

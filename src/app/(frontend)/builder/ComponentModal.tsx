'use client'

import { useEffect, useState } from 'react'
import { useBuilderStore, type BuildSlots } from '@/store/useBuilderStore'
import formatPrice from '@/utils/formatPrice'

// 1. ОПРЕДЕЛЯЕМ СТРОГИЙ ТИП
// Это базовый интерфейс для любого компонента, который возвращает Payload
interface PayloadComponent {
  id: string | number
  name: string
  price: number
  // Добавьте сюда другие поля, если они вам нужны в модалке (например, image)
}

interface ComponentModalProps {
  slotKey: keyof BuildSlots
  onClose: () => void
  // 2. Строго типизируем onSelect
  onSelect: (component: PayloadComponent) => void
}

const collectionMap: Record<keyof BuildSlots, string> = {
  cpu: 'processors',
  mobo: 'motherboards',
  gpu: 'gpus',
  ram: 'ram',
  psu: 'psus',
  case: 'cases',
  cooler: 'coolers',
  storage: 'storage',
}

export default function ComponentModal({ slotKey, onClose, onSelect }: ComponentModalProps) {
  // 3. ДОБАВЛЯЕМ ДЖЕНЕРИК <PayloadComponent[]> ДЛЯ СОСТОЯНИЯ
  const [components, setComponents] = useState<PayloadComponent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const build = useBuilderStore((state) => state.build)

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setIsLoading(true)
        const collection = collectionMap[slotKey]

        let url = `/api/${collection}?limit=50`
        let queryString = ''

        // Фильтр для Материнских плат
        if (slotKey === 'mobo' && build.cpu) {
          // Type Assertion для безопасного доступа (так как мы знаем, что там может быть объект или ID)
          const cpuSocket = build.cpu as any
          const socketId =
            typeof cpuSocket.socket === 'object' ? cpuSocket.socket?.id : cpuSocket.socket
          if (socketId) {
            queryString += `&where[socket][equals]=${socketId}`
          }
        }

        // Фильтр для ОЗУ
        if (slotKey === 'ram' && build.mobo) {
          const moboRam = build.mobo as any
          const ramType = moboRam.ram_type
          if (ramType) {
            queryString += `&where[type][equals]=${ramType}`
          }
        }

        // Фильтр для Кулеров
        if (slotKey === 'cooler' && (build.mobo || build.cpu)) {
          const baseComponent = (build.mobo || build.cpu) as any
          const socketId =
            typeof baseComponent.socket === 'object'
              ? baseComponent.socket?.id
              : baseComponent.socket
          if (socketId) {
            queryString += `&where[sockets][contains]=${socketId}`
          }
        }

        const res = await fetch(url + queryString)

        if (!res.ok) throw new Error('Ошибка загрузки компонентов')

        // 4. ТИПИЗИРУЕМ ОТВЕТ ОТ СЕРВЕРА
        const data = (await res.json()) as { docs: PayloadComponent[] }
        setComponents(data.docs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      } finally {
        setIsLoading(false)
      }
    }

    fetchComponents()
  }, [slotKey, build.cpu, build.mobo])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* ... (код верстки остается прежним) ... */}

      {/* Теперь TypeScript знает, что comp имеет тип PayloadComponent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {components.map((comp) => (
          <div
            key={comp.id} // Ошибка "Property 'id' does not exist" исчезнет!
            onClick={() => onSelect(comp)}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group bg-white"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {comp.name}
            </h3>

            <div className="flex justify-between items-end mt-4">
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                В наличии
              </span>
              <span className="font-bold text-gray-900">{formatPrice(comp.price)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ... */}
    </div>
  )
}

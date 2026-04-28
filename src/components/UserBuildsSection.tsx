'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import InteractiveBuildGrid from '@/components/home/InteractiveBuildGrid'
import type { Build } from '@/payload-types'

export default function UserBuildsSection() {
  // Получаем текущего пользователя из твоего стора
  const user = useAuthStore((state) => state.user)

  const [builds, setBuilds] = useState<Build[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Если пользователь не авторизован, отключаем загрузку и выходим
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    const fetchUserBuilds = async () => {
      try {
        setIsLoading(true)
        // Делаем запрос к Payload CMS, фильтруя сборки по ID пользователя
        // Сортируем по дате создания (новые сначала), берем последние 4
        const res = await fetch(
          `/api/builds?where[user][equals]=${user.id}&limit=4&sort=-createdAt&depth=2`,
        )

        if (!res.ok) throw new Error('Ошибка при загрузке истории сборок')

        const data = await res.json()
        setBuilds(data.docs || [])
      } catch (error) {
        console.error('Ошибка UserBuildsSection:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserBuilds()
  }, [user?.id]) // Перезапрашиваем, если ID пользователя изменился (например, при входе)

  // 1. Состояние: Загрузка (показываем красивые скелетоны вместо пустоты)
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="w-24 h-6 bg-blue-50 animate-pulse rounded-full mb-4"></div>
        <div className="w-72 h-10 bg-gray-200 animate-pulse rounded-xl mb-10"></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-[32px]"></div>
          ))}
        </div>
      </div>
    )
  }

  // 2. Состояние: Нет сборок или пользователь не авторизован
  // Секция просто не будет рендериться на главной странице
  if (!builds || builds.length === 0) {
    return null
  }

  // 3. Состояние: Успех (показываем интерактивную сетку)
  return (
    <div className="py-8">
      <div className="flex flex-col mb-10">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 inline-block bg-blue-50 text-blue-600 w-fit">
          История
        </span>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
          Ваши последние сборки
        </h2>
      </div>

      <InteractiveBuildGrid builds={builds} />
    </div>
  )
}

import React from 'react'
import { Gem, Activity, Cable, ShieldCheck } from 'lucide-react'

interface AboutData {
  title?: string
  description?: string
  mission?: string
  founded_year?: number
  team_size?: number
}

export function AboutSection({ data }: { data?: AboutData }) {
  const title = data?.title || 'О компании PC-STORE'
  const description =
    data?.description ||
    'Мы не просто продаем железо. Мы создаем идеальные рабочие станции и игровые машины.\nPC-STORE был основан энтузиастами для энтузиастов.'
  const mission = data?.mission || 'Делать качественный сервис доступным и прозрачным.'
  const currentYear = new Date().getFullYear()
  const yearsInMarket = data?.founded_year ? currentYear - data.founded_year : 5

  return (
    <div className="space-y-12 text-gray-700 leading-relaxed">
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">{title}</h2>
        <div className="text-lg md:text-xl text-gray-600 mb-6 space-y-4">
          {description.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {data?.mission && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-8 rounded-r-3xl my-10">
          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-3">
            Наша миссия
          </h3>
          <p className="text-xl md:text-2xl font-medium text-indigo-950 italic leading-relaxed">
            "{mission}"
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white shadow-sm p-8 rounded-3xl border border-gray-100 text-center flex flex-col justify-center">
          <div className="text-5xl font-black text-blue-600 mb-3">{yearsInMarket}</div>
          <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Лет на рынке
          </div>
        </div>
        <div className="bg-white shadow-sm p-8 rounded-3xl border border-gray-100 text-center flex flex-col justify-center">
          <div className="text-5xl font-black text-blue-600 mb-3">{data?.team_size || '20+'}</div>
          <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Специалистов в команде
          </div>
        </div>
      </div>

      {/* БЛОК С ПРИНЦИПАМИ (ОБНОВЛЕННЫЕ ИКОНКИ) */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Наши принципы</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <Gem className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Только новые детали</h4>
              <p className="text-sm text-gray-500">
                Никакого б/у или рефарба. Все комплектующие распаковываются на камеру.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Activity className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Стресс-тесты 24 часа</h4>
              <p className="text-sm text-gray-500">
                Каждый ПК проходит проверку в OCCT, FurMark и AIDA64 перед отправкой.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Cable className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Идеальный кабель-менеджмент</h4>
              <p className="text-sm text-gray-500">
                Стяжки, липучки, скрытая укладка. Внутри корпуса всё так же красиво, как и снаружи.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Честная гарантия</h4>
              <p className="text-sm text-gray-500">
                Решаем проблемы за дни, а не месяцы. Предоставляем подменный ПК на время ремонта.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

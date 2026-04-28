'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import InteractiveBuildGrid from '@/components/home/InteractiveBuildGrid'
import type { Build } from '@/payload-types'

type BuildTag = 'gaming' | 'budget' | 'workstation'
type TabId = 'all' | BuildTag

// Расширяем тип Build для наших внутренних вычислений
type EnrichedBuild = Build & {
  _price: number
  _searchString: string
}

const getBuildPrice = (build: any): number => {
  if (!build) return 0
  if (build.totalPrice) return Number(build.totalPrice)
  if (build.total_price) return Number(build.total_price)
  if (build.price) return Number(build.price)

  const componentKeys = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler']
  let sum = 0
  for (const key of componentKeys) {
    if (build[key] && build[key].price) sum += Number(build[key].price)
  }
  return sum
}

// Утилита для вытягивания текста из компонентов (для поиска)
const getComponentText = (comp: any): string => {
  if (!comp) return ''
  if (typeof comp === 'string') return comp
  return String(comp.name || comp.title || '')
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'all', label: 'Все сборки', icon: '🖥️' },
  { id: 'gaming', label: 'Для геймеров', icon: '🎮' },
  { id: 'budget', label: 'Бюджетные', icon: '💰' },
  { id: 'workstation', label: 'Рабочие станции', icon: '💼' },
]

const PRICE_FILTERS = [
  { id: 'all', label: 'Любая цена' },
  { id: 'low', label: 'До 50 000 ₽' },
  { id: 'mid', label: '50к – 100к ₽' },
  { id: 'high', label: 'От 100 000 ₽' },
]

const QUICK_FILTERS = [
  { label: 'Intel', terms: ['intel', 'core i'] },
  { label: 'AMD', terms: ['amd', 'ryzen'] },
  { label: 'RTX 4060', terms: ['4060'] },
  { label: 'RTX 4070', terms: ['4070'] },
  { label: 'RTX 4090', terms: ['4090'] },
  { label: 'DDR5', terms: ['ddr5'] },
  { label: '32GB RAM', terms: ['32gb', '32 gb', '32гб', '32 гб'] },
  { label: '16GB RAM', terms: ['16gb', '16 gb', '16гб', '16 гб'] },
  { label: '1TB SSD', terms: ['1tb', '1 tb', '1тб', '1 тб'] },
  { label: '2TB SSD', terms: ['2tb', '2 tb', '2тб', '2 тб'] },
  { label: 'СЖО (Водянка)', terms: ['сжо', 'water', 'liquid', 'водян'] },
  { label: 'Белая сборка', terms: ['white', 'белый', 'белая'] },
  { label: 'Wi-Fi', terms: ['wifi', 'wi-fi'] },
  { label: 'RGB', terms: ['rgb', 'argb', 'подсветк'] },
]

const VALID_TABS = new Set(TABS.map((t) => t.id))

function TabsContent({ initialBuilds }: { initialBuilds: Build[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlTab = searchParams.get('tab') as TabId | null

  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [sort, setSort] = useState('new')
  const [activeChips, setActiveChips] = useState<string[]>([])

  useEffect(() => {
    if (urlTab && VALID_TABS.has(urlTab)) {
      setActiveTab(urlTab)
    } else if (!urlTab) {
      setActiveTab('all')
    }
  }, [urlTab])

  const handleTabChange = (id: TabId) => {
    router.replace(`/builds${id === 'all' ? '' : `?tab=${id}`}`, { scroll: false })
  }

  const toggleChip = (chipLabel: string) => {
    setActiveChips((prev) =>
      prev.includes(chipLabel) ? prev.filter((c) => c !== chipLabel) : [...prev, chipLabel],
    )
  }

  // 🚀 ШАГ 1: Обогащаем данные один раз (Price + Search Index)
  const enrichedBuilds: EnrichedBuild[] = useMemo(() => {
    return initialBuilds.map((b) => {
      // Собираем чистую строку для быстрого поиска
      const searchString = `
        ${(b as any).name || ''}
        ${getComponentText((b as any).cpu)}
        ${getComponentText((b as any).gpu)}
        ${getComponentText((b as any).ram)}
        ${getComponentText((b as any).storage)}
        ${getComponentText((b as any).motherboard)}
        ${getComponentText((b as any).case)}
        ${getComponentText((b as any).cooler)}
        ${getComponentText((b as any).psu)}
        ${b.tags?.join(' ') || ''}
      `.toLowerCase()

      return {
        ...b,
        _price: getBuildPrice(b),
        _searchString: searchString,
      }
    })
  }, [initialBuilds])

  // 🚀 ШАГ 2: Молниеносная фильтрация и сортировка
  const filteredBuilds = useMemo(() => {
    let result = [...enrichedBuilds]

    if (activeTab !== 'all') {
      result = result.filter((b) => (b.tags as BuildTag[])?.includes(activeTab))
    }

    if (priceFilter !== 'all') {
      if (priceFilter === 'low') result = result.filter((b) => b._price < 50000)
      if (priceFilter === 'mid')
        result = result.filter((b) => b._price >= 50000 && b._price <= 100000)
      if (priceFilter === 'high') result = result.filter((b) => b._price > 100000)
    }

    if (activeChips.length > 0) {
      result = result.filter((b) => {
        return activeChips.every((chipLabel) => {
          const chipConfig = QUICK_FILTERS.find((q) => q.label === chipLabel)
          if (!chipConfig) return true
          return chipConfig.terms.some((term) => b._searchString.includes(term.toLowerCase()))
        })
      })
    }

    result.sort((a, b) => {
      if (sort === 'price-asc') return a._price - b._price
      if (sort === 'price-desc') return b._price - a._price
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [enrichedBuilds, activeTab, priceFilter, activeChips, sort])

  const activeFiltersCount = activeChips.length + (priceFilter !== 'all' ? 1 : 0)

  if (!initialBuilds.length) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm mt-12">
        <span className="text-6xl mb-4 block opacity-50">🛠️</span>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Каталог обновляется</h3>
        <p className="text-gray-500">
          Сборки скоро появятся. Мы уже готовим для вас лучшие конфигурации.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <span className="text-blue-600 font-bold uppercase tracking-wider text-xs bg-blue-100 px-3 py-1 rounded-full mb-4 inline-block">
          Коллекция
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight flex flex-wrap justify-center items-center gap-3">
          Готовые сборки ПК
          <span className="text-blue-600 bg-blue-50 px-4 py-1 rounded-2xl text-3xl md:text-5xl font-black">
            {filteredBuilds.length}
          </span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          От бюджетных домашних решений до мощнейших рабочих станций и бескомпромиссных игровых
          монстров. Все сборки проверены на 100% совместимость.
        </p>
      </div>

      {/* ТАБЫ */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={activeTab === tab.id}
            className={`relative px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-500/30 overflow-hidden disabled:cursor-default ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:scale-105'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-t-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
          </button>
        ))}
      </div>

      {/* ПАНЕЛЬ ФИЛЬТРОВ И СОРТИРОВКИ */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-2">
              Бюджет:
            </span>
            {PRICE_FILTERS.map((pf) => (
              <button
                key={pf.id}
                onClick={() => setPriceFilter(pf.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  priceFilter === pf.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100'
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
              Сортировка:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer flex-grow lg:flex-grow-0"
            >
              <option value="new">Сначала новые</option>
              <option value="price-asc">Сначала дешевые</option>
              <option value="price-desc">Сначала дорогие</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-2">
            Особенности:
          </span>
          {QUICK_FILTERS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => toggleChip(chip.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                activeChips.includes(chip.label)
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              {chip.label} {activeChips.includes(chip.label) && '✕'}
            </button>
          ))}

          {/* Сброс фильтров с подсчетом активных */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setPriceFilter('all')
                setActiveChips([])
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors ml-auto focus:outline-none flex items-center gap-1"
            >
              Сбросить фильтры
              <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md text-[10px] ml-1">
                {activeFiltersCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 🚀 АКТИВНЫЕ ФИЛЬТРЫ СВЕРХУ (Микро-UX) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 px-2 animate-in fade-in duration-300">
          <span className="text-sm text-gray-400 mr-1">Применены фильтры:</span>
          {priceFilter !== 'all' && (
            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg text-xs font-bold">
              {PRICE_FILTERS.find((p) => p.id === priceFilter)?.label}
            </span>
          )}
          {activeChips.map((chip) => (
            <span
              key={chip}
              className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              {chip}
              <button
                onClick={() => toggleChip(chip)}
                className="hover:text-red-400 ml-1 focus:outline-none"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* СЕТКА СБОРОК */}
      <div
        key={`${activeTab}-${priceFilter}-${sort}-${activeChips.join('-')}`}
        className="animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300"
      >
        {filteredBuilds.length > 0 ? (
          /* InteractiveBuildGrid ожидает Build[], EnrichedBuild наследует от Build, поэтому TypeScript это пропустит */
          <InteractiveBuildGrid builds={filteredBuilds as Build[]} />
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <span className="text-6xl mb-4 block opacity-50">📭</span>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Ничего не найдено</h3>
            <p className="text-gray-500 mb-6">По вашим фильтрам нет подходящих сборок.</p>

            <button
              onClick={() => {
                handleTabChange('all')
                setPriceFilter('all')
                setActiveChips([])
              }}
              className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg"
            >
              Сбросить все настройки
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BuildsTabs({ initialBuilds = [] }: { initialBuilds: Build[] }) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-64 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium">Загрузка каталога...</p>
        </div>
      }
    >
      <TabsContent initialBuilds={initialBuilds} />
    </Suspense>
  )
}

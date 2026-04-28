'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { InstructionStep } from '@/components/instruction/InstructionStep'
import type { PageData } from '@/lib/api/instruction'

export type TabId = 'builder' | 'configurator'

// 🧩 5. Сайдбар вынесен в конфиг (легко масштабируется)
const SIDEBAR_CONTENT: Record<TabId, string[]> = {
  configurator: [
    'Система сама фильтрует несовместимые детали',
    'Начинайте сборку с выбора процессора',
    'Следите за расчетной мощностью БП',
  ],
  builder: [
    'Сокет процессора должен совпадать с платой',
    'Плата должна поддерживать выбранный тип ОЗУ',
    'Блок питания берите с запасом 20-30%',
  ],
}

// ⚡ 5. Оптимизированный ScrollProgress (requestAnimationFrame + фикс деления на 0)
function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let ticking = false

    const updateScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // 🎯 4. Защита от деления на ноль
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
          if (scrollHeight <= 0) {
            setProgress(0)
          } else {
            setProgress(Number((window.scrollY / scrollHeight).toFixed(2)) * 100)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', updateScroll, { passive: true })
    // Вызов при монтировании
    updateScroll()
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 h-1.5 bg-indigo-600 z-50 transition-all duration-150 ease-out"
      style={{ width: `${progress}%` }}
    />
  )
}

export default function InstructionPageView({
  data,
  activeTab,
}: {
  data: PageData
  activeTab: TabId
}) {
  const TABS: { id: TabId; label: string }[] = [
    { id: 'builder', label: 'Сборка ПК своими руками' },
    { id: 'configurator', label: 'Как работает конфигуратор' },
  ]

  // 🎨 6. Адаптивный индекс для вставки CTA (ровно посередине)
  const dynamicCtaIndex = useMemo(() => {
    return Math.max(0, Math.floor(data.steps.length / 2) - 1)
  }, [data.steps.length])

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-32 relative">
      <ScrollProgress />

      <div className="bg-white shadow-sm mb-10 pb-0 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="h-48 md:h-72 w-full relative flex items-center justify-center overflow-hidden md:rounded-b-[40px] bg-gray-900">
            {data.banner?.url ? (
              <Image
                src={data.banner.url}
                alt={data.banner.alt || 'Баннер'}
                fill
                priority
                className="object-cover opacity-50 mix-blend-overlay"
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-900" />
            )}
            <div className="relative z-10 text-center px-4 animate-in fade-in zoom-in-95 duration-700">
              <span className="text-white/50 text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-3 block">
                Руководство
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                {data.title}
              </h1>
              {data.intro && (
                <p className="text-gray-300 mt-4 max-w-2xl mx-auto font-medium">{data.intro}</p>
              )}
            </div>
          </div>

          <div className="px-6 mt-8 flex flex-wrap gap-8 border-b border-gray-200">
            {TABS.map((t) => {
              const isActive = activeTab === t.id
              return (
                <Link
                  key={t.id}
                  href={`/instruction/${t.id}`}
                  aria-pressed={isActive}
                  className={`relative pb-4 transition-colors text-sm md:text-base font-bold uppercase tracking-wider ${
                    isActive
                      ? 'text-indigo-600 pointer-events-none'
                      : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {t.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-[320px] shrink-0 space-y-6 md:order-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-black text-gray-900 mb-5 text-lg tracking-tight flex items-center gap-2">
              <span className="text-2xl">💡</span>
              {activeTab === 'configurator' ? 'Важно помнить' : 'Чек-лист совместимости'}
            </h3>
            <ul className="space-y-3 text-sm md:text-base text-gray-700 font-medium">
              {/* 🧩 7. Используем уникальный текст как key */}
              {SIDEBAR_CONTENT[activeTab].map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <span className="text-green-500 mt-0.5">✓</span> {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="sticky top-6 hidden md:block">
            <Link
              href="/builder"
              className="group block relative rounded-3xl p-[2px] overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-xl"
            >
              <span
                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 animate-spin-slow"
                style={{ animationDuration: '4s' }}
              />
              <div className="relative bg-gray-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center overflow-hidden h-full border border-gray-800">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/30 blur-[50px] rounded-full pointer-events-none" />
                <div className="text-5xl mb-4 relative z-10 group-hover:-translate-y-2 transition-transform duration-300">
                  🚀
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2 relative z-10">
                  Собрать свой ПК
                </h3>
                <p className="text-gray-400 text-sm font-medium mb-6 relative z-10 leading-relaxed">
                  Перейти в умный конфигуратор со 100% проверкой совместимости
                </p>
                <div className="relative z-10 inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-white/10 rounded-xl border border-white/20 group-hover:bg-indigo-600 transition-colors backdrop-blur-md">
                  Начать сборку &rarr;
                </div>
              </div>
            </Link>
          </div>
        </aside>

        <div className="flex-1 min-w-0 md:order-2">
          <div className="space-y-2">
            {data.steps.map((step: PageData['steps'][0], index: number) => {
              const isLast = index === data.steps.length - 1
              return (
                <React.Fragment key={step.id || `step-${index}`}>
                  <InstructionStep
                    step={step}
                    index={index}
                    totalSteps={data.steps.length}
                    isLast={isLast}
                    variant={index === 0 ? 'highlight' : 'default'}
                  />

                  {/* 🎨 6. Динамическая адаптивная инъекция CTA */}
                  {index === dynamicCtaIndex && !isLast && (
                    <div className="my-10 p-6 md:p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white shadow-xl text-center flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-left">
                        <h4 className="text-xl font-black mb-2">Не хотите собирать руками?</h4>
                        <p className="text-indigo-100 font-medium">
                          Наш алгоритм подберет идеальные комплектующие за вас.
                        </p>
                      </div>
                      <Link
                        href="/builder"
                        className="shrink-0 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg focus:ring-4 focus:ring-indigo-300"
                      >
                        Перейти в конфигуратор
                      </Link>
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>

          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl p-8 border border-indigo-100 text-center mb-8 relative overflow-hidden">
              <h3 className="text-2xl font-black text-indigo-950 mb-3 relative z-10">Готово! 🎉</h3>
              <p className="text-indigo-800 font-medium relative z-10 mb-6">
                Инструкция завершена. Если возникли проблемы — обратитесь в нашу{' '}
                <Link href="/feedback" className="font-bold underline hover:text-indigo-600">
                  службу поддержки
                </Link>
                .
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <Link
                  href="/builder"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  Начать новую сборку
                </Link>
                <Link
                  href="/builds"
                  className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  Смотреть готовые ПК
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 💰 10. Sticky CTA (Мобильная конверсия) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 animate-in slide-in-from-bottom-full duration-500">
        <Link
          href="/builder"
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3.5 px-6 rounded-xl shadow-xl active:scale-95 transition-transform"
        >
          🚀 Собрать свой ПК
        </Link>
      </div>
    </div>
  )
}

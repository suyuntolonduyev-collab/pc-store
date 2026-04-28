import React from 'react'
import Link from 'next/link'
import { INFO_PAGES, InfoSlug } from '@/config/infoPages'
import { ScrollReset } from './ScrollReset'

export default function InfoLayout({
  children,
  activeSlug,
}: {
  children: React.ReactNode
  activeSlug: InfoSlug
}) {
  const menuItems = Object.entries(INFO_PAGES).map(([slug, data]) => ({
    slug: slug as InfoSlug,
    label: data.title,
    icon: data.icon,
  }))

  return (
    <div className="bg-gray-50 min-h-screen pb-24 relative">
      <ScrollReset activeSlug={activeSlug} />

      {/* Шапка */}
      <div className="bg-gray-900 pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Сервис и поддержка
          </h1>
          <p className="text-gray-400 mt-4 text-lg">Все, что нужно знать о работе PC-STORE</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 -mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Сайдбар */}
          <aside className="w-full lg:w-72 shrink-0">
            <nav className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sticky top-24">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSlug === item.slug

                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/info/${item.slug}`}
                        prefetch={false}
                        // Добавлен класс 'group' для работы group-hover внутри
                        className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 pointer-events-none'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500' // Сделал hover иконки синим, выглядит свежее
                          }`}
                        />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          {/* Контент */}
          <main
            key={activeSlug}
            className="flex-1 bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

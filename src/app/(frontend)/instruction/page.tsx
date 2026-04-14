import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { InstructionStep } from '@/components/instruction/InstructionStep'
import type { Config } from '@/payload-types' // или '../../../payload-types' — путь уточните

// Тип для slug глобалки — все допустимые имена
type GlobalSlug = keyof Config['globals']

// Локальный тип для данных страницы (соответствует структуре глобалок)
interface PageData {
  title: string
  intro?: string | null
  banner?: {
    id: string
    url: string
    alt?: string
    width?: number
    height?: number
  } | null
  steps: {
    id?: string | null
    title: string
    description: string
    tip?: string | null
  }[]
}

async function getInstructionData(slug: GlobalSlug): Promise<PageData> {
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    const data = await payload.findGlobal({ slug })
    // Приводим к типу PageData (banner может быть Media или ID, но мы ожидаем populated)
    return data as unknown as PageData
  } catch (error) {
    console.error(`Ошибка загрузки глобалки ${slug}:`, error)
    throw new Error(`Не удалось загрузить инструкцию (${slug})`)
  }
}

export default async function InstructionPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab === 'configurator' ? 'configurator' : 'builder'

  let data: PageData
  try {
    if (activeTab === 'configurator') {
      data = await getInstructionData('instruction-configurator')
    } else {
      data = await getInstructionData('instruction')
    }
  } catch (error) {
    notFound()
  }

  if (!data || !data.steps?.length) {
    notFound()
  }

  const tabHrefs = {
    builder: '/instruction?tab=builder',
    configurator: '/instruction?tab=configurator',
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans pb-16">
      {/* ШАПКА С БАННЕРОМ */}
      <div className="bg-white shadow-sm mb-8 pb-8 md:pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="h-48 md:h-64 w-full relative flex items-center justify-center overflow-hidden md:rounded-b-2xl bg-gray-900">
            {data.banner?.url ? (
              <Image
                src={data.banner.url}
                alt={data.banner.alt || 'Баннер инструкции'}
                fill
                priority
                className="object-cover opacity-90"
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-900" />
            )}
            <span className="relative z-10 text-white/10 text-4xl md:text-6xl font-black tracking-widest uppercase pointer-events-none select-none">
              {activeTab === 'configurator' ? 'CONFIGURATOR' : 'BUILDER'}
            </span>
          </div>

          <div className="px-6 relative flex flex-col md:flex-row items-center md:items-start md:-mt-10 md:space-x-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl border-4 border-white shadow-md flex items-center justify-center z-10 -mt-12 md:mt-0 shrink-0 overflow-hidden">
              <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-4xl">
                {activeTab === 'configurator' ? '⚙️' : '🖥️'}
              </div>
            </div>
            <div className="mt-5 md:mt-12 flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {data.title}
              </h1>
              {data.intro && <p className="text-gray-600 font-medium text-lg mt-2">{data.intro}</p>}
            </div>
          </div>

          {/* ВКЛАДКИ */}
          <div className="px-6 mt-8 flex gap-6 border-b border-gray-200">
            <Link
              href={tabHrefs.builder}
              className={`pb-3 font-medium transition-colors ${
                activeTab === 'builder'
                  ? 'border-b-2 border-indigo-600 font-bold text-indigo-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Сборка ПК
            </Link>
            <Link
              href={tabHrefs.configurator}
              className={`pb-3 font-medium transition-colors ${
                activeTab === 'configurator'
                  ? 'border-b-2 border-indigo-600 font-bold text-indigo-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Конфигуратор
            </Link>
          </div>
        </div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* САЙДБАР (универсальный для обеих вкладок) */}
        <aside className="w-full md:w-[320px] shrink-0 space-y-6 md:order-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-5 text-xl tracking-tight">
              ✅{' '}
              {activeTab === 'configurator' ? 'Советы по конфигуратору' : 'Чек-лист совместимости'}
            </h3>
            <ul className="space-y-3 text-base md:text-lg text-gray-700 font-medium">
              {activeTab === 'configurator' ? (
                <>
                  <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-green-600">✓</span> Конфигуратор сам фильтрует совместимые
                    детали
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-green-600">✓</span> Начинайте с выбора процессора
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-green-600">✓</span> Следите за итоговой мощностью БП
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-green-600">✓</span> Можно сохранить сборку в личном
                    кабинете
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-green-600">✓</span> Сокет CPU = Сокет материнской платы
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-green-600">✓</span> Тип ОЗУ (DDR4/DDR5) поддерживается
                    платой
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-green-600">✓</span> Блок питания с запасом 20-30%
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-green-600">✓</span> Длина видеокарты ≤ размер корпуса
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="sticky top-6">
            <Link
              href="/builder"
              className="group block relative rounded-2xl p-[2px] overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span
                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 animate-spin-slow"
                style={{ animationDuration: '4s' }}
              />
              <div className="relative bg-gray-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center overflow-hidden h-full border border-gray-800">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/30 blur-[50px] rounded-full pointer-events-none" />
                <div className="text-4xl mb-4 relative z-10 group-hover:animate-bounce">🚀</div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2 relative z-10">
                  Собрать свой ПК
                </h3>
                <p className="text-gray-400 text-sm font-medium mb-6 relative z-10">
                  Перейти в умный конфигуратор с проверкой совместимости
                </p>
                <div className="relative z-10 inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-white/10 rounded-full border border-white/20 group-hover:bg-white/20 transition-colors backdrop-blur-md">
                  Начать сборку &rarr;
                </div>
              </div>
            </Link>
          </div>
        </aside>

        {/* СПИСОК ШАГОВ */}
        <div className="flex-1 min-w-0 md:order-2">
          <div className="space-y-6">
            {data.steps.map((step, index) => (
              <InstructionStep key={step.id ?? index} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

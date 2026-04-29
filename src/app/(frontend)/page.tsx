import { Metadata } from 'next'
import Link from 'next/link'
import UserBuildsSection from '@/components/UserBuildsSection'
import FeedbackForm from '@/components/FeedbackForm'

import InteractiveBlogGrid from '@/components/home/InteractiveBlogGrid'
import InteractiveBuildGrid from '@/components/home/InteractiveBuildGrid'
import InteractiveComponentGrid from '@/components/home/InteractiveComponentGrid'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Build, Gpus, Media } from '@/payload-types'

// Импортируем иконки
import {
  Rocket,
  ShieldCheck,
  Truck,
  Cpu,
  Gamepad2,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Power,
  Fan,
  Server,
  Flame,
  Newspaper,
  Briefcase,
  Wrench,
  Settings,
  Plug,
  Wind,
} from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: 'PC-STORE – Идеальные сборки ПК и комплектующие',
  description: 'Умный конфигуратор ПК, игровые и рабочие станции, комплектующие с доставкой.',
  openGraph: {
    title: 'PC-STORE',
    description: 'Собери ПК без ошибок',
  },
}

type GlobalSlug = 'about' | 'contacts' | 'feedback'

interface BlogPost {
  id: number
  title: string
  excerpt?: string | null
  image?: number | Media | null
}

interface SectionHeaderProps {
  title: string
  badge?: string
  linkText?: string
  linkHref?: string
  dark?: boolean
}

const TAGS = { GAMING: 'gaming', BUDGET: 'budget' } as const

const FEATURES = [
  {
    id: 'f-1',
    icon: Rocket,
    title: 'Сборка за 24ч',
    desc: 'Профессиональный кабель-менеджмент и тесты',
  },
  {
    id: 'f-2',
    icon: ShieldCheck,
    title: '3 года гарантии',
    desc: 'Официальная гарантия на все комплектующие',
  },
  {
    id: 'f-3',
    icon: Truck,
    title: 'Бесплатная доставка',
    desc: 'Надежная упаковка и доставка по всей стране',
  },
]

const CATEGORIES = [
  { id: 'cat-cpu', name: 'Процессоры', icon: Cpu, link: '/catalog?category=cpu' },
  { id: 'cat-gpu', name: 'Видеокарты', icon: Gamepad2, link: '/catalog?category=gpu' },
  { id: 'cat-mobo', name: 'Мат. платы', icon: CircuitBoard, link: '/catalog?category=mobo' },
  { id: 'cat-ram', name: 'ОЗУ', icon: MemoryStick, link: '/catalog?category=ram' },
  { id: 'cat-storage', name: 'Накопители', icon: HardDrive, link: '/catalog?category=storage' },
  { id: 'cat-psu', name: 'Блоки питания', icon: Power, link: '/catalog?category=psu' },
  { id: 'cat-cooler', name: 'Охлаждение', icon: Fan, link: '/catalog?category=cooler' },
  { id: 'cat-case', name: 'Корпуса', icon: Server, link: '/catalog?category=case' },
]

const getSafe = <T,>(
  res: PromiseSettledResult<T>,
  name: string,
  fallback: T | null = null,
): T | null => {
  if (res.status === 'fulfilled') return res.value
  console.error(`❌ ${name} failed:`, res.reason)
  return fallback
}

const mapPosts = (docs: any[]): BlogPost[] =>
  docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    excerpt: doc.excerpt || null,
    image: doc.image || null,
  }))

const SectionHeader = ({ title, badge, linkText, linkHref, dark = false }: SectionHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
    <div>
      {badge && (
        <span
          className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3 inline-flex items-center gap-1.5 ${dark ? 'bg-white/10 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-100'}`}
        >
          <Flame className="w-3.5 h-3.5" /> {badge}
        </span>
      )}
      <h2
        className={`text-3xl md:text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}
      >
        {title}
      </h2>
    </div>
    {linkText && linkHref && (
      <Link
        href={linkHref}
        className={`text-sm font-bold transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-2 py-1 -mx-2 ${dark ? 'text-gray-400 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
      >
        {linkText} →
      </Link>
    )}
  </div>
)

const EmptyState = ({
  icon: Icon,
  text,
  dark = false,
}: {
  icon: any
  text: string
  dark?: boolean
}) => (
  <div
    className={`text-center py-16 rounded-3xl ${dark ? 'bg-gray-800/50 border border-gray-700 backdrop-blur-sm' : 'bg-gray-50 border-2 border-dashed border-gray-200'}`}
  >
    <div className="mb-4 flex justify-center">
      <Icon className={`w-12 h-12 ${dark ? 'text-gray-500' : 'text-gray-400'}`} strokeWidth={1.5} />
    </div>
    <p className={`font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{text}</p>
  </div>
)

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const results = await Promise.allSettled([
    payload.find({
      collection: 'builds',
      limit: 4,
      depth: 2,
      where: { and: [{ is_complete: { equals: true } }, { tags: { in: [TAGS.GAMING] } }] },
    }),
    payload.find({
      collection: 'builds',
      limit: 4,
      depth: 2,
      where: { and: [{ is_complete: { equals: true } }, { tags: { in: [TAGS.BUDGET] } }] },
    }),
    payload.find({ collection: 'gpus', limit: 4, depth: 1, sort: '-price' }),
    payload.find({ collection: 'posts', limit: 3, depth: 1, sort: '-createdAt' }),
    payload.findGlobal({ slug: 'about' as GlobalSlug }),
    payload.findGlobal({ slug: 'contacts' as GlobalSlug }),
    payload.findGlobal({ slug: 'feedback' as GlobalSlug }),
  ])

  const gamingDocs = getSafe(results[0], 'Gaming Builds')?.docs
  const budgetDocs = getSafe(results[1], 'Budget Builds')?.docs
  const gpusDocs = getSafe(results[2], 'GPUs')?.docs
  const postsDocs = getSafe(results[3], 'Posts')?.docs

  if (!gamingDocs && !budgetDocs && !gpusDocs && !postsDocs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-10 text-center max-w-md bg-white rounded-3xl shadow-xl border border-gray-100">
          <div className="flex justify-center mb-6">
            <Wrench className="w-16 h-16 text-blue-500 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Обновляем каталог</h2>
          <p className="text-gray-500">
            Сервер временно недоступен или база данных пуста. Пожалуйста, зайдите чуть позже.
          </p>
        </div>
      </div>
    )
  }

  const gamingBuilds = (gamingDocs || []) as Build[]
  const budgetBuilds = (budgetDocs || []) as Build[]
  const gpus = (gpusDocs || []) as Gpus[]
  const posts = postsDocs ? mapPosts(postsDocs) : []

  const aboutData = getSafe(results[4], 'About Data') as any
  const contactsData = getSafe(results[5], 'Contacts Data') as any
  const feedbackData = getSafe(results[6], 'Feedback Data') as any

  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen font-sans">
      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-24 text-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>

        <div className="container mx-auto px-6 relative z-10 text-center animate-in slide-in-from-bottom-8 fade-in duration-700">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-white mb-6">
            Собери ПК своей мечты <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              без ошибок
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Интеллектуальная проверка совместимости, готовые решения от экспертов и огромный выбор
            комплектующих в одном месте.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/builder"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              Собрать ПК
            </Link>
            <Link
              href="/catalog"
              className="px-8 py-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md text-white font-bold hover:bg-white/10 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              Каталог товаров
            </Link>
          </div>
        </div>
      </section>

      {/* ЦИФРЫ ДОВЕРИЯ */}
      <section className="bg-white border-b border-gray-100 relative -mt-5 z-20 rounded-t-[40px]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center py-12">
            <div className="p-4">
              <div className="text-4xl font-black text-blue-600 mb-2">1000+</div>
              <div className="text-gray-500 font-medium">собранных ПК</div>
            </div>
            <div className="p-4 border-y md:border-y-0 md:border-x border-gray-100">
              <div className="text-4xl font-black text-blue-600 mb-2">24ч</div>
              <div className="text-gray-500 font-medium">скорость сборки</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-black text-blue-600 mb-2">проверка</div>
              <div className="text-gray-500 font-medium">несовместимых сборок</div>
            </div>
          </div>
        </div>
      </section>

      {/* КАТЕГОРИИ */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.id}
                  href={cat.link}
                  className="flex flex-col items-center p-4 rounded-2xl hover:bg-blue-50 hover:shadow-sm transition-all group text-center border border-transparent hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon
                      className="w-7 h-7 text-gray-500 group-hover:text-blue-600 transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА СЕРВИСА */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.id}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-start"
              >
                <div
                  className="mb-5 bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Icon className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* УМНАЯ ПРОВЕРКА СОВМЕСТИМОСТИ */}
      <section className="py-20 bg-white border-t border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <span className="text-blue-600 font-bold uppercase tracking-wider text-xs bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">
            Защита от ошибок
          </span>
          <h2 className="text-4xl font-black mb-6 text-gray-900">Умная проверка совместимости</h2>
          <p className="text-gray-500 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            Мы автоматически проверяем совместимость комплектующих на всех уровнях: сокеты, питание,
            размеры корпуса и эффективность охлаждения.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <Settings className="w-8 h-8 text-blue-600 mb-5" />
              <h4 className="font-bold text-gray-900 mb-2 text-lg">CPU + материнка</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Точное совпадение сокетов, чипсетов и поддержка версий BIOS.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <Plug className="w-8 h-8 text-blue-600 mb-5" />
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Блок питания</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Расчет TDP системы с запасом мощности и проверка нужных коннекторов.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <Wind className="w-8 h-8 text-blue-600 mb-5" />
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Размеры и охлад</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Проверка длины GPU и высоты кулера под габариты выбранного корпуса.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* КАК ЭТО РАБОТАЕТ */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <SectionHeader title="Как это работает" badge="3 простых шага" />

          <div className="grid md:grid-cols-3 gap-8 text-center relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-gray-200 via-blue-200 to-gray-200 -translate-y-1/2 z-0"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 transform rotate-3 hover:rotate-0 transition-transform">
                <span className="text-4xl font-black text-blue-600">1</span>
              </div>
              <h3 className="font-black text-xl text-gray-900 mb-3">Выбираешь комплектующие</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
                Начни с любого компонента: добавляй CPU, GPU или крутой корпус.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
                <span className="text-4xl font-black text-blue-600">2</span>
              </div>
              <h3 className="font-black text-xl text-gray-900 mb-3">Система проверяет</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
                Алгоритм блокирует несовместимые детали и советует оптимальные.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 transform rotate-3 hover:rotate-0 transition-transform">
                <span className="text-4xl font-black text-blue-600">3</span>
              </div>
              <h3 className="font-black text-xl text-gray-900 mb-3">Получаешь сборку</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
                Оформляешь заказ, а наши инженеры идеально собирают и тестируют ПК.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ИСТОРИЯ СБОРОК ПОЛЬЗОВАТЕЛЯ */}
      <section className="container mx-auto px-6">
        <UserBuildsSection />
      </section>

      {/* ИГРОВЫЕ СБОРКИ */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <SectionHeader
            title="Мощные игровые сборки"
            badge="Для геймеров"
            linkText="Смотреть все"
            linkHref="/builds?tab=gaming"
          />
          {gamingBuilds.length > 0 ? (
            <InteractiveBuildGrid builds={gamingBuilds} />
          ) : (
            <EmptyState icon={Gamepad2} text="Новые игровые сборки скоро появятся" />
          )}
        </div>
      </section>

      {/* БЮДЖЕТНЫЕ СБОРКИ */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <SectionHeader
            title="Домашние и офисные ПК"
            badge="Бюджетные решения"
            linkText="Смотреть все"
            linkHref="/builds?tab=budget"
          />
          {budgetBuilds.length > 0 ? (
            <InteractiveBuildGrid builds={budgetBuilds} />
          ) : (
            <EmptyState icon={Briefcase} text="Бюджетные решения в процессе сборки" />
          )}
        </div>
      </section>

      {/* ХЭДЛАЙНЕРЫ ПРОДАЖ (GPU) */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden group/section">
        <div className="absolute w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full right-[-200px] bottom-[-200px] pointer-events-none transition-all duration-1000 group-hover/section:bg-blue-500/20" />
        <div className="container mx-auto px-6 relative z-10">
          <SectionHeader
            title="Хэдлайнеры продаж"
            badge="Топ комплектующие"
            linkText="В каталог"
            linkHref="/catalog"
            dark
          />

          {gpus.length > 0 ? (
            <div className="hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-shadow duration-500 rounded-3xl">
              <InteractiveComponentGrid items={gpus} />
            </div>
          ) : (
            <EmptyState icon={Flame} text="Топ-товары обновляются, загляните в каталог" dark />
          )}
        </div>
      </section>

      {/* БЛОГ (НОВОСТИ) */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <SectionHeader title="Блог" badge="Новости" linkText="Все статьи" linkHref="/blog" />
          {posts.length > 0 ? (
            <InteractiveBlogGrid posts={posts} />
          ) : (
            <EmptyState icon={Newspaper} text="Новые статьи уже в пути" />
          )}
        </div>
      </section>

      {/* О НАС И КОНТАКТЫ */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-600 font-bold uppercase tracking-wider text-xs bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">
                {aboutData?.badge || 'О нас'}
              </span>
              <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
                {aboutData?.title || 'Надежный партнер в мире ПК'}
              </h2>
              <div className="text-gray-500 mb-10 space-y-4 leading-relaxed">
                <p>
                  {aboutData?.description ||
                    'Мы собираем мощные, тихие и эстетичные компьютеры из лучших комплектующих на рынке.'}
                </p>
                {aboutData?.mission && (
                  <p className="font-medium text-gray-700 border-l-4 border-blue-500 pl-4">
                    {aboutData.mission}
                  </p>
                )}
              </div>
              {contactsData && (
                <div className="grid sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  {contactsData.phone && (
                    <div>
                      <p className="text-xs text-gray-400 font-bold">Телефон</p>
                      <p className="font-bold">{contactsData.phone}</p>
                    </div>
                  )}
                  {contactsData.email && (
                    <div>
                      <p className="text-xs text-gray-400 font-bold">Email</p>
                      <p className="font-bold">{contactsData.email}</p>
                    </div>
                  )}
                  {contactsData.address && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-400 font-bold">Адрес</p>
                      <p className="font-medium">{contactsData.address}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-50 transform rotate-3 rounded-[40px] -z-10"></div>
              {(!feedbackData || feedbackData.is_enabled !== false) && (
                <FeedbackForm
                  title={feedbackData?.title || 'Остались вопросы?'}
                  subtitle={feedbackData?.subtitle || 'Оставьте заявку, и мы перезвоним.'}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER-LIKE SECTION */}
      <section className="py-12 bg-gray-900 text-center text-gray-500 text-sm px-6">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h4 className="text-white font-black mb-4 text-xl uppercase tracking-widest">PC-STORE</h4>
          <p className="leading-relaxed">
            Мы предлагаем инновационный подход к сборке ПК. Наш конфигуратор защитит вас от ошибок
            совместимости, а эксперты соберут компьютер мечты с идеальным кабель-менеджментом.
          </p>
        </div>
      </section>
    </main>
  )
}

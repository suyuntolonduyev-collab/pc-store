import Link from 'next/link'

const CATEGORIES = [
  { id: 'cat-cpu', name: 'Процессоры', icon: '💻', link: '/catalog' },
  { id: 'cat-gpu', name: 'Видеокарты', icon: '🎮', link: '/catalog' },
  { id: 'cat-mobo', name: 'Мат. платы', icon: '🎛️', link: '/catalog' },
  { id: 'cat-ram', name: 'ОЗУ', icon: '⚡', link: '/catalog' },
  { id: 'cat-storage', name: 'Накопители', icon: '💾', link: '/catalog' },
  { id: 'cat-psu', name: 'Блоки питания', icon: '🔋', link: '/catalog' },
  { id: 'cat-cooler', name: 'Охлаждение', icon: '❄️', link: '/catalog' },
  { id: 'cat-case', name: 'Корпуса', icon: '📦', link: '/catalog' },
]

export default function CategoriesGrid() {
  return (
    <section className="py-12 bg-white border-b border-gray-100 relative -mt-10 z-20 rounded-t-[40px]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="flex flex-col items-center p-4 rounded-2xl hover:bg-blue-50 hover:shadow-sm transition-all group text-center border border-transparent hover:border-blue-100"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">{cat.icon}</span>
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

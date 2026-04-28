const FEATURES = [
  {
    id: 'f-1',
    icon: '🚀',
    title: 'Сборка за 24ч',
    desc: 'Профессиональный кабель-менеджмент и тесты',
  },
  {
    id: 'f-2',
    icon: '🛡️',
    title: '3 года гарантии',
    desc: 'Официальная гарантия на все комплектующие',
  },
  {
    id: 'f-3',
    icon: '🚚',
    title: 'Бесплатная доставка',
    desc: 'Надежная упаковка и доставка по всей стране',
  },
]

export default function FeaturesList() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 grid md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.id}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-start"
          >
            <div
              className="text-4xl mb-5 bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center"
              aria-hidden="true"
            >
              {f.icon}
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

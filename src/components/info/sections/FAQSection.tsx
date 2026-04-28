const FAQS = [
  {
    q: 'Сколько времени занимает сборка ПК?',
    a: 'В среднем сборка и тестирование занимают 2-3 рабочих дня.',
  },
  {
    q: 'Можно ли привезти свои запчасти?',
    a: 'Да, мы можем собрать ПК из ваших комплектующих с гарантией на работу.',
  },
  {
    q: 'Какая термопаста используется?',
    a: 'Мы используем премиальные решения: Arctic MX-6 или Thermal Grizzly.',
  },
]

export function FAQSection({ data }: { data?: any }) {
  return (
    <div>
      <h2 className="text-3xl font-black mb-8 text-gray-900">Часто задаваемые вопросы</h2>
      <div className="space-y-4">
        {FAQS.map((item, i) => (
          <details
            key={i}
            className="group bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all"
          >
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-gray-900 list-none">
              {item.q}
              <span className="transition-transform group-open:rotate-180 text-blue-600">▼</span>
            </summary>
            <div className="px-6 pb-6 text-gray-600 leading-relaxed">{item.a}</div>
          </details>
        ))}
      </div>
    </div>
  )
}

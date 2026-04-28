import React from 'react'

export function CareersSection({ data }: { data?: any }) {
  const JOBS = [
    {
      title: 'Мастер по сборке ПК',
      type: 'Полная занятость',
      location: 'Шоурум',
      salary: 'от 80 000 ₽',
      desc: 'Ищем аккуратного специалиста с опытом кастомных сборок и водяного охлаждения.',
    },
    {
      title: 'Frontend-разработчик (React/Next.js)',
      type: 'Удаленка / Офис',
      location: 'Гибрид',
      salary: 'По результатам собеседования',
      desc: 'Развитие конфигуратора, интеграция с Payload CMS, оптимизация UX/UI.',
    },
    {
      title: 'Менеджер по продажам (B2B/B2C)',
      type: 'Полная занятость',
      location: 'Офис',
      salary: 'Оклад + %',
      desc: 'Консультирование клиентов, подбор конфигураций под задачи (игры, 3D, монтаж).',
    },
  ]

  return (
    <div>
      <div className="mb-12">
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          Присоединяйтесь к команде
        </h2>
        <p className="text-lg text-gray-600">
          Мы ищем гиков, фанатов технологий и просто хороших людей, которые хотят делать крутой
          продукт на стыке IT и железа.
        </p>
      </div>

      <div className="space-y-6">
        {JOBS.map((job, i) => (
          <div
            key={i}
            className="group border border-gray-200 rounded-3xl p-6 md:p-8 hover:border-blue-600 hover:shadow-xl transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm font-medium text-gray-500">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">{job.type}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">{job.location}</span>
                </div>
              </div>
              <div className="text-left md:text-right">
                <span className="inline-block bg-green-50 text-green-700 font-bold px-4 py-2 rounded-xl">
                  {job.salary}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-6">{job.desc}</p>
            <a
              href="mailto:hr@pc-store.ru"
              className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Откликнуться на вакансию &rarr;
            </a>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-600 text-white p-8 md:p-12 rounded-[40px] text-center">
        <h4 className="text-2xl font-black mb-4">Не нашли подходящую вакансию?</h4>
        <p className="text-blue-100 mb-8 max-w-lg mx-auto">
          Если вы уверены, что ваш опыт будет полезен нашей компании, присылайте резюме на почту —
          мы обязательно его рассмотрим!
        </p>
        <a
          href="mailto:hr@pc-store.ru"
          className="inline-block bg-white text-blue-900 font-black px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
        >
          hr@pc-store.ru
        </a>
      </div>
    </div>
  )
}

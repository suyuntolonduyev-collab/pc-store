import React from 'react'
import { Clock, Map } from 'lucide-react'

interface ContactsData {
  phone?: string
  email?: string
  address?: string
  working_hours?: string
  telegram?: string
  whatsapp?: string
}

export function ContactsSection({ data }: { data?: ContactsData }) {
  const address = data?.address || 'г. Москва, ул. Технологическая, 42'
  const workingHours = data?.working_hours || 'Ежедневно с 10:00 до 21:00'
  const phone = data?.phone || '8 (800) 555-35-35'
  const email = data?.email || 'support@pc-store.ru'

  return (
    <div>
      <h2 className="text-3xl font-black mb-10 text-gray-900 tracking-tight">Свяжитесь с нами</h2>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <h4 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-3">
              Шоурум и Самовывоз
            </h4>
            <p className="text-lg font-bold text-gray-900 mb-1">{address}</p>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" /> {workingHours}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <h4 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-3">
              Поддержка клиентов
            </h4>
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="block text-2xl font-black text-gray-900 hover:text-blue-600 transition-colors mb-2"
            >
              {phone}
            </a>
            <a href={`mailto:${email}`} className="text-blue-600 font-bold hover:underline text-lg">
              {email}
            </a>
          </div>

          {(data?.telegram || data?.whatsapp) && (
            <div className="flex gap-4 pt-4">
              {data.telegram && (
                <a
                  href={data.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-[#229ED9] hover:bg-[#1c84b5] text-white font-bold py-4 px-6 rounded-2xl transition-colors text-center shadow-lg shadow-[#229ED9]/20"
                >
                  Telegram
                </a>
              )}
              {data.whatsapp && (
                <a
                  href={data.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-[#25D366] hover:bg-[#1fad53] text-white font-bold py-4 px-6 rounded-2xl transition-colors text-center shadow-lg shadow-[#25D366]/20"
                >
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-[40px] aspect-square flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 blur-[80px] rounded-full pointer-events-none" />
          <Map className="w-16 h-16 text-blue-400 mb-6 z-10" />
          <h3 className="text-2xl font-black text-white mb-4 z-10">Ждем в гости</h3>
          <p className="text-gray-400 font-medium z-10">
            Приходите посмотреть на готовые сборки вживую или обсудить ваш будущий проект за чашкой
            кофе.
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // Имитация подписки
    toast.success('Спасибо за подписку! Проверьте ваш email.')
    setEmail('')
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Основная сетка футера */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* КОЛОНКА 1: Помощь и информация о магазине */}
          <div>
            <h3 className="text-white text-lg font-bold mb-5 tracking-wide">Покупателям</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/info/about"
                  prefetch={false}
                  className="hover:text-blue-400 transition-colors"
                >
                  О компании
                </Link>
              </li>
              <li>
                <Link
                  href="/info/delivery"
                  prefetch={false}
                  className="hover:text-blue-400 transition-colors"
                >
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link
                  href="/info/returns"
                  prefetch={false}
                  className="hover:text-blue-400 transition-colors"
                >
                  Возврат и обмен товара
                </Link>
              </li>
              <li>
                <Link
                  href="/info/warranty"
                  prefetch={false}
                  className="hover:text-blue-400 transition-colors"
                >
                  Гарантия
                </Link>
              </li>
              <li>
                <Link
                  href="/info/faq"
                  prefetch={false}
                  className="hover:text-blue-400 transition-colors"
                >
                  Вопросы и ответы (FAQ)
                </Link>
              </li>
              <li>
                <Link
                  href="/info/contacts"
                  prefetch={false}
                  className="hover:text-blue-400 transition-colors"
                >
                  Контакты
                </Link>
              </li>
              <li>
                <Link
                  href="/info/jobs"
                  prefetch={false}
                  className="hover:text-blue-400 transition-colors"
                >
                  Вакансии
                </Link>
              </li>
            </ul>
          </div>

          {/* КОЛОНКА 2: Навигация по каталогу */}
          <div>
            <h3 className="text-white text-lg font-bold mb-5 tracking-wide">Каталог</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/catalog" className="hover:text-blue-400 transition-colors">
                  Процессоры
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-blue-400 transition-colors">
                  Видеокарты
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-blue-400 transition-colors">
                  Материнские платы
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-blue-400 transition-colors">
                  Оперативная память
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-blue-400 transition-colors">
                  Периферия и аксессуары
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/builder"
                  className="text-white font-semibold hover:text-blue-400 transition-colors"
                >
                  Конфигуратор ПК
                </Link>
              </li>
              <li>
                <Link
                  href="/builds"
                  className="text-white font-semibold hover:text-blue-400 transition-colors"
                >
                  Готовые сборки
                </Link>
              </li>
            </ul>
          </div>

          {/* КОЛОНКА 3: Подписка и Соцсети */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-lg font-bold mb-5 tracking-wide">
              Скидка 5% за подписку
            </h3>
            <p className="text-sm mb-4 leading-relaxed">
              Подпишитесь на нашу рассылку, чтобы первыми узнавать о новинках железа, закрытых
              распродажах и получить скидку на первый заказ.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 mb-8">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email адрес"
                className="bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full transition-all"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shrink-0"
              >
                Подписаться
              </button>
            </form>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              {/* Соцсети */}
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm">Мы в соцсетях:</h4>
                <div className="flex gap-3">
                  {/* Telegram */}
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors text-white"
                    aria-label="Telegram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                  </a>
                  {/* VK */}
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors text-white"
                    aria-label="ВКонтакте"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.3 14.15c-.2.62-.87.89-1.28.89h-1.6c-.57 0-.82-.27-1.1-.64-.53-.7-1.03-1.4-1.63-2.01-.27-.27-.58-.56-.99-.56-.16 0-.32.08-.43.25-.19.3-.19.8-.19 1.15 0 .4-.09.95-.56 1.18-.32.14-1.18.23-2.07-.15-1.57-.66-2.82-2.11-3.8-3.7-1.32-2.16-2.1-4.66-2.19-5.01-.06-.23.01-.48.16-.65.16-.17.38-.26.62-.26h1.72c.4 0 .68.16.85.54.49 1.11 1.17 2.37 1.93 3.42.27.37.52.74.88.74.12 0 .25-.05.35-.15.17-.18.17-.54.17-.86V9.45c0-.63-.17-1.07-.63-1.27.35-.38.9-.53 1.5-.53h1.26c.45 0 .7.12.86.3.2.22.18.57.18.99v2.74c0 .35 0 .8.27.97.09.06.21.08.33.08.31 0 .61-.24.87-.51.7-.72 1.3-1.64 1.83-2.61.16-.31.39-.52.73-.52h1.68c.28 0 .54.09.7.28.16.2.21.46.12.72-.44 1.17-1.24 2.22-2.16 3.16-.38.39-.67.7-.67 1.05 0 .31.25.61.59.98 1.03 1.15 1.83 2.18 2.2 3.12.16.4.03.88-.34 1.11z" />
                    </svg>
                  </a>
                  {/* YouTube */}
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors text-white"
                    aria-label="YouTube"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM9.99 15V9l6.5 3-6.5 3z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Платежные системы */}
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm sm:text-right">
                  Способы оплаты:
                </h4>
                <div className="flex gap-2 justify-start sm:justify-end">
                  <span className="bg-gray-800 text-xs font-bold px-3 py-1.5 rounded flex items-center">
                    MIR
                  </span>
                  <span className="bg-gray-800 text-xs font-bold px-3 py-1.5 rounded flex items-center">
                    VISA
                  </span>
                  <span className="bg-gray-800 text-xs font-bold px-3 py-1.5 rounded flex items-center">
                    Mastercard
                  </span>
                  <span className="bg-gray-800 text-xs font-bold px-3 py-1.5 rounded flex items-center">
                    СБП
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* НИЖНЯЯ СТРОКА: Юридические документы и копирайт */}
        <div className="pt-8 border-t border-gray-800 flex flex-col lg:flex-row justify-between items-center gap-6 text-xs">
          {/* Копирайт и реквизиты */}
          <div className="text-center lg:text-left">
            <p className="text-white text-sm font-medium mb-1">
              © 2023-{currentYear} PC-STORE. Все права защищены.
            </p>
            <p className="text-gray-500">ООО «ПС-СТОРЕ», ИНН: 7712345678, ОГРН: 1237700000000</p>
          </div>

          {/* Юридические ссылки */}
          <div className="flex flex-wrap justify-center lg:justify-end gap-x-6 gap-y-2">
            <Link href="/offer" className="hover:text-white transition-colors">
              Публичная оферта
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/data-agreement" className="hover:text-white transition-colors">
              Согласие на обработку ПД
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Политика Cookies
            </Link>
            {/* Кнопка Вход / Личный кабинет */}
            <Link
              href="/profile"
              className="text-blue-500 hover:text-blue-400 font-semibold transition-colors ml-2"
            >
              Личный кабинет →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

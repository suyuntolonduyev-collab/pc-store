import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-12 rounded-[40px] shadow-xl border border-gray-100 max-w-lg w-full">
        <Compass className="w-24 h-24 mx-auto mb-8 text-blue-600" strokeWidth={1.5} />
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Страница не найдена
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          Кажется, вы перешли по неверной ссылке или эта страница была удалена.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-colors shadow-lg shadow-blue-600/20"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}

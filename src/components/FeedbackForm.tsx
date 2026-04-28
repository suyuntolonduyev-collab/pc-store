'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function FeedbackForm({
  title = 'Свяжитесь с нами',
  subtitle = 'Оставьте свои данные, и мы перезвоним вам в течение 15 минут.',
}: {
  title?: string
  subtitle?: string
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      // Здесь вы можете отправлять данные в коллекцию 'Feedback' или 'Messages' в Payload CMS
      // await fetch('/api/messages', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })

      await new Promise((resolve) => setTimeout(resolve, 1000)) // Имитация загрузки
      toast.success('Сообщение успешно отправлено!')
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      toast.error('Произошла ошибка при отправке')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto w-full relative z-10">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя</label>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Иван Иванов"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="+7 (999) 000-00-00"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сообщение или вопрос
          </label>
          <textarea
            name="message"
            rows={4}
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            placeholder="Напишите, какой ПК вы хотите собрать..."
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
        </button>
      </form>
    </div>
  )
}

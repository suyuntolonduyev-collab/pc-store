'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import formatPrice from '@/utils/formatPrice'
import { getSingleBuildPrice } from '@/utils/getBuildPrice'

export default function CheckoutPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const items = useCartStore((state) => state.items)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const clearCart = useCartStore((state) => state.clearCart)
  const user = useAuthStore((state) => state.user)

  const totalItemsCount = useMemo(() => {
    return items.reduce((acc, cartItem) => acc + cartItem.quantity, 0)
  }, [items])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'card_online',
  })

  useEffect(() => {
    setIsMounted(true)
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Пожалуйста, авторизуйтесь для оформления заказа')
      router.push('/login')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. СНАЧАЛА СОХРАНЯЕМ ВСЕ ЛОКАЛЬНЫЕ СБОРКИ В БАЗУ ДАННЫХ
      const finalItems = await Promise.all(
        items.map(async ({ item, quantity }) => {
          if (item.type === 'build') {
            const prod = item.product

            // Если ID очень большой (Date.now()), значит это наша локальная несхраненная сборка
            if (typeof prod.id === 'number' && prod.id > 1000000000000) {
              const buildPayload = {
                name: prod.name,
                user: user.id,
                is_complete: prod.is_complete,
                tags: prod.tags || [],
                cpu: typeof prod.cpu === 'object' ? prod.cpu?.id : prod.cpu,
                mobo: typeof prod.mobo === 'object' ? prod.mobo?.id : prod.mobo,
                gpu: typeof prod.gpu === 'object' ? prod.gpu?.id : prod.gpu,
                ram: typeof prod.ram === 'object' ? prod.ram?.id : prod.ram,
                psu: typeof prod.psu === 'object' ? prod.psu?.id : prod.psu,
                case: typeof prod['case'] === 'object' ? prod['case']?.id : prod['case'],
                cooler: typeof prod.cooler === 'object' ? prod.cooler?.id : prod.cooler,
                storage: typeof prod.storage === 'object' ? prod.storage?.id : prod.storage,
              }

              const res = await fetch('/api/builds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(buildPayload),
              })

              if (!res.ok) {
                const errData = await res.json().catch(() => null)
                throw new Error(errData?.errors?.[0]?.message || 'Ошибка сохранения сборки в БД')
              }

              const savedBuild = await res.json()
              return { type: 'build', build: savedBuild.doc.id, quantity }
            } else {
              // Если сборка уже есть в БД (например, загружена из Профиля)
              return { type: 'build', build: prod.id, quantity }
            }
          } else {
            // Если это просто аксессуар
            return { type: 'accessory', accessory: item.product.id, quantity }
          }
        }),
      )

      // 🟢 2. ТЕПЕРЬ СОЗДАЕМ ЗАКАЗ
      const orderPayload = {
        contactName: formData.name,
        phone: formData.phone,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        status: 'pending',
        user: user.id,
        items: finalItems, // Передаем реальные ID из базы
      }

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderPayload),
      })

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => null)
        throw new Error(errData?.errors?.[0]?.message || 'Ошибка сохранения заказа в БД')
      }

      // 🟢 3. ОПЛАТА СТРАЙП
      if (formData.paymentMethod === 'card_online') {
        const stripeItems = items.map(({ item, quantity }) => {
          if (item.type === 'build') {
            return {
              title: item.product.name || `Сборка ПК #${item.product.id}`,
              price: getSingleBuildPrice(item.product),
              quantity,
            }
          } else {
            return { title: item.product.name, price: item.product.price ?? 0, quantity }
          }
        })

        const stripeRes = await fetch('/api/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ items: stripeItems }),
        })

        const data = await stripeRes.json()
        if (data.url) {
          window.location.href = data.url
          return
        } else {
          throw new Error(data.error || 'Ошибка инициализации оплаты Stripe')
        }
      } else {
        toast.success('Заказ успешно оформлен! Оплата при получении.', { duration: 5000 })
        clearCart()
        router.push('/')
      }
    } catch (error) {
      console.error('Checkout Error:', error)
      const message =
        error instanceof Error ? error.message : 'Произошла ошибка при оформлении заказа'
      toast.error(message)
      setIsSubmitting(false)
    }
  }

  if (isMounted && items.length === 0) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Для оформления заказа добавьте товары в корзину
        </h1>
        <Link
          href="/catalog"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
        >
          Перейти к покупкам
        </Link>
      </div>
    )
  }

  if (!isMounted) return null

  return (
    <div className="container mx-auto py-8 px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Оформление заказа</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Левая колонка */}
        <div className="lg:col-span-2 space-y-6">
          {/* Контактные данные */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Контактные данные</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Имя и Фамилия <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                  placeholder="+996 (555) 00-00-00"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                  className="w-full border border-gray-300 bg-gray-50 text-gray-500 rounded-lg px-4 py-2.5 outline-none mt-1 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Доставка */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Доставка</h2>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Адрес <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                required
                rows={2}
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none mt-1"
                placeholder="Город, улица, дом, квартира..."
              />
            </div>
          </div>

          {/* Оплата */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Способ оплаты</h2>
            <div className="space-y-3">
              <label
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                  formData.paymentMethod === 'card_online'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card_online"
                  checked={formData.paymentMethod === 'card_online'}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 font-medium text-gray-900">Картой онлайн (Stripe)</span>
              </label>
              <label
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                  formData.paymentMethod === 'cash_delivery'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_delivery"
                  checked={formData.paymentMethod === 'cash_delivery'}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 font-medium text-gray-900">Наличными при получении</span>
              </label>
            </div>
          </div>
        </div>

        {/* Правая колонка — итоги */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Состав заказа</h2>

          <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 max-h-[40vh] overflow-y-auto pr-2">
            {items.map((cartItem) => {
              if (!cartItem?.item) return null
              const { id, item, quantity } = cartItem

              const name =
                item.type === 'build'
                  ? item.product.name || `Сборка ПК #${item.product.id}`
                  : item.product.name

              const price =
                item.type === 'build'
                  ? getSingleBuildPrice(item.product)
                  : (item.product.price ?? 0)

              return (
                <div key={id} className="flex justify-between items-start text-sm">
                  <div className="flex-1 pr-4">
                    <span className="font-medium text-gray-800 line-clamp-2 leading-tight">
                      {name}
                    </span>
                    <span className="text-gray-500 block mt-1">{quantity} шт.</span>
                  </div>
                  <span className="font-semibold text-gray-900 whitespace-nowrap mt-0.5">
                    {formatPrice(price * quantity)}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Товары ({totalItemsCount} шт.)</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Доставка</span>
              <span className="text-green-600 font-medium">Бесплатно</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8">
            <span className="text-lg font-semibold text-gray-900">К оплате:</span>
            <span className="text-3xl font-black text-blue-600">
              {formatPrice(getTotalPrice())}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-4 rounded-xl transition-all flex justify-center items-center shadow-md disabled:shadow-none"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Обработка...
              </span>
            ) : formData.paymentMethod === 'card_online' ? (
              'Оплатить онлайн'
            ) : (
              'Подтвердить заказ'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

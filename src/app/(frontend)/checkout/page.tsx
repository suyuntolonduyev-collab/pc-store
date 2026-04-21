'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import formatPrice from '@/utils/formatPrice'
import { getSingleBuildPrice } from '@/utils/getBuildPrice'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const items = useCartStore((state) => state.items)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const clearCart = useCartStore((state) => state.clearCart)
  const user = useAuthStore((state) => state.user)

  const totalItemsCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0)
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
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (formData.paymentMethod === 'card_online') {
        // 🟢 1. Адаптируем данные для Stripe под новую структуру корзины
        const stripeItems = items.map(({ item, quantity }) => {
          if (item.type === 'build') {
            return {
              title: item.product.name || `Сборка ПК #${item.product.id}`,
              price: getSingleBuildPrice(item.product),
              quantity: quantity,
            }
          }
          // item.type === 'accessory'
          return {
            title: item.product.name,
            price: item.product.price ?? 0,
            quantity: quantity,
          }
        })

        const res = await fetch('/api/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: stripeItems }),
        })

        const data = await res.json()

        if (data.url) {
          window.location.href = data.url
          return
        } else {
          toast.error(data.error || 'Ошибка инициализации оплаты')
          setIsSubmitting(false)
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        toast.success('Заказ оформлен! Оплата при получении.', { duration: 4000 })
        clearCart()
        router.push('/')
      }
    } catch (error) {
      console.error('Checkout Error:', error)
      const message = error instanceof Error ? error.message : 'Произошла ошибка'
      toast.error(message)
      setIsSubmitting(false)
    }
  }

  if (isMounted && items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center min-h-[50vh] justify-center">
        <h1 className="text-2xl font-bold mb-6">Для оформления заказа добавьте товары в корзину</h1>
        <Link
          href="/catalog"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl"
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
        {/* Форма */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Контактные данные</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label>
                  Имя и Фамилия <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg"
                  placeholder="Иван Иванов"
                />
              </div>
              <div>
                <label>
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg"
                  placeholder="+996 (555) 00-00-00"
                />
              </div>
              <div className="sm:col-span-2">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg"
                  placeholder="ivan@example.com"
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-bold mb-6">Доставка</h2>
            <div>
              <label>
                Адрес <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-lg resize-none"
                placeholder="Город, улица..."
              />
            </div>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-bold mb-6">Способ оплаты</h2>
            <div className="space-y-3">
              <label
                className={`flex items-center p-4 border rounded-xl ${formData.paymentMethod === 'card_online' ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card_online"
                  checked={formData.paymentMethod === 'card_online'}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                />
                <span className="ml-3">Картой онлайн (Stripe)</span>
              </label>
              <label
                className={`flex items-center p-4 border rounded-xl ${formData.paymentMethod === 'cash_delivery' ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_delivery"
                  checked={formData.paymentMethod === 'cash_delivery'}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                />
                <span className="ml-3">Наличными</span>
              </label>
            </div>
          </div>
        </div>

        {/* Сайдбар */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border sticky top-24">
          <h2 className="text-xl font-bold mb-6">Состав заказа</h2>

          <div className="space-y-4 mb-6 pb-6 border-b max-h-[40vh] overflow-y-auto pr-2">
            {items.map(({ id, item, quantity }) => {
              // 🟢 2. Правильно отображаем и сборки, и аксессуары
              const name = item.type === 'build' ? item.product.name || 'Сборка' : item.product.name
              const price =
                (item.type === 'build'
                  ? getSingleBuildPrice(item.product)
                  : (item.product.price ?? 0)) * quantity

              return (
                <div key={id} className="flex justify-between items-start text-sm">
                  <div className="flex-1 pr-4">
                    <span className="font-medium line-clamp-2">{name}</span>
                    <span className="text-gray-500 block mt-1">{quantity} шт.</span>
                  </div>
                  <span className="font-semibold whitespace-nowrap mt-0.5">
                    {formatPrice(price)}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="space-y-3 mb-6 pb-6 border-b">
            <div className="flex justify-between">
              <span>Товары ({totalItemsCount})</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
          <div className="flex justify-between items-end mb-8">
            <span className="text-lg">К оплате:</span>
            <span className="text-3xl font-black">{formatPrice(getTotalPrice())}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl flex justify-center items-center"
          >
            {isSubmitting
              ? 'Загрузка...'
              : formData.paymentMethod === 'card_online'
                ? 'Оплатить онлайн'
                : 'Подтвердить заказ'}
          </button>
        </div>
      </form>
    </div>
  )
}

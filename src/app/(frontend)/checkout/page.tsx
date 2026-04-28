'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import formatPrice from '@/utils/formatPrice'
import { getSingleBuildPrice } from '@/utils/getBuildPrice'
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Lock,
  User,
  Phone,
  Mail,
  MapPin,
  PackageOpen,
  MonitorPlay,
  CheckCircle2,
  ChevronRight,
  Loader2,
  ShoppingCart,
} from 'lucide-react'

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
      // 1. СОХРАНЯЕМ ВРЕМЕННЫЕ СБОРКИ В БАЗУ ДАННЫХ
      const finalItemIds = await Promise.all(
        items.map(async ({ item, quantity }) => {
          if (item.type === 'build') {
            const prod = item.product

            if (typeof prod.id === 'number' && prod.id > 1000000000000) {
              const validTags = (prod.tags || []).filter((t) =>
                ['gaming', 'budget', 'workstation'].includes(t),
              )

              const buildPayload = {
                name: prod.name,
                user: user.id,
                is_complete: prod.is_complete,
                tags: validTags,
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

              if (res.status === 403) throw new Error('AUTH_EXPIRED')

              if (!res.ok) {
                const errData = await res.json().catch(() => null)
                throw new Error(errData?.errors?.[0]?.message || 'Ошибка сохранения сборки в БД')
              }

              const savedBuild = await res.json()
              return { type: 'build', id: savedBuild.doc.id, quantity }
            } else {
              return { type: 'build', id: prod.id, quantity }
            }
          } else {
            return { type: 'accessory', id: item.product.id, quantity }
          }
        }),
      )

      // 2. СОЗДАЕМ ЗАКАЗ
      const orderPayload = {
        contactName: formData.name,
        phone: formData.phone,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        user: user.id,
        items: finalItemIds.map((item) => ({
          type: item.type,
          build: item.type === 'build' ? item.id : null,
          accessory: item.type === 'accessory' ? item.id : null,
          quantity: item.quantity,
        })),
      }

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderPayload),
      })

      if (orderRes.status === 403) throw new Error('AUTH_EXPIRED')

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => null)
        throw new Error(errData?.errors?.[0]?.message || 'Ошибка создания заказа')
      }

      // 3. ОПЛАТА STRIPE ИЛИ НАЛИЧНЫЕ
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
        if (data.url) return (window.location.href = data.url)
        else throw new Error(data.error || 'Ошибка Stripe')
      } else {
        toast.success('Заказ успешно оформлен!', { icon: '🎉' })
        clearCart()
        router.push('/')
      }
    } catch (error) {
      console.error('Checkout Error:', error)
      setIsSubmitting(false)

      if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
        toast.error('Ваша сессия истекла. Пожалуйста, войдите снова.')
        useAuthStore.getState().logout()
        router.push('/login')
      } else {
        toast.error(error instanceof Error ? error.message : 'Произошла ошибка')
      }
    }
  }

  if (isMounted && items.length === 0) {
    return (
      <div className="container mx-auto py-20 px-4 flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-[3rem] mt-8 shadow-sm border border-gray-100">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <PackageOpen className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3 text-center">
          Оформление недоступно
        </h1>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Ваша корзина пуста. Добавьте комплектующие или готовую сборку для заказа.
        </p>
        <Link
          href="/catalog"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          Перейти в каталог
        </Link>
      </div>
    )
  }

  if (!isMounted) return null

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* SECURITY HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-gray-100 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Оформление заказа</h1>
          <p className="text-gray-500 font-medium mt-1">
            Остался всего один шаг до вашего нового ПК
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          <Lock className="w-4 h-4" /> Безопасный платеж (SSL)
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* ЛЕВАЯ КОЛОНКА (Формы) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. КОНТАКТЫ */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                1
              </span>
              Контактные данные
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">
                  Имя и Фамилия <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="Иван Иванов"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="+996 (555) 00-00-00"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full border border-gray-100 bg-gray-50 text-gray-500 rounded-xl pl-12 pr-4 py-3.5 outline-none cursor-not-allowed font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. ДОСТАВКА */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                2
              </span>
              Куда доставить?
            </h2>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">
                Адрес доставки <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-5 w-5 h-5 text-gray-400" />
                <textarea
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                  placeholder="Город, улица, дом, квартира, подъезд..."
                />
              </div>
            </div>
          </div>

          {/* 3. ОПЛАТА (Премиальный вид) */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                3
              </span>
              Способ оплаты
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'card_online' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200 bg-white'}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card_online"
                  checked={formData.paymentMethod === 'card_online'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.paymentMethod === 'card_online' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  {formData.paymentMethod === 'card_online' && (
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <span className="font-black text-gray-900 mb-1">Оплата картой онлайн</span>
                <span className="text-xs text-gray-500 font-medium">
                  Apple Pay, Google Pay, Visa, Mastercard. Без комиссии.
                </span>
              </label>

              <label
                className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cash_delivery' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200 bg-white'}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_delivery"
                  checked={formData.paymentMethod === 'cash_delivery'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.paymentMethod === 'cash_delivery' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                  >
                    <Banknote className="w-5 h-5" />
                  </div>
                  {formData.paymentMethod === 'cash_delivery' && (
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <span className="font-black text-gray-900 mb-1">Оплата при получении</span>
                <span className="text-xs text-gray-500 font-medium">
                  Наличными или переводом курьеру после проверки ПК.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Итоги) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" /> Ваш заказ
            </h2>

            {/* СПИСОК ТОВАРОВ */}
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-800 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((cartItem) => {
                if (!cartItem?.item) return null
                const { id, item, quantity } = cartItem
                const isBuild = item.type === 'build'
                const name = isBuild
                  ? item.product.name || `Сборка ПК #${item.product.id}`
                  : item.product.name
                const price = isBuild
                  ? getSingleBuildPrice(item.product)
                  : (item.product.price ?? 0)

                return (
                  <div
                    key={id}
                    className="flex gap-4 items-center bg-gray-800/50 p-3 rounded-2xl border border-gray-700/50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                      {isBuild ? (
                        <MonitorPlay className="w-6 h-6 text-blue-400" />
                      ) : (
                        <PackageOpen className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-100 line-clamp-2 leading-tight">
                        {name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {quantity} шт. × {formatPrice(price)}
                      </p>
                    </div>
                    <div className="font-black text-white shrink-0">
                      {formatPrice(price * quantity)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ЧЕК */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-800 text-sm font-medium">
              <div className="flex justify-between text-gray-400">
                <span>Товары ({totalItemsCount} шт.)</span>
                <span className="text-gray-100">{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Профессиональная сборка</span>
                <span className="text-blue-400">В подарок</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Доставка курьером</span>
                <span className="text-green-400">Бесплатно</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-sm font-black uppercase text-gray-400 tracking-widest">
                Итого к оплате:
              </span>
              <span className="text-4xl font-black text-white tracking-tight">
                {formatPrice(getTotalPrice())}
              </span>
            </div>

            {/* ДИНАМИЧЕСКАЯ КНОПКА ОПЛАТЫ */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black py-4.5 px-6 rounded-2xl transition-all flex justify-center items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Обработка заказа...
                </>
              ) : formData.paymentMethod === 'card_online' ? (
                <>
                  ОПЛАТИТЬ ОНЛАЙН <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  ПОДТВЕРДИТЬ ЗАКАЗ <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* TRUST SIGNALS */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs font-medium text-gray-400 bg-gray-800/50 p-3 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" /> Гарантия возврата денег,
                если ПК не оправдает ожиданий.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

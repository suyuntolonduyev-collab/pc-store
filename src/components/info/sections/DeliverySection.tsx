import React from 'react'
import { Truck, Store, CheckCircle2 } from 'lucide-react'

export function DeliverySection({ data }: { data?: any }) {
  return (
    <div className="prose prose-lg max-w-none">
      <h2 className="text-3xl font-black mb-8 text-gray-900">Доставка и оплата</h2>

      <div className="grid md:grid-cols-2 gap-8 not-prose mb-12">
        <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100">
          <Truck className="w-8 h-8 text-blue-600 mb-5" />
          <h4 className="text-xl font-bold mb-2">Курьерская доставка</h4>
          <p className="text-gray-600 text-sm">
            Доставим до двери в течение 24 часов после сборки. Проверка при получении.
          </p>
        </div>
        <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100">
          <Store className="w-8 h-8 text-indigo-600 mb-5" />
          <h4 className="text-xl font-bold mb-2">Самовывоз</h4>
          <p className="text-gray-600 text-sm">
            Заберите готовую сборку в нашем шоуруме бесплатно в любое удобное время.
          </p>
        </div>
      </div>

      <h3 className="text-2xl font-black mt-12 mb-6">Способы оплаты</h3>
      <ul className="space-y-4 text-gray-700 list-none pl-0">
        <li className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <span>
            <strong>Банковские карты:</strong> Visa, MasterCard, МИР
          </span>
        </li>
        <li className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <span>
            <strong>Рассрочка 0-0-12:</strong> Оформление онлайн за 5 минут
          </span>
        </li>
        <li className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <span>
            <strong>Оплата по счету:</strong> Для юридических лиц (с НДС)
          </span>
        </li>
      </ul>
    </div>
  )
}

import React from 'react'
import { Shield, Wrench, CheckCircle2 } from 'lucide-react'

export function WarrantySection({ isReturns = false, data }: { isReturns?: boolean; data?: any }) {
  if (isReturns) {
    return (
      <div className="space-y-8 text-gray-700 leading-relaxed">
        <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">
          Возврат и обмен товара
        </h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-2xl">
          <p className="text-yellow-800 font-medium">
            Вы имеете право вернуть товар надлежащего качества в течение <strong>14 дней</strong> с
            момента покупки, если он не был в употреблении, сохранены его товарный вид и
            потребительские свойства.
          </p>
        </div>

        <h3 className="text-xl font-bold text-gray-900">Условия возврата:</h3>
        <ul className="space-y-4 list-none pl-0">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
            <span>Наличие кассового чека или иного документа, подтверждающего покупку.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
            <span>Полная комплектация (коробка, антистатические пакеты, мануалы, заглушки).</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
            <span>
              Отсутствие следов установки (царапины на контактах, термопаста на процессоре и т.д.).
            </span>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">
        Гарантийное обслуживание
      </h2>
      <p className="text-lg">
        Мы уверены в качестве наших сборок, поэтому предоставляем полную гарантию на все ПК —{' '}
        <strong>от 1 до 3 лет</strong>.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 my-8">
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-3xl">
          <Shield className="w-8 h-8 text-blue-600 mb-4" />
          <h4 className="font-bold text-gray-900 mb-2">Гарантия на компоненты</h4>
          <p className="text-sm text-gray-500">
            От производителя. В случае поломки мы сами отвозим деталь в сервис-центр вендора.
          </p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-3xl">
          <Wrench className="w-8 h-8 text-blue-600 mb-4" />
          <h4 className="font-bold text-gray-900 mb-2">Гарантия на сборку</h4>
          <p className="text-sm text-gray-500">
            Если отошел кабель, отклеилась лента или шумит вентилятор — исправим бесплатно за 1
            день.
          </p>
        </div>
      </div>
    </div>
  )
}

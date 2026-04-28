'use client'

import { useState, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import {
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Wrench,
  Zap,
  MonitorPlay,
} from 'lucide-react'
import { useBuilderStore } from '@/store/useBuilderStore'
import { useCartStore } from '@/store/useCartStore'
import formatPrice from '@/utils/formatPrice'
import type { Build } from '@/payload-types'

const COOLER_SOCKET_FIELD: Record<string, string> = {
  LGA1700: 'supports_lga1700',
  LGA1200: 'supports_lga1200',
  AM4: 'supports_am4',
  AM5: 'supports_am5',
}

export default function AddToCartBtn() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFixing, setIsFixing] = useState(false)

  const build = useBuilderStore((s) => s.build)
  const resetBuild = useBuilderStore((s) => s.resetBuild)
  const setBuild = useBuilderStore((s) => s.setBuild) // 👈 Используем твой новый метод из стора
  const getCompatibilityErrors = useBuilderStore((s) => s.getCompatibilityErrors)
  const calculateTotalPrice = useBuilderStore((s) => s.calculateTotalPrice)
  const getTotalWattage = useBuilderStore((s) => s.getTotalWattage)
  const addItem = useCartStore((s) => s.addItem)

  const errors = getCompatibilityErrors()
  const hasCriticalErrors = errors.some((e) => e.type === 'error')
  const totalPrice = calculateTotalPrice()
  const reqWattage = getTotalWattage()

  const filledSlotsCount = Object.values(build).filter(Boolean).length
  const totalSlots = 8
  const isComplete = filledSlotsCount === totalSlots

  const confidence = useMemo(() => {
    if (!isComplete) return (filledSlotsCount / totalSlots) * 60
    if (hasCriticalErrors) return 30
    if (errors.length > 0) return 70
    return 100
  }, [isComplete, hasCriticalErrors, errors.length, filledSlotsCount])

  const buildSummary = useMemo(() => {
    if (!build.cpu || !build.gpu) return null
    const isHighEnd = (build.gpu as any).fps_presets?.aaa > 90 || totalPrice > 150000
    return {
      title: isHighEnd ? 'Ультра-игровая сборка' : 'Оптимальный ПК',
      resolution: isHighEnd ? '1440p / 4K Ready' : '1080p Ultra',
      shortName: `${build.gpu.name.split(' ').slice(0, 3).join(' ')} + ${build.cpu.name.split(' ').slice(0, 2).join(' ')}`,
    }
  }, [build.cpu, build.gpu, totalPrice])

  // --- 🛠️ УМНОЕ АВТО-ИСПРАВЛЕНИЕ ---
  const handleAutoFix = async () => {
    setIsFixing(true)
    const toastId = toast.loading('Устраняем конфликты оборудования...', { icon: '🔧' })

    try {
      let newBuild = { ...build }
      let changed = false

      // 1. Материнская плата (Ориентируемся на сокет выбранного CPU)
      if (newBuild.cpu && newBuild.mobo && newBuild.cpu.socket !== newBuild.mobo.socket) {
        const res = await fetch(
          `/api/motherboards?where[socket][equals]=${encodeURIComponent(newBuild.cpu.socket)}&limit=1&sort=price`,
        )
        const data = await res.json()
        if (data.docs?.[0]) {
          newBuild.mobo = data.docs[0]
          changed = true
        }
      }

      // 2. Оперативная память (Смотрим, что поддерживает CPU и Mobo)
      if (newBuild.ram) {
        const cpuDdr4 = newBuild.cpu?.supports_ddr4
        const cpuDdr5 = newBuild.cpu?.supports_ddr5
        const moboDdr4 = newBuild.mobo?.supports_ddr4
        const moboDdr5 = newBuild.mobo?.supports_ddr5
        let reqType = null

        if (newBuild.cpu && newBuild.mobo) {
          if (cpuDdr5 && moboDdr5) reqType = 'DDR5'
          else if (cpuDdr4 && moboDdr4) reqType = 'DDR4'
        }

        if (reqType && newBuild.ram.type !== reqType) {
          const res = await fetch(`/api/ram?where[type][equals]=${reqType}&limit=1&sort=price`)
          const data = await res.json()
          if (data.docs?.[0]) {
            newBuild.ram = data.docs[0]
            changed = true
          }
        }
      }

      // 3. Корпус (Если видеокарта слишком длинная)
      if (
        newBuild.case &&
        newBuild.gpu &&
        newBuild.case.max_gpu_length_mm < newBuild.gpu.length_mm
      ) {
        const res = await fetch(
          `/api/cases?where[max_gpu_length_mm][greater_than_equal]=${newBuild.gpu.length_mm}&limit=1&sort=price`,
        )
        const data = await res.json()
        if (data.docs?.[0]) {
          newBuild.case = data.docs[0]
          changed = true
        }
      }

      // 4. Кулер (Проверяем высоту, сокет и TDP)
      if (newBuild.cooler && newBuild.cpu) {
        const normSocket = newBuild.cpu.socket.replace(/[-\s]/g, '').toUpperCase()
        const field = COOLER_SOCKET_FIELD[normSocket]

        const socketMismatch = field && !(newBuild.cooler as any)[field]
        const tdpMismatch = newBuild.cpu.tdp && newBuild.cooler.max_tdp < newBuild.cpu.tdp
        const heightMismatch =
          newBuild.case && newBuild.cooler.height_mm > newBuild.case.max_cooler_height_mm

        if (socketMismatch || tdpMismatch || heightMismatch) {
          let qs = `/api/coolers?limit=1&sort=price`
          if (field) qs += `&where[${field}][equals]=true`
          if (newBuild.cpu.tdp) qs += `&where[max_tdp][greater_than_equal]=${newBuild.cpu.tdp}`
          if (newBuild.case)
            qs += `&where[height_mm][less_than_equal]=${newBuild.case.max_cooler_height_mm}`

          const res = await fetch(qs)
          const data = await res.json()
          if (data.docs?.[0]) {
            newBuild.cooler = data.docs[0]
            changed = true
          }
        }
      }

      // 5. Блок питания (В самую последнюю очередь, так как детали могли измениться)
      const newTotalWattage =
        (newBuild.cpu?.tdp || 0) +
        (newBuild.gpu?.recommended_psu_w ? newBuild.gpu.recommended_psu_w * 0.8 : 0) +
        50
      const requiredPsu = newTotalWattage * 1.3 // С запасом 30%
      if (newBuild.psu && newBuild.psu.wattage < requiredPsu) {
        const res = await fetch(
          `/api/psus?where[wattage][greater_than_equal]=${Math.ceil(requiredPsu)}&limit=1&sort=price`,
        )
        const data = await res.json()
        if (data.docs?.[0]) {
          newBuild.psu = data.docs[0]
          changed = true
        }
      }

      // Применяем изменения
      if (changed) {
        setBuild(newBuild)
        toast.success('Идеально! Ошибки устранены, сборка обновлена.', { id: toastId })
      } else {
        toast.error('Не удалось найти замены в каталоге. Попробуйте вручную.', { id: toastId })
      }
    } catch (error) {
      toast.error('Произошла ошибка при анализе', { id: toastId })
    } finally {
      setIsFixing(false)
    }
  }

  // --- ДОБАВЛЕНИЕ В КОРЗИНУ ---
  const executeAddToCart = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))

    const tags = []
    if (totalPrice > 150000) tags.push('high-end')
    if (
      build.gpu?.name.toUpperCase().includes('RTX') ||
      build.gpu?.name.toUpperCase().includes('RX')
    )
      tags.push('gaming')
    if (hasCriticalErrors) tags.push('experimental')

    const localBuild = {
      id: Date.now(),
      name: `Сборка ПК: ${buildSummary?.shortName || 'Custom'}`,
      is_complete: true,
      cpu: build.cpu,
      mobo: build.mobo,
      gpu: build.gpu,
      ram: build.ram,
      psu: build.psu,
      case: build['case'],
      cooler: build.cooler,
      storage: build.storage,
      tags,
    } as unknown as Build

    addItem({ type: 'build', product: localBuild })
    setIsSubmitting(false)

    if (hasCriticalErrors) {
      toast('Добавлено в корзину (как эксперимент)', { icon: '🧪' })
    } else {
      toast.success('Готовый ПК добавлен в корзину!', { icon: '🚀' })
    }
    resetBuild()
  }

  const handleMainClick = () => {
    if (!isComplete) {
      toast(`Осталось выбрать деталей: ${totalSlots - filledSlotsCount}`, { icon: '🧩' })
      return
    }

    if (hasCriticalErrors) {
      toast(
        (t) => (
          <div className="space-y-3 p-1">
            <p className="font-bold text-sm text-gray-900 leading-tight">
              В сборке есть критические ошибки
            </p>
            <p className="text-xs text-gray-500">
              Система может не запуститься. Вы точно хотите продолжить?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id)
                  executeAddToCart()
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Всё равно добавить
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        ),
        { duration: 6000 },
      )
      return
    }
    executeAddToCart()
  }

  const btnText = !isComplete
    ? 'Соберите конфигурацию'
    : hasCriticalErrors
      ? 'Добавить с риском'
      : 'Купить эту сборку'
  const btnColor = !isComplete
    ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/10'
    : hasCriticalErrors
      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20'
      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Итоговая стоимость
            </p>
            <p className="text-4xl font-black text-gray-900 tracking-tight">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <div className="text-right">
            {isComplete ? (
              hasCriticalErrors ? (
                <div className="flex items-center gap-1.5 text-orange-600 justify-end">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="font-bold text-sm">Есть конфликты</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-green-600 justify-end">
                  <CheckCircle2 className="w-4 h-4" />
                  <p className="font-bold text-sm">Всё совместимо</p>
                </div>
              )
            ) : (
              <p className="font-bold text-sm text-gray-400">В процессе...</p>
            )}
            <p className="text-[10px] text-gray-400 font-medium mt-1">
              Заполнено: {filledSlotsCount} из {totalSlots}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-1000 ease-out ${confidence < 50 ? 'bg-red-500' : confidence < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.max(5, confidence)}%` }}
            />
          </div>
        </div>

        {buildSummary && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200/60 mt-1">
            <span className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <MonitorPlay className="w-3 h-3 text-blue-500" /> {buildSummary.resolution}
            </span>
            <span className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3 h-3 text-yellow-500" /> {Math.ceil(reqWattage)}W Потребление
            </span>
          </div>
        )}
      </div>

      <button
        onClick={handleMainClick}
        disabled={isSubmitting}
        className={`w-full py-4 px-6 rounded-2xl font-black text-[15px] transition-all duration-300 flex justify-center items-center gap-3 active:scale-[0.98] ${btnColor} shadow-xl disabled:opacity-70`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Формируем заказ...</span>
          </>
        ) : (
          <>
            {hasCriticalErrors ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            <span>{btnText}</span>
          </>
        )}
      </button>

      <div className="space-y-3 px-2">
        {hasCriticalErrors && (
          <ul className="text-xs text-orange-600 space-y-1.5 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
            {errors.slice(0, 2).map((e, i) => (
              <li key={i} className="flex items-start gap-1.5 font-medium">
                <span className="shrink-0 mt-0.5">•</span> <span>{e.message}</span>
              </li>
            ))}
            {errors.length > 2 && (
              <li className="text-[10px] font-bold text-orange-400 pl-3">
                и ещё {errors.length - 2} конфликта...
              </li>
            )}
          </ul>
        )}

        {/* 🚀 Кнопка Авто-фикса (показывается, если есть критические ошибки) */}
        {hasCriticalErrors && (
          <button
            onClick={handleAutoFix}
            disabled={isFixing}
            className="w-full text-xs text-blue-600 font-bold hover:text-blue-800 transition-colors flex justify-center items-center gap-1.5 py-2 bg-blue-50/50 rounded-xl hover:bg-blue-100 disabled:opacity-50"
          >
            {isFixing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wrench className="w-4 h-4" />
            )}
            {isFixing ? 'ИСПРАВЛЕНИЕ...' : 'АВТОМАТИЧЕСКИ ИСПРАВИТЬ СБОРКУ'}
          </button>
        )}
      </div>
    </div>
  )
}

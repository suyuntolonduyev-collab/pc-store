'use client'

import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useCartStore } from '@/store/useCartStore'
import formatPrice from '@/utils/formatPrice'
import { getSingleBuildPrice } from '@/utils/getBuildPrice'
import type { Build, Media } from '@/payload-types'

// Универсальный тип для пропсов
type ProductLike = {
  id: number;
  name: string;
  price?: number | null;
  image?: number | Media | null;
  [key: string]: any; // Для доступа к остальным полям
}

type ProductCardProps = {
  item: ProductLike
  type: 'build' | 'component'
}

// 🟢 ОТДЕЛЬНАЯ КЛИЕНТСКАЯ КНОПКА
function AddToCartButton({ item, type }: ProductCardProps) {
  const addItemToCart = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (type === 'build') {
      addItemToCart({ type: 'build', product: item as Build })
    } else {
      const singleItemBuild = {
        id: Date.now(),
        name: item.name,
        is_complete: false,
        tags: ['gaming'],
        cpu: item, 
      } as unknown as Build
      addItemToCart({ type: 'build', product: singleItemBuild })
    }
    toast.success('Добавлено в корзину!')
  }

  return (
    <button onClick={handleAddToCart} className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-md">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      В КОРЗИНУ
    </button>
  )
}

// 🟢 ОСНОВНОЙ КОМПОНЕНТ (теперь может быть серверным)
export default function ProductCard({ item, type }: ProductCardProps) {
  const price = type === 'build' ? getSingleBuildPrice(item as Build) : item.price ?? 0
  
  const imageUrl = type === 'build'
    ? (() => {
        const caseData = item['case'] && typeof item['case'] === 'object' ? item['case'] : null;
        return caseData?.image && typeof caseData.image === 'object' ? (caseData.image as Media).url ?? null : null;
      })()
    : (() => {
        return item.image && typeof item.image === 'object' ? (item.image as Media).url ?? null : null;
      })();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col hover:shadow-xl transition-all group relative">
      <div className="relative w-full h-48 bg-gray-50 rounded-xl mb-4 overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={item.name || 'Товар'} fill sizes="250px" className="object-contain p-4 transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Нет фото</div>
        )}
      </div>
      <div className="flex-grow flex flex-col">
        {type === 'build' && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mb-2">ГОТОВАЯ СБОРКА</span>}
        <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 h-12 mb-2 group-hover:text-blue-600">{item.name}</h3>
        <div className="mt-auto pt-4">
          <span className="text-2xl font-black text-gray-900 block mb-4">{formatPrice(price)}</span>
          {/* 🟢 Используем клиентскую кнопку, чтобы отделить логику */}
          <AddToCartButton item={item} type={type} />
        </div>
      </div>
    </div>
  )
}

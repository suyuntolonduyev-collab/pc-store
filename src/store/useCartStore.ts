import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Build } from '@/payload-types'

interface CartItem {
  build: Build
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (build: Build) => void // ИСПРАВЛЕНО: принимает чистый Build
  removeItem: (buildId: Build['id']) => void
  decreaseItem: (buildId: Build['id']) => void
  clearCart: () => void
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (build) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.build.id === build.id)

          if (existingIndex !== -1) {
            return {
              items: state.items.map((item, index) =>
                index === existingIndex
                  ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
                  : item,
              ),
            }
          }

          return {
            items: [...state.items, { build, quantity: 1 }],
          }
        })
      },

      removeItem: (buildId) => {
        set((state) => ({
          items: state.items.filter((item) => item.build.id !== buildId),
        }))
      },

      decreaseItem: (buildId) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.build.id === buildId ? { ...item, quantity: item.quantity - 1 } : item,
            )
            .filter((item) => item.quantity > 0),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const { build, quantity } = item

          const components = [
            build.cpu,
            build.mobo,
            build.gpu,
            build.ram,
            build.psu,
            build['case'],
            build.cooler,
            build.storage,
          ]

          const buildPrice = components.reduce((sum: number, comp): number => {
            if (comp && typeof comp === 'object' && 'price' in comp) {
              const price = typeof comp.price === 'number' ? comp.price : 0
              return sum + price
            }
            return sum
          }, 0)

          return total + buildPrice * quantity
        }, 0)
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

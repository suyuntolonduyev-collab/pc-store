import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getSingleBuildPrice } from '@/utils/getBuildPrice'
import type { Build, Accessory } from '@/payload-types'

export type CartItemType =
  | { type: 'build'; product: Build }
  | { type: 'accessory'; product: Accessory }

export interface CartItem {
  id: string
  item: CartItemType
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItemType) => void
  removeItem: (id: string) => void
  decreaseItem: (id: string) => void
  clearCart: () => void
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const itemId = `${newItem.type}-${newItem.product.id}`
          const existingIndex = state.items.findIndex((cartItem) => cartItem.id === itemId)

          if (existingIndex !== -1) {
            const updatedItems = [...state.items]
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + 1,
            }
            return { items: updatedItems }
          }

          return {
            items: [...state.items, { id: itemId, item: newItem, quantity: 1 }],
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((cartItem) => cartItem.id !== id),
        }))
      },

      decreaseItem: (id) => {
        set((state) => ({
          items: state.items
            .map((cartItem) =>
              cartItem.id === id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
            )
            .filter((cartItem) => cartItem.quantity > 0),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, cartItem) => {
          let itemPrice = 0
          if (cartItem.item.type === 'build') {
            itemPrice = getSingleBuildPrice(cartItem.item.product)
          } else if (cartItem.item.type === 'accessory') {
            itemPrice = cartItem.item.product.price ?? 0
          }
          return total + itemPrice * cartItem.quantity
        }, 0)
      },
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // Фильтруем записи со старой структурой (до рефакторинга CartItem)
        // Старая структура: { id, build, quantity } — item отсутствует или не имеет type
        const validItems = state.items.filter(
          (cartItem) =>
            cartItem.item != null &&
            (cartItem.item.type === 'build' || cartItem.item.type === 'accessory'),
        )

        if (validItems.length !== state.items.length) {
          state.items = validItems
        }
      },
    },
  ),
)

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface FavoritesState {
  favorites: Record<string, boolean>
  toggleFavorite: (id: string) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: {},
      toggleFavorite: (id) => {
        set((state) => ({
          favorites: {
            ...state.favorites,
            [id]: !state.favorites[id],
          },
        }))
      },
    }),
    {
      name: 'favorites-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

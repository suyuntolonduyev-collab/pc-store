import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/payload-types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.errors?.[0]?.message || 'Неверный email или пароль')
          }

          set({ user: data.user, token: data.token, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ошибка авторизации',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          // В Payload создание пользователя - это обычный POST в коллекцию
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Передаем обязательные поля из нашей схемы Payload
            body: JSON.stringify({ name, email, password, role: 'user' }),
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.errors?.[0]?.message || 'Ошибка при регистрации')
          }

          // Payload по умолчанию логинит юзера после регистрации и возвращает токен
          set({ user: data.doc, token: data.token, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ошибка регистрации',
            isLoading: false,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null })
        try {
          await fetch('/api/users/logout', { method: 'POST' })
        } catch (error) {
          console.error('Ошибка при логауте на сервере', error)
        } finally {
          // В любом случае очищаем локальный стор
          set({ user: null, token: null, isLoading: false })
        }
      },

      fetchMe: async () => {
        const { token } = get()
        if (!token) return

        try {
          const res = await fetch('/api/users/me', {
            headers: {
              Authorization: `JWT ${token}`,
            },
          })

          const data = await res.json()

          if (res.ok && data.user) {
            set({ user: data.user })
          } else {
            // Если токен протух или невалиден
            set({ user: null, token: null })
          }
        } catch (error) {
          set({ user: null, token: null })
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      // Сохраняем только токен и юзера, чтобы не кэшировать ошибки или лоадинги
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)

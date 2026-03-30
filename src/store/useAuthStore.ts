import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/payload-types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

interface LoginResponse {
  user: User
  token: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (!res.ok) {
            throw new Error('Login failed')
          }

          const data: LoginResponse = await res.json()

          set({
            user: data.user,
            token: data.token,
            isLoading: false,
          })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error'

          set({
            error: message,
            isLoading: false,
          })
        }
      },

      register: async (email, password, username) => {
        set({ isLoading: true, error: null })

        try {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              username,
            }),
          })

          if (!res.ok) {
            throw new Error('Registration failed')
          }

          await useAuthStore.getState().login(email, password)

          set({ isLoading: false })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error'

          set({
            error: message,
            isLoading: false,
          })
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null })

        try {
          await fetch('/api/users/logout', {
            method: 'POST',
          })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Logout error'

          set({ error: message })
        } finally {
          set({
            user: null,
            token: null,
            isLoading: false,
          })
        }
      },

      fetchMe: async () => {
        set({ isLoading: true, error: null })

        try {
          const res = await fetch('/api/users/me')

          if (!res.ok) {
            throw new Error('Failed to fetch user')
          }

          const data: { user: User } = await res.json()

          set({
            user: data.user,
            isLoading: false,
          })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error'

          set({
            user: null,
            token: null,
            error: message,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
)

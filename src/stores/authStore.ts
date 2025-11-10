import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  username: string
  role: 'admin' | 'manager' | 'staff'
  name: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

// Demo users - In production, this should be in the database
const DEMO_USERS = [
  { id: '1', username: 'admin', password: 'admin', role: 'admin' as const, name: 'Admin User' },
  { id: '2', username: 'manager', password: 'manager', role: 'manager' as const, name: 'Manager User' },
  { id: '3', username: 'staff', password: 'staff', role: 'staff' as const, name: 'Staff User' },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Find user
        const user = DEMO_USERS.find(
          (u) => u.username === username && u.password === password
        )

        if (user) {
          const { password: _, ...userWithoutPassword } = user
          set({ user: userWithoutPassword, isAuthenticated: true })
          return true
        }

        return false
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

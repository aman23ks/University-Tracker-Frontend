"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/lib/api/user'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User | null>
  logout: () => void
  register: (email: string, password: string) => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAndUpdateSubscriptionStatus = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          is_premium: data.is_premium,
          subscription: data.subscription
        };
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
    return null;
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const { token, user: userData } = await response.json()

      const subscriptionStatus = await checkAndUpdateSubscriptionStatus(token);
      if (subscriptionStatus) {
        userData.is_premium = subscriptionStatus.is_premium;
        userData.subscription = subscriptionStatus.subscription;
      }
      
      localStorage.setItem('token', token)
      setUser(userData)
      
      return userData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/auth/login'
  }

  const register = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Registration failed')
      }

      await login(email, password)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const updateUser = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/users/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      const updatedUser = await response.json()
      setUser(prev => prev ? { ...prev, ...updatedUser } : null)
      return updatedUser
    } catch (error: any) {
      console.error('Update failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateUser,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
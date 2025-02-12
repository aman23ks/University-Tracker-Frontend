"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface RequireAuthProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function RequireAuth({ children, requireAdmin = false }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = '/auth/login'
      } else if (requireAdmin && !user.is_admin) {
        window.location.href = '/dashboard/user'
      }
    }
  }, [user, loading, requireAdmin])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || (requireAdmin && !user.is_admin)) {
    return null
  }

  return <>{children}</>
}
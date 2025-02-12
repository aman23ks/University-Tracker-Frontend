"use client"

import { Sidebar } from '@/components/ui/Sidebar'
import { useAuth } from './AuthProvider'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { redirect } from 'next/navigation'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  )
}
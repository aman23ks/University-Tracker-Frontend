"use client"

import { RequireAuth } from '@/components/RequireAuth'
import { Sidebar } from '@/components/ui/Sidebar'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth requireAdmin>
      {/* <div className="flex h-screen"> */}
        {/* <Sidebar /> */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {children}
        </main>
      {/* </div> */}
    </RequireAuth>
  )
}
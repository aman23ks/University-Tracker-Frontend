"use client"

import { AuthProvider } from './providers/AuthProvider'
import type { ReactNode } from 'react'

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
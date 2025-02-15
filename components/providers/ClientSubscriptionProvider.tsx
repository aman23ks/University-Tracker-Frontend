// components/providers/ClientSubscriptionProvider.tsx

"use client"

import { SubscriptionProvider } from '@/lib/context/subscription-context'
import type { ReactNode } from 'react'

export function ClientSubscriptionProvider({ children }: { children: ReactNode }) {
  return <SubscriptionProvider>{children}</SubscriptionProvider>
}
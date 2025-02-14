"use client"

import { SubscriptionProvider } from './SubscriptionProvider';
import type { ReactNode } from 'react';

export function ClientSubscriptionProvider({ children }: { children: ReactNode }) {
  return <SubscriptionProvider>{children}</SubscriptionProvider>;
}
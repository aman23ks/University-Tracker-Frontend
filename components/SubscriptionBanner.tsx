// components/SubscriptionBanner.tsx

"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { useSubscription } from '@/lib/context/subscription-context'
import { Banner } from '@/components/ui/banner'

export function SubscriptionBanner() {
  const { user } = useAuth()
  const { upgradeToPremuim, subscriptionStatus, isLoading } = useSubscription()

  if (!user || user.is_premium) return null

  const isExpired = subscriptionStatus === 'expired'
  const isCancelled = subscriptionStatus === 'cancelled'

  if (isExpired) {
    return (
      <Banner
        variant="warning"
        title="Subscription Expired"
        description="Your premium access has expired. Only your first 3 universities are visible."
        action={{
          label: isLoading ? "Processing..." : "Renew Subscription",
          onClick: upgradeToPremuim
        }}
        dismissible={false}
      />
    )
  }

  if (isCancelled) {
    return (
      <Banner
        variant="warning"
        title="Subscription Ending Soon"
        description="Your premium access will end at the end of the billing period."
        action={{
          label: isLoading ? "Processing..." : "Reactivate Subscription",
          onClick: upgradeToPremuim
        }}
        dismissible={false}
      />
    )
  }

  return null
}
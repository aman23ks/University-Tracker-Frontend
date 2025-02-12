"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useSubscription } from '@/lib/context/subscription-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Check, Crown } from 'lucide-react'

interface SubscriptionDetails {
  status: 'active' | 'cancelled' | 'expired'
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

interface User {
  isPremium: boolean
  subscription?: {
    status: string
    expiry: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { upgradeToPremuim, cancelSubscription } = useSubscription()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  useEffect(() => {
    fetchSubscriptionDetails()
  }, [])

  const fetchSubscriptionDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/subscription`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch subscription details')
      const data = await response.json()
      setSubscription(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subscription details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const features = [
    "Unlimited university selections",
    "Export data to Excel",
    "Custom data fields",
    "Priority support",
    "Advanced analytics"
  ]

  if (loading) return <LoadingScreen />

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing details
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.is_premium ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Premium Plan</span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Your subscription is {subscription?.status}
                </p>
                
                {subscription?.cancelAtPeriodEnd ? (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your subscription will end on{' '}
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm">
                      Next billing date:{' '}
                      {formatDate(subscription?.currentPeriodEnd)}
                    </p>
                    <Button
                      variant="outline"
                      onClick={cancelSubscription}
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You are currently on the free plan
                </p>
                <Button onClick={upgradeToPremuim}>
                  Upgrade to Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Premium Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <div className="h-5 w-5 flex items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {user?.is_premium && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add billing history table */}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
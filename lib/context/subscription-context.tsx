// lib/context/subscription-context.tsx

"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/providers/AuthProvider'

interface SubscriptionContextType {
  isPremium: boolean
  isLoading: boolean
  subscriptionStatus: 'free' | 'active' | 'cancelled' | 'expired'
  upgradeToPremuim: () => Promise<void>
  cancelSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'active' | 'cancelled' | 'expired'>('free')
  const { toast } = useToast()
  const { user } = useAuth()

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/api/subscription/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsPremium(data.is_premium)
        setSubscriptionStatus(data.subscription?.status || 'free')
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus()
    }
  }, [user, checkSubscriptionStatus])

  const upgradeToPremuim = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/subscription/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to create order')
      const orderData = await response.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'UniTracker Premium',
        description: 'Premium Subscription',
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/subscription/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature
              })
            })

            if (!verifyRes.ok) throw new Error('Payment verification failed')
            setIsPremium(true)
            setSubscriptionStatus('active')
            await checkSubscriptionStatus()
            
            toast({
              title: 'Success',
              description: 'Welcome to Premium! Enjoy unlimited access.',
            })
          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Payment verification failed. Please contact support.',
            })
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to initiate payment. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, checkSubscriptionStatus])

  const cancelSubscription = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/subscription/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to cancel subscription')
      
      setSubscriptionStatus('cancelled')
      toast({
        title: 'Subscription Cancelled',
        description: 'Your premium access will end at the end of the billing period.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        isLoading,
        subscriptionStatus,
        upgradeToPremuim,
        cancelSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
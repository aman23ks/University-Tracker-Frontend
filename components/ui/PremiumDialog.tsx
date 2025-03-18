"use client"

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, Check } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const API_URL = process.env.NEXT_PUBLIC_API_URL

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PremiumDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PremiumDialog({ open, onOpenChange }: PremiumDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { updateUser } = useAuth()

  const handleUpgrade = async () => {
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const orderRes = await fetch(`${API_URL}/api/subscription/create-order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!orderRes.ok) throw new Error('Failed to create order')
      const orderData = await orderRes.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Admit Bridge Premium',
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
            
            await updateUser({ is_premium: true })
            onOpenChange(false)
          } catch (error) {
            setError('Payment verification failed')
          }
        },
        theme: {
          color: '#4F46E5'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      setError('Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            Get unlimited access to all features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {[
              'Unlimited university selections',
              // 'Export data to Excel',
              'Custom data fields',
              'Priority support'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Upgrade for ₹20/month'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
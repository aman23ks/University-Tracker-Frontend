"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSubscription } from '@/lib/context/subscription-context'
import { LoaderIcon } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function PaymentForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { upgradeToPremuim } = useSubscription()
  const { toast } = useToast()

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/subscription/create-order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to create payment order')
      }

      const orderData = await response.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'UniTracker',
        description: 'Premium Subscription',
        order_id: orderData.id,
        handler: async function (response: any) {
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

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed')
            }

            await upgradeToPremuim()
            
            toast({
              title: 'Success',
              description: 'Welcome to Premium! Enjoy unlimited access.',
            })
          } catch (error) {
            setError('Payment verification failed')
          }
        },
        prefill: {
          email: localStorage.getItem('userEmail')
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
    <Card>
      <CardHeader>
        <CardTitle>Upgrade to Premium</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <p className="font-medium">Plan Details:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Unlimited university selections</li>
            <li>Export data to Excel</li>
            <li>Custom data fields</li>
            <li>Priority support</li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="font-medium">Price:</p>
          <p className="text-2xl font-bold">₹20/month</p>
          <p className="text-sm text-muted-foreground">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Upgrade Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
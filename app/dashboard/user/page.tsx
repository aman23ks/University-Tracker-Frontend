"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { NotionTable, type University } from '@/components/ui/NotionTable'
import { UniversitySearch } from '@/components/ui/UniversitySearch'
import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SubscriptionBanner } from '@/components/SubscriptionBanner'
import { Crown, Check, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UserDashboard() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [selectedUniversities, setSelectedUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUniversityDetails()
      setShowUpgrade(!user.is_premium)
    }
    setLoading(false)
  }, [user])

  const fetchUniversityDetails = async () => {
    if (!user?.selected_universities?.length) {
      setSelectedUniversities([])
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/universities/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          universities: user.selected_universities
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch university details')
      }

      const universities: University[] = await response.json()
      setSelectedUniversities(universities)
      // setShowUpgrade(!user.is_premium && universities.length >= 2)
      setError(null)

    } catch (error: any) {
      console.error('Failed to fetch university details:', error)
      setError(error.message || 'Failed to load university details')
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load university details'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      setProcessingPayment(true)
      const token = localStorage.getItem('token')
      
      // Create order
      const orderRes = await fetch(`${API_URL}/api/subscription/create-order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!orderRes.ok) throw new Error('Failed to create order')
      const orderData = await orderRes.json()

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "UniTracker",
        description: "Premium Subscription",
        order_id: orderData.id,
        handler: async function(response: any) {
          try {
            // Verify payment
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
            
            // Update user context
            updateUser({ 
              ...user, 
              is_premium: true,
              subscription: {
                status: 'active',
                expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              }
            })
            
            setShowPaymentDialog(false)
            toast({
              title: "Success",
              description: "Welcome to Premium! Enjoy unlimited access."
            })
          } catch (error: any) {
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Payment verification failed"
            })
          }
        },
        prefill: {
          email: user?.email
        },
        theme: {
          color: "#4F46E5"
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process payment"
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleSelect = async (university: University) => {
    try {
      console.log('[Dashboard] Adding university:', university.url)
      const token = localStorage.getItem('token')
      
      // Add to user's selection
      const addResponse = await fetch(`${API_URL}/api/users/universities/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          university_id: university.id
        })
      })

      const responseData = await addResponse.json()
      console.log('[Dashboard] Add response:', responseData)

      if (!addResponse.ok) {
        throw new Error(responseData.error || 'Failed to add university')
      }

      // Update the universities list
      setSelectedUniversities(prev => [...prev, {
        ...university,
        ...responseData.columnData
      }])

      // Update user context
      if (user?.selected_universities) {
        user.selected_universities = [...user.selected_universities, university.url]
      }

    } catch (error: any) {
      console.error('[Dashboard] Error adding university:', error)
      throw error
    }
  }

  const handleRemove = async (university: University) => {
    if (!user?.is_premium) return

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/api/users/universities/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          university_id: university.id 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove university')
      }

      setSelectedUniversities(prev => prev.filter(u => u.id !== university.id))
      
      // Update user context
      if (user?.selected_universities) {
        user.selected_universities = user.selected_universities.filter(url => url !== university.url)
      }
      
      toast({
        title: "Success",
        description: "University removed successfully"
      })
    } catch (error: any) {
      console.error('Failed to remove university:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove university"
      })
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="p-6 space-y-6">
      <SubscriptionBanner />
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Your Universities</h2>
        <Card>
          <CardContent className="p-6">
            <UniversitySearch
              selectedUniversities={selectedUniversities.map(u => u.url)}
              onSelect={handleSelect}
              isPremium={user?.is_premium || false}
            />
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <NotionTable
        universities={selectedUniversities}
        isPremium={user?.is_premium || false}
        onRemoveUniversity={handleRemove}
      />

      {showUpgrade && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">
            Upgrade to Premium
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            Get unlimited university selections and advanced features.
          </AlertDescription>
          <Button
            variant="default"
            className="mt-3"
            onClick={() => setShowPaymentDialog(true)}
          >
            Upgrade for ₹1000/month
          </Button>
        </Alert>
      )}

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              Get unlimited access to all features
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              {[
                'Unlimited university selections',
                'Export data to Excel',
                'Custom data fields',
                'Priority support',
                'Advanced analytics'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              )
            )}
            </div>

            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">₹1000/month</p>
              <p className="text-sm text-muted-foreground">
                Cancel anytime. No questions asked.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={handleUpgrade}
              disabled={processingPayment}
            >
              {processingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade Now'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { NotionTable, type University } from '@/components/ui/NotionTable'
import { UniversitySearch } from '@/components/ui/UniversitySearch'
import { useState, useEffect, useCallback, useRef } from 'react'
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
import { useSocket } from '@/lib/hooks/useSocket'
import { debounce } from 'lodash';

const API_URL = process.env.NEXT_PUBLIC_API_URL

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UniversityUpdateData {
  university_id: string;
  status: string;
  user_email?: string;
  timestamp?: string;
  column_id?: string;
  column_name?: string;
  columns_processed?: string[];
  [key: string]: any; // For any additional fields
}

interface UserUpdateData {
  type: string;
  user_email: string;
  hidden_universities_processed?: number;
  columns_processed?: number;
  timestamp?: string;
  [key: string]: any; // For any additional fields
}

interface ColumnData {
  [key: string]: {
    value: string;
    last_updated: string;
  }
}

interface ColumnDataResponse {
  [key: string]: ColumnData;
}

interface ExtendedUniversity extends University {
  [key: string]: any; // This allows arbitrary string keys
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
  const [hiddenUniversitiesCount, setHiddenUniversitiesCount] = useState(0)
  const [processingUniversities, setProcessingUniversities] = useState<Set<string>>(new Set());
  
  // Reference to track pending university updates
  const pendingUpdates = useRef(new Set<string>());

  useEffect(() => {
    if (user) {
      fetchUniversityDetails()
      checkSubscriptionStatus()
      setShowUpgrade(!user.is_premium)
    }
    setLoading(false)
  }, [user])

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch(`${API_URL}/api/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const status = await response.json()
        
        // Update user context if subscription status changed
        if (status.is_premium !== user?.is_premium) {
          updateUser({ 
            ...user, 
            is_premium: status.is_premium,
            subscription: status.subscription
          })
          
          // Refresh university list if status changed
          fetchUniversityDetails()
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }

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

      let universities: University[] = await response.json()
      
      // Get visibility information to know about hidden universities
      const visibilityResponse = await fetch(`${API_URL}/api/users/universities/visibility`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (visibilityResponse.ok) {
        const visibilityData = await visibilityResponse.json()
        setHiddenUniversitiesCount(visibilityData.hidden_count || 0)
        
        // If expired, show only the visible universities
        if (visibilityData.is_expired) {
          universities = universities.slice(0, visibilityData.visible_count || 3)
        }
      }
      
      setSelectedUniversities(universities)
      setShowUpgrade(!user.is_premium && universities.length >= 2)
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
            
            // Refresh university list to show all universities
            await fetchUniversityDetails()
            
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

      // If user is not premium and already has 3 universities, 
      // don't show the newly added university yet
      const isExpired = user?.subscription?.status === 'expired'
      const hasReachedLimit = selectedUniversities.length >= 3
      
      if (!isExpired || !hasReachedLimit) {
        // Update the universities list if visible
        setSelectedUniversities(prev => [...prev, {
          ...university,
          ...responseData.columnData
        }])
      } else {
        // Increment hidden count
        setHiddenUniversitiesCount(prev => prev + 1)
        
        toast({
          title: "University Added",
          description: "The university was added but is hidden due to your free plan limit. Upgrade to premium to see all universities."
        })
      }

      // Update user context
      if (user?.selected_universities) {
        updateUser({
          ...user,
          selected_universities: [...user.selected_universities, university.url]
        })
      }

    } catch (error: any) {
      console.error('[Dashboard] Error adding university:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add university"
      })
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
      
      // If this was a visible university and we have hidden ones, we might need to show a previously hidden one
      const isExpired = user?.subscription?.status === 'expired'
      if (isExpired && hiddenUniversitiesCount > 0) {
        // Refresh to get an updated list including previously hidden universities
        await fetchUniversityDetails()
      }
      
      // Update user context
      if (user?.selected_universities) {
        updateUser({
          ...user,
          selected_universities: user.selected_universities.filter(url => url !== university.url)
        })
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

  // Create efficiently debounced functions for fetch operations
  const debouncedFetchDetails = useCallback(
    debounce(() => {
      console.log('Debounced fetch universities triggered');
      fetchUniversityDetails();
    }, 500), // 500ms debounce time
    [fetchUniversityDetails]
  );

  // Create a debounced batch fetch for universities
  const debouncedFetchUniversities = useCallback(
    debounce(() => {
      if (pendingUpdates.current.size === 0) return;
      
      console.log(`Processing batch update for ${pendingUpdates.current.size} universities`);
      const universityIds = Array.from(pendingUpdates.current);
      
      // Clear pending updates
      pendingUpdates.current.clear();
      
      // Fetch data for all updated universities in one batch
      fetchUniversitiesBatch(universityIds);
    }, 1000), // 1s debounce for batching
    []
  );

  // Function to add university to pending updates
  const queueUniversityUpdate = useCallback((universityId: string) => {
    pendingUpdates.current.add(universityId);
    debouncedFetchUniversities();
  }, [debouncedFetchUniversities]);

  // Socket event handlers
  const handleStatusUpdate = useCallback((data: UniversityUpdateData) => {
    // Only process updates for current user
    if (data.user_email && data.user_email !== user?.email) return;
    
    // For subscription reactivation, do a full refresh
    if (data.status === 'subscription_reactivated') {
      console.log('Subscription reactivated, queuing full refresh');
      debouncedFetchDetails();
      return;
    }
    
    // For column processing or other updates, queue individual university update
    if (data.university_id) {
      console.log(`Queuing update for university ${data.university_id}`);
      queueUniversityUpdate(data.university_id);
    }
  }, [user?.email, debouncedFetchDetails, queueUniversityUpdate]);

  const handleDataUpdate = useCallback((data: any) => {
    // Only process updates for current user
    if (data.user_email !== user?.email) return;
    
    // Queue update for this university
    if (data.university_id) {
      queueUniversityUpdate(data.university_id);
    }
  }, [user?.email, queueUniversityUpdate]);

  const handleUserUpdate = useCallback((data: UserUpdateData) => {
    // Only process updates for current user
    if (data.user_email !== user?.email) return;
    
    if (data.type === 'processing_started') {
      // Mark universities as processing
      const universities = data.university_ids || [];
      setProcessingUniversities(new Set(universities));
      
      toast({
        title: "Processing Data",
        description: `Loading data for ${data.hidden_universities_count} previously hidden universities.`,
        duration: 5000
      });
    }
    else if (data.type === 'subscription_reactivated') {
      // Clear processing state when complete
      setProcessingUniversities(new Set());
      console.log('Received subscription reactivation event, refreshing data');
      debouncedFetchDetails();
      
      toast({
        title: "Premium Access Restored",
        description: `${data.hidden_universities_processed || 'All'} previously hidden universities are now visible with their data.`,
        duration: 5000
      });
    }
  }, [user?.email, debouncedFetchDetails]);

  // Connect to socket with optimized handlers
  useSocket(handleStatusUpdate, handleDataUpdate, handleUserUpdate);

  // Function to fetch data for a specific university
  const fetchUniversityData = async (universityId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      console.log(`Fetching fresh data for university ${universityId}`);
      
      // Get university details
      const uniResponse = await fetch(`${API_URL}/api/universities/${universityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!uniResponse.ok) {
        console.error(`Failed to fetch university ${universityId}`);
        return;
      }
      
      const university = await uniResponse.json();
      
      // Get column data for this university
      const columnDataResponse = await fetch(`${API_URL}/api/columns/data/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          university_ids: [universityId]
        })
      });
      
      if (!columnDataResponse.ok) {
        console.error(`Failed to fetch column data for university ${universityId}`);
        return;
      }
      
      const columnData = await columnDataResponse.json() as ColumnDataResponse;
      
      // Update this university in the state
      setSelectedUniversities(prev => {
        // Check if this university is already in the list
        const exists = prev.some(uni => uni.id === universityId);
        
        if (exists) {
          // Update existing university
          return prev.map(uni => 
            uni.id === universityId 
              ? { 
                  ...uni, 
                  ...university,
                  status: university.status || uni.status,
                  name: university.name || uni.name,
                  url: university.url || uni.url,
                  programs: university.programs || uni.programs,
                  // Add column data with proper typing
                  ...Object.entries(columnData[universityId] || {}).reduce<Record<string, string>>((acc, [colId, data]) => {
                    if (data && typeof data === 'object' && 'value' in data) {
                      acc[colId] = data.value;
                    }
                    return acc;
                  }, {})
                } 
              : uni
          );
        } else {
          // This is a newly visible university, add it to the list
          const newUni = {
            ...university,
            // Add column data with proper typing
            ...Object.entries(columnData[universityId] || {}).reduce<Record<string, string>>((acc, [colId, data]) => {
              if (data && typeof data === 'object' && 'value' in data) {
                acc[colId] = data.value;
              }
              return acc;
            }, {})
          };
          
          return [...prev, newUni];
        }
      });
      
      console.log(`Updated university ${universityId} data successfully`);
      
    } catch (error) {
      console.error(`Error updating university ${universityId} data:`, error);
    }
  };

  // Function to fetch a batch of universities at once
  const fetchUniversitiesBatch = async (universityIds: string[]) => {
    if (!universityIds.length) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      console.log(`Batch fetching data for ${universityIds.length} universities`);
      
      // Get column data for these universities in one request
      const columnDataResponse = await fetch(`${API_URL}/api/columns/data/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          university_ids: universityIds
        })
      });
      
      if (!columnDataResponse.ok) {
        console.error('Failed to fetch column data');
        return;
      }
      
      const columnData = await columnDataResponse.json();
      
      // Update universities with new data
      setSelectedUniversities(prev => {
        return prev.map(uni => {
          if (universityIds.includes(uni.id)) {
            const universityColumnData = columnData[uni.id] || {};
            
            // Convert to ExtendedUniversity type
            const updatedUni = { ...uni } as ExtendedUniversity;
            
            Object.entries(universityColumnData).forEach(([columnId, data]) => {
              if (data && typeof data === 'object' && 'value' in data && data.value) {
                updatedUni[columnId] = data.value;
              }
            });
            
            return updatedUni;
          }
          return uni;
        });
      });
      
      console.log(`Successfully updated ${universityIds.length} universities in batch`);
      
    } catch (error) {
      console.error('Error fetching universities batch:', error);
    }
  };

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
              selectedUniversities={user?.selected_universities || []}
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
      
      {hiddenUniversitiesCount > 0 && user?.subscription?.status === 'expired' && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800">
            Subscription Expired
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            You have {hiddenUniversitiesCount} hidden {hiddenUniversitiesCount === 1 ? 'university' : 'universities'} that will be visible when you upgrade to premium.
          </AlertDescription>
        </Alert>
      )}

      <NotionTable
        universities={selectedUniversities}
        isPremium={user?.is_premium || false}
        onRemoveUniversity={handleRemove}
        processingUniversities={processingUniversities}
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